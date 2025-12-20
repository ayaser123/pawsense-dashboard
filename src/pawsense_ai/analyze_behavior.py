import json
from feature_extraction import FeatureExtractor
from action_classification import recognize_action
import numpy as np

def analyze_behavior(results):
    """Generate detailed behavioral analysis for LLM processing"""
    
    extractor = FeatureExtractor(window_size=60)
    motion_history = []
    MOTION_BUFFER_SIZE = 5
    
    frame_actions = []
    action_metadata = {}
    
    print("Analyzing behavior...")
    
    for idx, result in enumerate(results):
        features, kpts_norm = extractor.update(result)
        
        if features is not None:
            action = recognize_action(features, kpts_norm)
            
            # Temporal filtering
            if action == "running":
                motion_history.append("running")
                if len(motion_history) > MOTION_BUFFER_SIZE:
                    motion_history.pop(0)
                if len(motion_history) < MOTION_BUFFER_SIZE:
                    action = "walking"
            else:
                motion_history = []
            
            # Store frame-by-frame data
            frame_actions.append({
                "frame": idx,
                "action": action,
                "velocity": float(features.get('avg_velocity', 0)),
                "tail_variance": float(features.get('tail_angle_variance', 0)),
                "is_tail_wagging": bool(features.get('tail_angle_variance', 0) > 9.0 and 
                                       features.get('tail_oscillation_count', 0) > 10),
                "centroid_vertical_velocity": float(features.get('centroid_vertical_velocity', 0)),
                "leg_angle_variance": float(features.get('leg_angle_variance', 0)),
            })
    
    # Analyze action segments and transitions
    action_segments = []
    current_action = None
    segment_start = 0
    
    for i, frame_data in enumerate(frame_actions):
        if frame_data['action'] != current_action:
            if current_action is not None:
                action_segments.append({
                    "action": current_action,
                    "start_frame": segment_start,
                    "end_frame": i - 1,
                    "duration_frames": i - segment_start,
                    "duration_seconds": (i - segment_start) / 30  # Assuming 30 fps
                })
            current_action = frame_data['action']
            segment_start = i
    
    # Don't forget the last segment
    if current_action is not None:
        action_segments.append({
            "action": current_action,
            "start_frame": segment_start,
            "end_frame": len(frame_actions) - 1,
            "duration_frames": len(frame_actions) - segment_start,
            "duration_seconds": (len(frame_actions) - segment_start) / 30
        })
    
    # Calculate statistics per action
    action_stats = {}
    for action_type in set(f['action'] for f in frame_actions):
        action_frames = [f for f in frame_actions if f['action'] == action_type]
        velocities = [f['velocity'] for f in action_frames]
        tail_wags = [f for f in action_frames if f['is_tail_wagging']]
        
        action_stats[action_type] = {
            "total_frames": len(action_frames),
            "percentage": f"{(len(action_frames) / len(frame_actions) * 100):.1f}%",
            "avg_velocity": f"{np.mean(velocities):.4f}",
            "velocity_range": f"{np.min(velocities):.4f} - {np.max(velocities):.4f}",
            "tail_wagging_frames": len(tail_wags),
            "tail_wagging_percentage": f"{(len(tail_wags) / len(action_frames) * 100):.1f}%"
        }
    
    # Generate behavior narrative
    total_frames = len(frame_actions)
    video_duration = total_frames / 30  # Assuming 30 fps
    
    behavior_summary = {
        "video_info": {
            "total_frames": total_frames,
            "duration_seconds": f"{video_duration:.1f}",
            "estimated_fps": 30
        },
        "action_statistics": action_stats,
        "action_timeline": action_segments,
        "frame_by_frame_data": frame_actions
    }
    
    return behavior_summary

def get_prompt_data(analysis):
    """Create a human-readable narrative for LLM analysis"""
    
    report = []
    report.append("=" * 80)
    report.append("DOG BEHAVIOR ANALYSIS REPORT")
    report.append("=" * 80)
    report.append("")
    
    # Video info
    info = analysis['video_info']
    report.append(f"Video Duration: {info['duration_seconds']} seconds ({info['total_frames']} frames @ {info['estimated_fps']} fps)")
    report.append("")
    
    # Action statistics summary
    report.append("ACTION SUMMARY:")
    report.append("-" * 80)
    for action, stats in analysis['action_statistics'].items():
        report.append(f"\n{action.upper()}:")
        report.append(f"  Frequency: {stats['total_frames']} frames ({stats['percentage']})")
        report.append(f"  Velocity: {stats['velocity_range']} (avg: {stats['avg_velocity']})")
        report.append(f"  Tail Wagging: {stats['tail_wagging_frames']} frames ({stats['tail_wagging_percentage']})")
    
    report.append("\n" + "=" * 80)
    report.append("BEHAVIORAL TIMELINE:")
    report.append("-" * 80)
    
    for i, segment in enumerate(analysis['action_timeline'], 1):
        time_str = f"{segment['duration_seconds']:.1f}s"
        frame_str = f"frames {segment['start_frame']}-{segment['end_frame']}"
        report.append(f"{i}. {segment['action'].upper()}: {time_str} ({frame_str})")
    
    report.append("\n" + "=" * 80)
    report.append("DETAILED OBSERVATIONS:")
    report.append("-" * 80)
    
    # Identify key behavioral patterns
    observations = []
    
    # Opening behavior
    first_segment = analysis['action_timeline'][0]
    observations.append(f"The dog begins with {first_segment['action']} behavior.")
    
    # Tail activity correlation
    for action, stats in analysis['action_statistics'].items():
        wag_pct = float(stats['tail_wagging_percentage'].rstrip('%'))
        if wag_pct > 50:
            observations.append(f"During {action}, the tail is wagging {wag_pct:.0f}% of the time (active, engaged behavior).")
        elif wag_pct > 0:
            observations.append(f"During {action}, the tail wags {wag_pct:.0f}% of the time (occasional engagement).")
    
    # Activity level
    walking_pct = float(analysis['action_statistics'].get('walking', {}).get('percentage', '0%').rstrip('%'))
    running_pct = float(analysis['action_statistics'].get('running', {}).get('percentage', '0%').rstrip('%'))
    rearing_pct = float(analysis['action_statistics'].get('rearing', {}).get('percentage', '0%').rstrip('%'))
    
    activity_level = walking_pct + running_pct
    if activity_level > 80:
        observations.append(f"High activity level: {activity_level:.0f}% of video spent moving (walking/running).")
    elif activity_level > 50:
        observations.append(f"Moderate activity level: {activity_level:.0f}% of video spent moving.")
    else:
        observations.append(f"Low activity level: {activity_level:.0f}% of video spent moving.")
    
    if rearing_pct > 0:
        observations.append(f"The dog exhibits rearing behavior ({rearing_pct:.0f}% of time), suggesting playfulness or alertness.")
    
    for obs in observations:
        report.append(f"\n• {obs}")
    
    report.append("\n" + "=" * 80)
    
    return "\n".join(report)

if __name__ == "__main__":
    # Generate analysis
    analysis = analyze_behavior()
    
    # Save as JSON for LLM processing
    with open("behavior_analysis.json", "w") as f:
        json.dump(analysis, f, indent=2)
    
    # Generate and print human-readable report
    report = get_prompt_data(analysis)
    print(report)
    
    # Save report
    with open("behavior_analysis.txt", "w") as f:
        f.write(report)
    
    print("\n✓ Analysis saved to:")
    print("  - behavior_analysis.json (structured data for LLM)")
    print("  - behavior_analysis.txt (human-readable report)")
