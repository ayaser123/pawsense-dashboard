def recognize_action(features, keypoints_norm):
    """
    features: dict of angles, bbox info, and motion metrics
    keypoints_norm: normalized keypoints centered on box
    """

    if features is None or keypoints_norm is None:
        return "unknown"
        
    # --- Thresholds ---
    VELOCITY_THRESHOLD_IDLE = 0.05  # Much higher - only truly moving dogs exceed this
    VELOCITY_THRESHOLD_WALK = 0.15  # Walking threshold (higher to distinguish from running)
    JUMP_VELOCITY_THRESHOLD = -0.015 
    REAR_FRONT_VELOCITY_THRESHOLD = -0.005  # Lowered threshold for rearing detection
    TAIL_VARIANCE_THRESHOLD = 9.0  # Threshold for tail wagging (std dev of tail angle)
    TAIL_OSCILLATION_THRESHOLD = 25  # Min oscillations in window to indicate wagging
    LEG_STRIDE_THRESHOLD = 15.0  # Variance in leg angles - high indicates running
    
    avg_vel = features.get('avg_velocity', 0)
    centroid_vy = features.get('centroid_vertical_velocity', 0)
    front_vy = features.get('front_paws_vertical_velocity', 0)
    tail_variance = features.get('tail_angle_variance', 0)
    tail_oscillations = features.get('tail_oscillation_count', 0)
    leg_stride_var = features.get('leg_angle_variance', 0)
    
    fl_angle = features['front_left_leg_angle']
    fr_angle = features['front_right_leg_angle']
    rl_angle = features['rear_left_leg_angle']
    rr_angle = features['rear_right_leg_angle']
    bbox_h = features['bbox_height']
    bbox_w = features['bbox_width']
    
    height_ratio = bbox_h / (bbox_w + 1e-6)
    front_paws_y = (keypoints_norm[0][1] + keypoints_norm[6][1]) / 2 
    rear_paws_y = (keypoints_norm[3][1] + keypoints_norm[9][1]) / 2  
    
    # Check for rearing pose: front paws much higher than rear paws
    paw_height_diff = rear_paws_y - front_paws_y  # Positive means rear paws are lower

    # --- 1. Determine Dynamic High-Priority Actions ---
    if centroid_vy < JUMP_VELOCITY_THRESHOLD:
        return "jumping"
    
    # Rearing: detect either by motion (velocity) OR by pose (front paws very high)
    if front_vy < REAR_FRONT_VELOCITY_THRESHOLD or paw_height_diff > 0.3:
        return "rearing"
        
    # --- 2. Determine Motion State ---
    motion = "idle"
    if avg_vel > VELOCITY_THRESHOLD_IDLE:
        # Use both velocity AND leg stride patterns to distinguish walking from running
        # Running: high velocity + high leg angle variance (rapid strides)
        # Walking: moderate velocity + lower leg angle variance
        if avg_vel > VELOCITY_THRESHOLD_WALK and leg_stride_var > LEG_STRIDE_THRESHOLD:
            motion = "running"  # Both high velocity AND rapid strides
        else:
            motion = "walking"
        
    # --- 3. Determine Primary Pose (Only relevant if Idle) ---
    pose = "unknown"
    # Detect tail wagging: both variance AND oscillation count should be high
    is_tail_wagging = (tail_variance > TAIL_VARIANCE_THRESHOLD and 
                       tail_oscillations > TAIL_OSCILLATION_THRESHOLD)
    
    if motion == "idle":
        if (rl_angle < 70 or rr_angle < 70) and fl_angle > 60 and fr_angle > 60:
            pose = "sitting"
        elif rl_angle > 80 and rr_angle > 80 and fl_angle > 80 and fr_angle > 80:
            pose = "standing"
        elif rl_angle > 80 and rr_angle > 80 and (rear_paws_y + abs(front_paws_y)) > 0.6 and height_ratio > 1.5:
            pose = "standing_on_two_legs"
        elif rl_angle < 40 and rr_angle < 40 and fl_angle < 50 and fr_angle < 50:
            pose = "lying"

    # --- 4. Construct Label ---
    if motion != "idle":
        return motion
    
    # If idle, add tail wagging info to pose
    if pose == "unknown":
        return "idle"
    else:
        if is_tail_wagging:
            return f"{pose}_wagging"
        else:
            return pose

