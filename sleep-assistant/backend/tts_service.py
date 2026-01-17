import os
import time
import tempfile
import uuid
import json
import requests
import certifi
from typing import Optional, Dict, Any

# Load environment variables if available
try:
    from dotenv import load_dotenv
    from pathlib import Path
    
    # Point to the .env file in the parent directory of backend/
    BASE_DIR = Path(__file__).resolve().parent.parent
    env_path = BASE_DIR / '.env'
    load_dotenv(dotenv_path=env_path)
except Exception:
    pass

class UnrealTTSService:
    """
    Text-to-Speech service using Unreal Speech API.
    Generates MP3 audio quickly for the sleep assistant.
    """

    def __init__(self):
        self.api_key = None
        self.is_initialized = False
        self.default_voice = "Emily"  # Use Emily as requested
        self.endpoint = "https://api.v8.unrealspeech.com/stream"

    def initialize(self) -> bool:
        """
        Initialize the Unreal Speech TTS service.
        Returns True if successful, False otherwise.
        """
        try:
            self.api_key = os.getenv("UNREAL_API_KEY")
            if not self.api_key:
                print("❌ UNREAL_API_KEY is not set in environment. Please add it to your .env file.")
                self.is_initialized = False
                return False

            self.is_initialized = True
            print("✅ Unreal Speech TTS Service initialized successfully!")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize Unreal Speech TTS Service: {e}")
            return False

    def text_to_speech(self, text: str, speaker_name: str = "Speaker 1") -> Optional[Dict[str, Any]]:
        """
        Convert text to speech using Unreal Speech.

        Args:
            text: The text to convert to speech (up to 1000 characters recommended for stream endpoint)
            speaker_name: Unused here; kept for API compatibility

        Returns:
            Dictionary with audio file path and metadata, or None if failed
        """
        if not self.is_initialized:
            print("❌ TTS Service not initialized. Call initialize() first.")
            return None

        if not text or not text.strip():
            print("❌ Empty text provided to TTS")
            return None

        try:
            # Supported Unreal Speech voices
            supported_voices = {
                "Autumn", "Melody", "Hannah", "Emily", "Ivy", "Kaitlyn", "Luna", "Willow", "Lauren", "Sierra",
                "Noah", "Jasper", "Caleb", "Ronan", "Ethan", "Daniel", "Zane",
                "Mei", "Lian", "Ting", "Jing",
                "Wei", "Jian", "Hao", "Sheng",
                "Lucía",
                "Mateo", "Javier",
                "Élodie",
                "Ananya", "Priya",
                "Arjun", "Rohan",
                "Giulia",
                "Luca",
                "Camila",
                "Thiago", "Rafael"
            }

            voice_id = self.default_voice
            if speaker_name and isinstance(speaker_name, str):
                # Trim and capitalize appropriately
                candidate = speaker_name.strip()
                if candidate in supported_voices:
                    voice_id = candidate

            # Prepare request payload
            payload = {
                "Text": text[:1000],
                "VoiceId": voice_id,
                "Bitrate": "192k",
                "Pitch": 1.0,
                "Speed": 0.0,
            }

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            start_time = time.time()
            resp = requests.post(self.endpoint, headers=headers, json=payload, timeout=30, verify=certifi.where())
            resp.raise_for_status()
            audio_bytes = resp.content
            generation_time = time.time() - start_time

            # Save MP3 to temporary file
            audio_id = str(uuid.uuid4())
            temp_dir = tempfile.gettempdir()
            output_path = os.path.join(temp_dir, f"tts_{audio_id}.mp3")
            with open(output_path, "wb") as f:
                f.write(audio_bytes)

            result = {
                "audio_path": output_path,
                "audio_id": audio_id,
                "duration": None,  # Duration unknown without decoding MP3
                "generation_time": generation_time,
                "real_time_factor": None,
                "sample_rate": None,
                "text": text,
                "speaker": self.default_voice,
            }

            print("✅ Unreal Speech audio generated successfully!")
            print(f"   Saved to: {output_path}")
            return result

        except Exception as e:
            print(f"❌ Failed to generate speech via Unreal Speech: {e}")
            return None


# Global TTS service instance
_tts_service = None

def get_tts_service() -> UnrealTTSService:
    """Get the global TTS service instance, initializing if necessary."""
    global _tts_service
    if _tts_service is None:
        _tts_service = UnrealTTSService()
    return _tts_service

def initialize_tts_service() -> bool:
    """Initialize the TTS service and return success status."""
    service = get_tts_service()
    return service.initialize()