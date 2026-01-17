from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import tempfile
import asyncio
import requests
import time
from typing import Optional, Dict, Any, List
import uvicorn
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from tts_service import get_tts_service, initialize_tts_service
from openai_service import get_openai_service, initialize_openai_service

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Sleep Assistant TTS API", version="1.0.0")

# Set up Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now to fix deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class TTSRequest(BaseModel):
    text: str
    speaker_name: Optional[str] = "Speaker 1"

class TTSResponse(BaseModel):
    success: bool
    audio_id: Optional[str] = None
    audio_url: Optional[str] = None
    duration: Optional[float] = None
    generation_time: Optional[float] = None
    real_time_factor: Optional[float] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    tts_initialized: bool
    openai_initialized: bool
    message: str

# OpenAI request/response models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    success: bool
    response: Optional[str] = None
    error: Optional[str] = None

class SleepRoutineRequest(BaseModel):
    preferences: str

class SleepRoutineResponse(BaseModel):
    success: bool
    routine: Optional[str] = None
    error: Optional[str] = None

class BreathingSessionRequest(BaseModel):
    technique_id: str
    technique_name: str
    cycles_completed: int
    total_duration_seconds: float
    session_date: str

class BreathingSessionResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None

# Global state
tts_initialized = False
openai_initialized = False

async def periodic_cleanup():
    """Run cleanup task periodically."""
    while True:
        try:
            cleanup_old_audio_files()
        except Exception as e:
            print(f"❌ Cleanup task error: {e}")
        # Run every hour
        await asyncio.sleep(3600)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    global tts_initialized, openai_initialized
    print("🚀 Starting Sleep Assistant API...")
    
    # Initialize TTS service in background
    def init_tts():
        global tts_initialized
        tts_initialized = initialize_tts_service()
        if tts_initialized:
            print("✅ TTS Service ready!")
        else:
            print("❌ TTS Service failed to initialize")
    
    # Initialize OpenAI service
    def init_openai():
        global openai_initialized
        openai_initialized = initialize_openai_service()
        if openai_initialized:
            print("✅ OpenAI Service ready!")
        else:
            print("❌ OpenAI Service failed to initialize")
    
    # Run initialization in background to avoid blocking startup
    asyncio.create_task(asyncio.to_thread(init_tts))
    asyncio.create_task(asyncio.to_thread(init_openai))
    
    # Start periodic cleanup
    asyncio.create_task(periodic_cleanup())

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    both_ready = tts_initialized and openai_initialized
    status = "healthy" if both_ready else "initializing"
    
    if both_ready:
        message = "All services are ready"
    elif tts_initialized and not openai_initialized:
        message = "TTS ready, OpenAI initializing..."
    elif openai_initialized and not tts_initialized:
        message = "OpenAI ready, TTS initializing..."
    else:
        message = "Services are initializing..."
    
    return HealthResponse(
        status=status,
        tts_initialized=tts_initialized,
        openai_initialized=openai_initialized,
        message=message
    )

@app.post("/api/tts", response_model=TTSResponse)
@limiter.limit("5/minute")
async def text_to_speech(request: Request, body: TTSRequest):
    """
    Convert text to speech using Unreal Speech.
    Rate limited to 5 requests per minute per IP.
    """
    if not tts_initialized:
        raise HTTPException(
            status_code=503, 
            detail="TTS service is not initialized yet. Please wait and try again."
        )
    
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if len(body.text) > 10000:
        raise HTTPException(status_code=400, detail="Text is too long (max 10000 characters)")
    
    try:
        # Get TTS service and generate audio
        tts_service = get_tts_service()
        result = await asyncio.to_thread(
            tts_service.text_to_speech, 
            body.text, 
            body.speaker_name
        )
        
        if result is None:
            return TTSResponse(
                success=False,
                error="Failed to generate audio"
            )
        
        # Create audio URL
        audio_url = f"/api/audio/{result['audio_id']}"
        
        return TTSResponse(
            success=True,
            audio_id=result['audio_id'],
            audio_url=audio_url,
            duration=result['duration'],
            generation_time=result['generation_time'],
            real_time_factor=result['real_time_factor']
        )
        
    except Exception as e:
        print(f"❌ TTS API Error: {e}")
        return TTSResponse(
            success=False,
            error=str(e)
        )

@app.get("/api/audio/{audio_id}")
async def get_audio(audio_id: str):
    """
    Serve generated audio files.
    """
    try:
        # Construct file path
        temp_dir = tempfile.gettempdir()
        audio_path = os.path.join(temp_dir, f"tts_{audio_id}.mp3")
        
        if not os.path.exists(audio_path):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename=f"tts_{audio_id}.mp3"
        )
        
    except Exception as e:
        print(f"❌ Audio serving error: {e}")
        raise HTTPException(status_code=500, detail="Failed to serve audio file")

@app.delete("/api/audio/{audio_id}")
async def delete_audio(audio_id: str):
    """
    Delete a generated audio file to free up space.
    """
    try:
        temp_dir = tempfile.gettempdir()
        audio_path = os.path.join(temp_dir, f"tts_{audio_id}.mp3")
        
        if os.path.exists(audio_path):
            os.remove(audio_path)
            return {"success": True, "message": "Audio file deleted"}
        else:
            return {"success": False, "message": "Audio file not found"}
            
    except Exception as e:
        print(f"❌ Audio deletion error: {e}")
        return {"success": False, "message": str(e)}

# OpenAI endpoints
@app.post("/api/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat_with_ai(request: Request, body: ChatRequest):
    """
    Chat with OpenAI GPT-5 Nano for sleep assistance.
    Rate limited to 10 requests per minute per IP.
    """
    if not openai_initialized:
        raise HTTPException(
            status_code=503, 
            detail="OpenAI service is not initialized yet. Please wait and try again."
        )
    
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        # Get OpenAI service and generate response
        openai_service = get_openai_service()
        
        # Convert conversation history to the format expected by OpenAI service
        conversation_history = None
        if body.conversation_history:
            conversation_history = [
                {"role": msg.role, "content": msg.content} 
                for msg in body.conversation_history
            ]
        
        response_text = await openai_service.generate_response(
            body.message, 
            conversation_history
        )
        
        return ChatResponse(
            success=True,
            response=response_text
        )
        
    except Exception as e:
        print(f"❌ OpenAI Chat API Error: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

@app.post("/api/sleep-routine", response_model=SleepRoutineResponse)
@limiter.limit("3/minute")
async def generate_sleep_routine(request: Request, body: SleepRoutineRequest):
    """
    Generate a personalized sleep routine using OpenAI GPT-5 Nano.
    Rate limited to 3 requests per minute per IP.
    """
    if not openai_initialized:
        raise HTTPException(
            status_code=503, 
            detail="OpenAI service is not initialized yet. Please wait and try again."
        )
    
    if not body.preferences.strip():
        raise HTTPException(status_code=400, detail="Preferences cannot be empty")
    
    try:
        # Get OpenAI service and generate routine
        openai_service = get_openai_service()
        routine_text = await openai_service.generate_sleep_routine(body.preferences)
        
        return SleepRoutineResponse(
            success=True,
            routine=routine_text
        )
        
    except Exception as e:
        print(f"❌ OpenAI Sleep Routine API Error: {e}")
        return SleepRoutineResponse(
            success=False,
            error=str(e)
        )

@app.get("/api/openai/health")
async def openai_health_check():
    """
    Check OpenAI service health.
    """
    if not openai_initialized:
        return {
            "status": "not_initialized",
            "message": "OpenAI service is not initialized"
        }
    
    try:
        openai_service = get_openai_service()
        health_status = await openai_service.check_health()
        return health_status
    except Exception as e:
        return {
            "status": "error",
            "message": f"Health check failed: {str(e)}"
        }

def cleanup_old_audio_files():
    """Clean up old audio files (older than 1 hour)."""
    import time
    temp_dir = tempfile.gettempdir()
    current_time = time.time()
    
    for filename in os.listdir(temp_dir):
        if filename.startswith("tts_") and (filename.endswith(".wav") or filename.endswith(".mp3")):
            file_path = os.path.join(temp_dir, filename)
            try:
                file_age = current_time - os.path.getctime(file_path)
                if file_age > 3600:  # 1 hour
                    os.remove(file_path)
                    print(f"🗑️ Cleaned up old audio file: {filename}")
            except Exception as e:
                print(f"❌ Failed to clean up {filename}: {e}")

@app.post("/api/breathing-session", response_model=BreathingSessionResponse)
async def log_breathing_session(request: BreathingSessionRequest):
    """
    Log a completed breathing exercise session.
    Note: Data is stateless and not persisted.
    """
    try:
        # We don't save data anymore, just log to console
        print(f"✅ User completed breathing session: {request.technique_name} - {request.cycles_completed} cycles")
        
        return BreathingSessionResponse(
            success=True,
            message=f"Session logged successfully (stateless)"
        )
        
    except Exception as e:
        print(f"❌ Breathing session logging error: {e}")
        return BreathingSessionResponse(
            success=False,
            error=str(e)
        )

@app.get("/api/breathing-sessions")
async def get_breathing_sessions():
    """
    Get recent breathing exercise sessions.
    Note: Always returns empty list as we are stateless.
    """
    return {
        "success": True,
        "sessions": [],
        "total_sessions": 0
    }

@app.get("/api/assemblyai/token")
@limiter.limit("5/minute")
async def get_assemblyai_token(request: Request):
    """
    Generate a temporary token for AssemblyAI streaming (v2/v3).
    """
    try:
        api_key = os.getenv("ASSEMBLYAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ASSEMBLYAI_API_KEY not set")

        # Use v3 Streaming API token endpoint as per documentation
        # expires_in_seconds must be between 1 and 600 (10 minutes)
        response = requests.get(
            "https://streaming.assemblyai.com/v3/token",
            headers={"Authorization": api_key},
            params={"expires_in_seconds": 600}
        )
        
        if response.status_code != 200:
            print(f"❌ AssemblyAI token failed: {response.status_code} - {response.text}")

        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ AssemblyAI token error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    print("🎙️ Starting Sleep Assistant TTS Server...")
    # For production, you should use gunicorn or similar
    uvicorn.run(
        "main:app",
        host="0.0.0.0", # Updated for potential Docker usage
        port=8000,
        reload=True,
        log_level="info"
    )
