import os
import logging
from typing import Optional, Dict, Any
from openai import AsyncOpenAI
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
# Point to the .env file in the parent directory of backend/
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        """Initialize OpenAI service with API key from environment variables."""
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini"  # Using GPT-4o-mini as a reliable fallback/alternative if gpt-5-nano behaves unexpectedly
        
        # Sleep coach system prompt optimized for the sleep assistant
        self.system_prompt = """You are a gentle, empathetic sleep coach and wellness assistant. Your role is to help users relax, unwind, and prepare for restful sleep. You should:

- Provide calming, soothing responses
- Offer practical sleep hygiene tips and relaxation techniques
- Use a warm, understanding tone
- For regular conversations, keep responses concise but helpful (2-3 sentences)
- Focus on immediate comfort and relaxation
- Suggest breathing exercises, progressive muscle relaxation, or mindfulness techniques when appropriate
- Avoid stimulating topics or complex discussions
- If users seem anxious or stressed, acknowledge their feelings and guide them toward calming activities

IMPORTANT TEXT FORMATTING RULES:
- NEVER use emojis, special characters, or symbols in your responses
- Avoid quotation marks, asterisks, parentheses, or other punctuation that might interfere with text-to-speech
- Use only letters, numbers, basic punctuation (periods, commas), and spaces
- Write in clear, simple sentences that flow naturally when spoken aloud

STORYTELLING MODE: When users ask for stories, bedtime stories, or visualizations:
- IMMEDIATELY begin the story without any preamble, introduction, or "Here's a story..." 
- Start directly with immersive scene-setting
- Use present tense and second person ("You find yourself...")
- Create vivid, peaceful imagery that engages the senses
- Include gentle sounds, soft textures, warm lighting, and calming scents
- Guide the listener through a slow, meandering journey
- Build in natural pauses and breathing moments
- End with the listener settling into a comfortable, safe space ready for sleep
- Keep stories between 3-5 minutes when read aloud
- Focus on themes of safety, warmth, comfort, and tranquility
- Avoid any conflict, tension, or stimulating elements

Remember: Create diverse, unique stories each time. Never repeat the same setting or characters. Make each story a completely different peaceful journey that guides the listener naturally toward sleep."""

    async def generate_response(self, user_message: str, conversation_history: Optional[list] = None) -> str:
        """
        Generate a response using OpenAI GPT-5-nano-thinking
        
        Args:
            user_message: The user's input message
            conversation_history: Optional list of previous messages for context
            
        Returns:
            Generated response text
        """
        try:
            # Build messages array
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Add conversation history if provided
            if conversation_history:
                # Trim to last few turns to reduce latency and cost
                max_history = 6
                messages.extend(conversation_history[-max_history:])

            # Add current user message
            messages.append({"role": "user", "content": user_message})

            logger.info(f"Sending request to OpenAI GPT-5 Nano with {len(messages)} messages")

            # Make the API call using the standard chat completions API
            # Keep token budget reasonable to improve latency
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_completion_tokens=650
            )
            
            # Extract the response text
            # GPT-5 Nano might return content differently or require checking different fields
            # For standard chat completions:
            message_content = response.choices[0].message.content
            if message_content:
                response_text = message_content.strip()
            else:
                # Fallback if content is empty (sometimes happens with specific stop sequences or filters)
                logger.warning("OpenAI returned empty content")
                response_text = "I'm listening. Please go on."
            
            logger.info(f"Received response from OpenAI: {len(response_text)} characters")
            return response_text
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            print(f"❌ CRITICAL OPENAI ERROR (CHAT): {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            # Return a fallback response
            return self._get_fallback_response()
    
    async def generate_sleep_routine(self, user_preferences: str) -> str:
        """
        Generate a personalized sleep routine based on user preferences.
        
        Args:
            user_preferences: User's preferences and needs for the sleep routine
            
        Returns:
            Generated sleep routine text
        """
        try:
            routine_prompt = f"""Create a deeply relaxing, personalized sleep experience based on these preferences: {user_preferences}

Select the single best format (Story, Meditation, or Affirmations) that matches the user's needs.

GUIDELINES FOR GENERATION:
- Write a continuous, fluid script designed to be read aloud.
- Use hypnotic, rhythmic language patterns that naturally slow down the listener's breathing.
- Focus on sensory details (warmth, heaviness, soft sounds, gentle light).
- Use ellipses (...) to indicate slow pacing and natural pauses, rather than explicit instructions.
- Avoid all headers, labels, or stage directions (like "Narrator:" or "[Pause]").
- Start directly with the experience. Do not say "Here is your routine" or "Let's begin."
- The tone should be unconditionally accepting, safe, and incredibly soothing.

FORMATTING:
- No bold text, no bullet points, no numbered lists.
- Just pure, flowing text broken into short, digestible paragraphs.
- Length: Approximately 300-400 words (about 3-4 minutes of spoken time).

CONTENT STRUCTURE:
1. Gentle Induction: Briefly guide the user to settle into their body and bed.
2. The Core Experience: The main story, visualization, or meditation based on their preferences.
3. Deepening: Gradually transition from the experience into a state of heavy, drifting sleepiness.
4. Drift Off: End with a final, fading suggestion for deep sleep, trailing off gently..."""

            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": routine_prompt}
            ]
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_completion_tokens=1200
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API error in sleep routine generation: {str(e)}")
            print(f"❌ CRITICAL OPENAI ERROR (ROUTINE): {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return self._get_fallback_routine()
    
    def _get_fallback_response(self) -> str:
        """Return a fallback response when OpenAI API is unavailable."""
        fallback_responses = [
            "I'm here with you. Take a deep breath and let your body relax. Sometimes the best thing we can do is simply focus on the present moment.",
            "Let's focus on what we can control right now - your breathing. Try breathing in slowly for 4 counts, then out for 6 counts.",
            "I understand you're seeking some guidance tonight. Remember that rest is important, and you deserve peaceful sleep. Try to release any tension in your shoulders and jaw.",
            "Even when things feel uncertain, your body knows how to rest. Let's create a calm space together. What usually helps you feel most relaxed?"
        ]
        import random
        return random.choice(fallback_responses)
    
    def _get_fallback_routine(self) -> str:
        """Return a fallback sleep routine when OpenAI API is unavailable."""
        return """Let's begin your personalized sleep routine. Find a comfortable position and take a deep breath.

First, let's prepare your space. Dim the lights and ensure your room is at a comfortable temperature. Take a moment to put away any devices or distractions.

Now, let's start with some gentle breathing. Breathe in slowly through your nose for four counts. Hold for two counts. Breathe out through your mouth for six counts. Repeat this pattern three more times.

Next, we'll do some progressive muscle relaxation. Starting with your toes, tense them for five seconds, then release. Feel the tension melt away. Move up to your calves, tense and release. Continue this pattern through your thighs, abdomen, hands, arms, shoulders, and face.

Finally, let your mind settle. Imagine yourself in a peaceful place where you feel completely safe and relaxed. Focus on the gentle sounds and sensations of this place. Allow your breathing to become natural and easy.

Rest well tonight. You deserve peaceful, restorative sleep."""

    async def check_health(self) -> Dict[str, Any]:
        """Check if the OpenAI service is healthy and accessible."""
        try:
            # Make a simple test request
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Hello"}],
                max_completion_tokens=16
            )
            
            return {
                "status": "healthy",
                "model": self.model,
                "api_accessible": True,
                "message": "OpenAI service is operational"
            }
        except Exception as e:
            logger.error(f"OpenAI health check failed: {str(e)}")
            return {
                "status": "error",
                "model": self.model,
                "api_accessible": False,
                "message": f"OpenAI service error: {str(e)}"
            }

# Global instance
openai_service = None

def get_openai_service() -> OpenAIService:
    """Get or create the global OpenAI service instance."""
    global openai_service
    if openai_service is None:
        openai_service = OpenAIService()
    return openai_service

def initialize_openai_service() -> bool:
    """Initialize the OpenAI service and return success status."""
    try:
        global openai_service
        openai_service = OpenAIService()
        logger.info("✅ OpenAI service initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to initialize OpenAI service: {str(e)}")
        return False
