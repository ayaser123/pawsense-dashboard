"""
FastAPI application for PawSense AI
Provides endpoint for behavior analysis
"""

import logging
import uvicorn
import os

from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from end_to_end_pipeline import run_pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PawSense AI API",
    description="Video analysis API for pet behavior and wellbeing assessment",
    version="1.0.0"
)



# ============================================================================
# Inference Request Schema
# ============================================================================

class AnalyzeBehaviorRequest(BaseModel):
    """Request model for the /analyze-behavior endpoint"""
    video_path: str


# ============================================================================
# Endpoints
# ============================================================================

@app.post("/analyze-behavior")
def analyze_behavior(request: AnalyzeBehaviorRequest) -> JSONResponse:
    """
    Analyze pet behavior from a video file.
    
    This endpoint:
    1. Receives a video path from the MERN backend
    2. Runs the complete pipeline (inference → feature extraction → action classification → LLM analysis)
    3. Returns both raw computer vision stats and LLM analysis
    
    Args:
        request: Contains video_path string
        
    Returns:
        JSONResponse with structure:
        {

        }
    
    Raises:
        HTTPException: If video not found, pipeline fails, or LLM analysis errors
    """

    try:
        logger.info(f"Processing video: {request.video_path}")
        

        # Run the complete pipeline
        llm_result = run_pipeline(request.video_path)
        


        
        logger.info(f"Successfully analyzed video: {request.video_path}")
        return JSONResponse(content=llm_result)
        
    except FileNotFoundError as e:
        logger.error(f"Video file not found: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        logger.error(f"LLM API error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.error(f"Pipeline error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during analysis")


@app.post("/example")
def example() -> JSONResponse:
    """
    Returns a mock response with the identical structure to /analyze-behavior.
    
    Useful for testing the MERN backend integration without running inference.
    
    Returns:
        JSONResponse with mock llm_analysis and raw_stats
    """
    mock_response = {
        "emotional_states": [
            {
                "emotion": "Engaged",
                "confidence": 0.85
            },
            {
                "emotion": "Anxious",
                "confidence": 0.30
            },
            {
                "emotion": "Playful",
                "confidence": 0.40
            },
            {
                "emotion": "Relaxed",
                "confidence": 0.80
            }
        ],
        "behavior_patterns": [
            "Tail Wagging Dominates",
            "Varied Engagement Levels Detected",
            "Low Activity Observed"
        ],
        "recommendations": [
            "Increase Playtime to Boost Engagement",
            "Monitor Anxious Behaviors to Improve Relaxation Techniques",
            "Maintain Consistent Daily Routine"
        ],
        "overall_wellbeing_score": 82.5
    }
    
    logger.info("Returning mock response from /example endpoint")
    return JSONResponse(content=mock_response)

# ============================================================================
# Health Check
# ============================================================================

@app.get("/health")
def health_check() -> JSONResponse:
    """
    Simple health check endpoint for the API.
    
    Returns:
        JSONResponse: Status of the API
    """
    return JSONResponse(content={"status": "healthy", "service": "PawSense AI API"})


if __name__ == "__main__":
    uvicorn.run(app, host=os.environ.get("API_HOST"), port=os.environ.get("API_PORT"))
