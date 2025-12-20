"""
End-to-End Pipeline Function

This module provides a single function that orchestrates the complete pipeline:
video_path → inference → feature extraction → action classification → behavior analysis → LLM analysis

Usage:
    from end_to_end_pipeline import run_pipeline
    
    result = run_pipeline("path/to/video.mp4")
    print(result)  # Returns LLM analysis as dictionary
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv
load_dotenv()

# Import existing modules
from inference import infer
from analyze_behavior import analyze_behavior, get_prompt_data
from llm_analyzer import analyze

print("test")

def run_pipeline(video_path: str) -> Dict[str, Any]:
    """
    Complete end-to-end pipeline: video → LLM analysis
    
    Args:
        video_path (str): Path to input video file
        
    Returns:
        Dict[str, Any]: LLM analysis response containing emotional states,
                       behavior patterns, recommendations, and wellbeing score
                       
    Raises:
        FileNotFoundError: If video file doesn't exist
        RuntimeError: If inference or analysis fails
        ValueError: If LLM API key not configured
    """
    
    # ====== STEP 1: INFERENCE (Pose Detection) ======
    print(f"[1/4] Running YOLO inference on {video_path}...")
   
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")
    
    try:
        results = infer(video_path)
    except Exception as e:
        raise RuntimeError(f"Inference failed: {e}")
    
    if results is None or len(results) == 0:
        raise RuntimeError("No inference results returned")
    
    print(f"   ✓ Inference complete ({len(results)} frames)")
    
    
    # ====== STEP 2: BEHAVIOR ANALYSIS ======
    print("[2/4] Generating behavior analysis...")
    
    try:
        # Use analyze_behavior_internal to get raw analysis
        behavior_dict = analyze_behavior(results)
    except Exception as e:
        raise RuntimeError(f"Behavior analysis failed: {e}")
    
    if behavior_dict is None:
        raise RuntimeError("Behavior analysis returned None")
    
    print(f"   ✓ Analysis complete ({behavior_dict['video_info']['total_frames']} frames)")
    
    
    # ====== STEP 3: PREPARE FOR LLM ======
    print("[3/4] Preparing data for LLM analysis...")
    
    try:
        prompt_data = get_prompt_data(behavior_dict)
    
    except Exception as e:
        raise RuntimeError(f"Failed to prepare LLM input: {e}")
    
    print("   ✓ Data prepared for LLM")
    
    
    # ====== STEP 4: LLM ANALYSIS ======
    print("[4/4] Running LLM analysis (Groq)...")
    
    try:
        llm_result = analyze(prompt_data)
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise RuntimeError(f"LLM analysis failed: {e}")
    
    if llm_result is None:
        raise RuntimeError("LLM analysis returned None")
    
    print("   ✓ LLM analysis complete")
    
    
    # ====== SUCCESS ======
    print("\n✓ PIPELINE COMPLETE")
    print(f"  Wellbeing Score: {llm_result.get('overall_wellbeing_score', 'N/A')}")
    
    return llm_result

    
if __name__ == "__main__":
    run_pipeline("puppy2.mp4")