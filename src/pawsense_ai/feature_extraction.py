import numpy as np
import torch


def _process_result(result):

    img_w, img_h = result.orig_shape
    keypoints = result.keypoints
    if keypoints.xy.size()[0] == 0:
        return None, None
    keypoints_xy = keypoints.xy[0]  # shape [24,2]
    box_xywh = result.boxes.xywh[0]
    cx, cy, w, h = box_xywh
    bbox_norm = torch.tensor([cx/img_w, cy/img_h, w/img_w, h/img_h])
    keypoints_norm = (keypoints_xy - torch.tensor([cx, cy])) / torch.tensor([w, h])
    
    # print(keypoints_norm)

    return keypoints_norm, bbox_norm


def _compute_angle(a, b, c):
    ba = a - b
    bc = c - b
    cos_theta = np.dot(ba, bc) / (np.linalg.norm(ba)*np.linalg.norm(bc)+1e-6)
    return np.degrees(np.arccos(np.clip(cos_theta, -1.0, 1.0)))

def _extract_semantic_features(result):

        kpts_norm, bbox_norm = _process_result(result)

        if kpts_norm is None:
            return None, None

        # Example: kpts_norm [24,2], bbox_norm = [cx/img_w, cy/img_h, w/img_w, h/img_h]
        features = {}
        
        # Leg angles
        features['front_left_leg_angle'] = _compute_angle(kpts_norm[0], kpts_norm[1], kpts_norm[2])
        features['front_right_leg_angle'] = _compute_angle(kpts_norm[6], kpts_norm[7], kpts_norm[8])
        features['rear_left_leg_angle'] = _compute_angle(kpts_norm[3], kpts_norm[4], kpts_norm[5])
        features['rear_right_leg_angle'] = _compute_angle(kpts_norm[9], kpts_norm[10], kpts_norm[11])
        
        # Tail angle
        features['tail_angle'] = _compute_angle(kpts_norm[13], kpts_norm[12], kpts_norm[22])  # tail_end, tail_start, withers
        
        # Body distances
        features['paw_distance_front'] = np.linalg.norm(kpts_norm[0] - kpts_norm[6])
        features['paw_distance_rear'] = np.linalg.norm(kpts_norm[3] - kpts_norm[9])
        features['body_length'] = np.linalg.norm(kpts_norm[22] - kpts_norm[13])  # withers to tail_end
        features['head_width'] = np.linalg.norm(kpts_norm[20] - kpts_norm[21])  # eyes
        
        # Bbox info
        features['bbox_width'] = bbox_norm[2]
        features['bbox_height'] = bbox_norm[3]
        
        return features, kpts_norm

class FeatureExtractor:
    def __init__(self, window_size=60):
        self.window_size = window_size
        self.history_buffer = []  # List of (kpts_norm, bbox_norm)
    

    def update(self, result):
        # 1. Extract static features and current normalized data
        features, kpts_norm = _extract_semantic_features(result)
        
        if kpts_norm is None:
            return features, kpts_norm
            
        # 2. Update buffer
        kpts_flat = kpts_norm.numpy() # Convert to numpy for easier calc
        # We need bbox_norm too, let's allow _extract_semantic_features to return it or extract again
        # To avoid changing _extract_semantic_features signature too much, let's just re-extract here briefly or modify _extract_semantic_features to return it.
        # Looking at _extract_semantic_features, it calls _process_result. Let's call _process_result directly to get bbox.
        _, bbox_norm_tensor = _process_result(result)
        bbox_flat = bbox_norm_tensor.numpy()
        
        self.history_buffer.append((kpts_flat, bbox_flat))
        if len(self.history_buffer) > self.window_size:
            self.history_buffer.pop(0)
            
        # 3. Compute Motion Features if buffer has enough data
        if len(self.history_buffer) >= 2:
            self._compute_motion_features(features)
        else:
            # Default values for first few frames
            features['avg_velocity'] = 0.0
            features['tail_angle_variance'] = 0.0
            features['centroid_vertical_velocity'] = 0.0
            features['front_paws_vertical_velocity'] = 0.0
            
        return features, kpts_norm
    

    def _compute_motion_features(self, features):
        # Extract sequences
        kpts_seq = np.array([item[0] for item in self.history_buffer]) # [T, 24, 2]
        bbox_seq = np.array([item[1] for item in self.history_buffer]) # [T, 4] (cx, cy, w, h)
        
        # --- General Motion ---
        # Displacement between successive frames
        diffs = np.linalg.norm(kpts_seq[1:] - kpts_seq[:-1], axis=2) # [T-1, 24]
        avg_velocity = np.mean(diffs) # Average movement of all keypoints
        features['avg_velocity'] = avg_velocity
        
        # --- Tail Wagging ---
        # Track tail angle variance over window. 
        # We need to re-compute angles for previous frames or store them. 
        # Re-computing is safer than storing potentially huge dicts.
        tail_angles = []
        for i in range(len(kpts_seq)):
            # indexes: 13=tail_end, 12=tail_start, 22=withers
            kp = kpts_seq[i]
            angle = _compute_angle(kp[13], kp[12], kp[22])
            tail_angles.append(angle)
        tail_angles = np.array(tail_angles)
        
        # Use std deviation instead of var for more intuitive threshold
        features['tail_angle_variance'] = np.std(tail_angles)
        features['tail_oscillation_count'] = self._count_peaks(tail_angles)
        
        # --- Jumping ---
        # Vertical velocity of centroid (bbox[1] is cy). Positive y is down in image coords usually, 
        # so negative diff means moving UP.
        centroid_y_seq = bbox_seq[:, 1]
        vertical_diffs = centroid_y_seq[1:] - centroid_y_seq[:-1]
        # Average vertical velocity over last few frames
        features['centroid_vertical_velocity'] = np.mean(vertical_diffs)
        
        # --- Rearing (Front paws vs Rear paws vertical movement) ---
        # Front paws: 0 and 6 (left/right). Rear paws: 3 and 9.
        # Average Y position of front paws
        front_paws_y = (kpts_seq[:, 0, 1] + kpts_seq[:, 6, 1]) / 2
        rear_paws_y = (kpts_seq[:, 3, 1] + kpts_seq[:, 9, 1]) / 2
        
        features['front_paws_vertical_velocity'] = np.mean(front_paws_y[1:] - front_paws_y[:-1])
        features['rear_paws_vertical_velocity'] = np.mean(rear_paws_y[1:] - rear_paws_y[:-1])
        
        # --- Idle Stability ---
        # Variance of body center
        features['bbox_center_variance'] = np.var(bbox_seq[:, :2], axis=0).mean()
        
        # --- Leg Stride Pattern (for running vs walking detection) ---
        # Compute leg angle changes over time
        leg_angles_seq = []
        for i in range(len(kpts_seq)):
            kp = kpts_seq[i]
            fl = _compute_angle(kp[0], kp[1], kp[2])
            fr = _compute_angle(kp[6], kp[7], kp[8])
            rl = _compute_angle(kp[3], kp[4], kp[5])
            rr = _compute_angle(kp[9], kp[10], kp[11])
            leg_angles_seq.append([fl, fr, rl, rr])
        
        leg_angles_seq = np.array(leg_angles_seq)
        
        # Compute variance in leg angles - high variance indicates rapid strides (running)
        # Low variance indicates steady walking
        features['leg_angle_variance'] = np.var(leg_angles_seq, axis=0).mean()  # Average variance across all legs
        
        # Also compute the rate of change of leg angles (stride frequency)
        leg_angle_diffs = np.abs(leg_angles_seq[1:] - leg_angles_seq[:-1])  # [T-1, 4]
        features['leg_angle_change_rate'] = np.mean(leg_angle_diffs)  # Average change per frame

    def _count_peaks(self, values):
        if len(values) < 3:
            return 0
        peaks = 0
        # Simple local maxima/minima
        for i in range(1, len(values) - 1):
            if values[i] > values[i-1] and values[i] > values[i+1]:
                peaks += 1
            elif values[i] < values[i-1] and values[i] < values[i+1]:
                peaks += 1 # counting reversals/extremas
        return peaks






    
