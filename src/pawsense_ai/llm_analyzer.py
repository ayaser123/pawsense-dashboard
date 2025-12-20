import json
import re
from groq import Groq
from typing import Dict, Any
import os

client = Groq()

def build_prompt(prompt_data) -> str:
        """Build optimized prompt for behavior analysis."""
        
        prompt = f"""Analyze the following video behavior data and provide ONLY:
1. Emotional state (happy, anxious, calm, playful, etc.) with confidence score
2. Key behavior patterns observed
4. Health and wellbeing insights
5. Actionable recommendations


{prompt_data}


RESPOND IN THIS EXACT JSON FORMAT (valid JSON only, no markdown):
{{
    "emotional_states": [
        {{
            "emotion": "emotion name",
            "confidence": X.XX
        }}
    ],
    "behavior_patterns": [
        "pattern 1",
        "pattern 2",
        "pattern 3"
    ],
    
    "recommendations": [
        "recommendation 1",
        "recommendation 2",
        "recommendation 3"
    ],

    "overall_wellbeing_score": XX.X
}}

Important:
- Ensure all confidence scores are between 0 and 1
- Behaviour patterns and recommendations must be 4-5 words max.
- Wellbeing score should be 0-100
- No explanations
- Output must be directly parsable by json.loads()
- Consider tail wagging as a positive engagement indicator
- Provide actionable, specific recommendations"""

        return prompt
    

def analyze(prompt_data) -> Dict[str, Any]:

    system_prompt = '''You are an expert dog behavior analyst who will reply in VALID JSON ONLY.
    - Only output valid JSON
- No trailing commas 
- Use double quotes for all keys and strings
- No comments
- No markdown'''
    user_prompt = build_prompt(prompt_data)
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt,
            }
        ],
        model=os.environ.get("LLM_MODEL"),
    )

    
    raw_json_string = chat_completion.choices[0].message.content
    print(raw_json_string)

    clean_json = re.sub(r',(\s*[\]}])', r'\1', raw_json_string)
    response = json.loads(clean_json)

    return response
 
