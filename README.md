# Sleep Assistant - AI-Powered Sleep & Relaxation Platform

## Project Overview

The Sleep Assistant is a comprehensive web-based application designed to help users achieve better sleep quality through AI-powered personalized guidance, ambient soundscapes, breathing exercises, and atmospheric effects. The platform combines modern web technologies with advanced AI models to create an immersive, calming environment that promotes relaxation and restful sleep.

### Core Objectives

- **Personalized Sleep Guidance**: AI-powered sleep coaching with natural language conversations
- **Immersive Relaxation Environment**: Dynamic atmospheric effects and ambient audio
- **Guided Breathing Exercises**: Multiple scientifically-backed breathing techniques
- **Custom Audio Generation**: AI-generated sleep stories and guidance using VibeVoice TTS
- **Ambient Sound Library**: Curated collection of relaxing soundscapes
- **Adaptive User Interface**: Automatic theme switching and blue light filtering

## Project Structure

```
jiehao-fyp/
├── VibeVoice-1.5B/                    # Pre-trained VibeVoice TTS model
│   ├── config.json                    # Model configuration
│   ├── model-*.safetensors           # Model weights (3 parts)
│   ├── model.safetensors.index.json  # Model index
│   └── preprocessor_config.json      # Audio preprocessing config
│
└── sleep-assistant/                   # Main application
    ├── backend/                       # Python FastAPI backend
    │   ├── main.py                   # FastAPI server and API endpoints
    │   ├── tts_service.py            # VibeVoice TTS integration
    │   ├── test.py                   # TTS testing utilities
    │   ├── requirements.txt          # Python dependencies
    │   ├── aifc.py & sunau.py        # Audio format compatibility
    │   └── vibevoice-implementation/  # VibeVoice library integration
    │
    ├── src/                          # React frontend source
    │   ├── App.jsx                   # Main application component
    │   ├── components/               # React components
    │   │   ├── AISleepRoutine.jsx    # AI-generated sleep routines
    │   │   ├── AtmosphericAudio.jsx  # Ambient audio management
    │   │   ├── AtmosphericEffects.jsx # Visual atmospheric effects
    │   │   ├── BreathingExercise.jsx # Guided breathing exercises
    │   │   ├── ChatBot.jsx           # AI sleep coach interface
    │   │   ├── CustomMusicUpload.jsx # User music upload
    │   │   ├── GlobalEffectsRenderer.jsx # Global visual effects
    │   │   └── MusicPlayer.jsx       # Ambient sound player
    │   ├── services/                 # Frontend services
    │   │   ├── LocalLLMService.js    # LM Studio integration
    │   │   └── TTSService.js         # TTS API client
    │   └── assets/                   # Static assets
    │
    ├── public/                       # Public assets
    │   └── audio/ambient/            # Ambient sound files
    │
    ├── package.json                  # Node.js dependencies
    ├── vite.config.js               # Vite build configuration
    ├── .env.example                 # Environment variables template
    └── README.md                    # Project documentation
```

## Major Features

### 1. AI Sleep Coach (ChatBot)

**Description**: An intelligent conversational AI that provides personalized sleep guidance, relaxation tips, and bedtime stories.

**Technical Implementation**:
- **LLM Integration**: Connects to LM Studio for local language model inference
- **Specialized Prompting**: Custom system prompts optimized for sleep coaching
- **Fallback Responses**: Graceful degradation when LLM is unavailable
- **TTS Integration**: Converts AI responses to natural speech using VibeVoice

**Key Features**:
- Personalized sleep advice and tips
- Interactive bedtime story generation
- Anxiety and stress management guidance
- Progressive relaxation instructions
- Sleep hygiene recommendations

**Configuration**:
```javascript
// LM Studio connection (default: localhost:1234)
VITE_LM_STUDIO_URL=http://localhost:1234
```

**Usage Example**:
```javascript
const llmService = new LocalLLMService()
const response = await llmService.sendMessage("I'm having trouble falling asleep")
```

### 2. AI Sleep Routine Generator

**Description**: Creates personalized sleep routines with AI-generated audio guidance tailored to user preferences and needs.

**Technical Implementation**:
- **Dynamic Content Generation**: AI creates custom sleep routines based on user input
- **Text-to-Speech Conversion**: Converts generated routines to high-quality audio
- **Routine Management**: Save, load, and manage multiple personalized routines
- **Streaming Audio**: Real-time audio generation and playback for long content

**Key Features**:
- Personalized routine creation based on user preferences
- AI-generated guided meditation scripts
- Progressive muscle relaxation sequences
- Customizable routine duration and intensity
- Audio playback with speed control
- Routine saving and management

**Dependencies**:
- VibeVoice TTS model for natural speech synthesis
- FastAPI backend for audio processing
- Local storage for routine persistence

### 3. Guided Breathing Exercises

**Description**: Interactive breathing exercises with visual guidance and audio cues to promote relaxation and stress reduction.

**Technical Implementation**:
- **Multiple Techniques**: 4-7-8, Box Breathing, Deep Breathing, Coherent Breathing
- **Visual Guidance**: Animated breathing circle with phase indicators
- **Audio Cues**: Optional breathing sounds and guidance
- **Progress Tracking**: Cycle counting and session timing
- **Customizable Settings**: Adjustable timing and technique selection

**Available Techniques**:

1. **4-7-8 Technique**
   - Inhale: 4 seconds
   - Hold: 7 seconds  
   - Exhale: 8 seconds
   - Cycles: 4
   - Benefits: Reduces anxiety, promotes sleep

2. **Box Breathing**
   - Inhale: 4 seconds
   - Hold: 4 seconds
   - Exhale: 4 seconds
   - Hold: 4 seconds
   - Cycles: 6
   - Benefits: Stress reduction, focus improvement

3. **Deep Breathing**
   - Inhale: 6 seconds
   - Exhale: 6 seconds
   - Cycles: 8
   - Benefits: General relaxation, anxiety relief

4. **Coherent Breathing**
   - Inhale: 5 seconds
   - Exhale: 5 seconds
   - Cycles: 10
   - Benefits: Heart rate variability, balance

### 4. Atmospheric Effects System

**Description**: Immersive visual effects that transform the user interface to create calming, nature-inspired environments.

**Technical Implementation**:
- **CSS-based Animations**: Hardware-accelerated visual effects
- **Dynamic Lighting**: Ambient lighting that responds to selected effects
- **Particle Systems**: Realistic rain, snow, and fire particle animations
- **Blend Modes**: Advanced CSS blend modes for atmospheric lighting
- **Performance Optimized**: Efficient rendering with minimal resource usage

**Available Effects**:

1. **Rain**: Gentle rainfall with water reflection effects
2. **Snow**: Peaceful snowfall with wind-blown particles
3. **Lightning**: Dynamic lightning bolts with storm atmosphere
4. **Campfire**: Flickering flames with ember particles
5. **Storm**: Intense weather with rain and lightning
6. **Wind**: Gentle breeze with flowing light patterns

**Technical Details**:
```css
/* Example: Rain effect implementation */
.rain-particle {
  position: fixed;
  background: linear-gradient(to bottom, 
    rgba(173, 216, 230, 0.8) 0%, 
    rgba(135, 206, 235, 0.6) 50%, 
    transparent 100%);
  animation: rainFall linear infinite;
}
```

### 5. Ambient Audio System

**Description**: High-quality ambient soundscapes with spatial audio processing and dynamic mixing capabilities.

**Technical Implementation**:
- **Web Audio API**: Advanced audio processing and effects
- **Spatial Audio**: 3D positioning and environmental audio
- **Dynamic Mixing**: Real-time audio blending and crossfading
- **Loop Management**: Seamless audio looping for continuous ambience
- **Volume Control**: Individual and master volume controls

**Available Soundscapes**:
- **Rainforest**: Tropical birds, flowing water, gentle rain
- **Rain**: Soft rainfall on various surfaces
- **Thunder**: Distant thunder with rain ambience
- **White Noise**: Consistent background noise for focus

**Audio Processing Features**:
```javascript
// Spatial audio positioning
const pannerNode = audioContext.createPanner()
pannerNode.setPosition(x, y, z)

// Dynamic reverb effects
const reverbNode = audioContext.createConvolver()
reverbNode.buffer = reverbImpulseResponse
```

### 6. Music Player & Custom Upload

**Description**: Integrated music player supporting both built-in ambient sounds and user-uploaded custom audio files.

**Technical Implementation**:
- **File Upload**: Drag-and-drop interface for audio file uploads
- **Format Support**: MP3, WAV, OGG, and other common audio formats
- **Playlist Management**: Create and manage custom playlists
- **Audio Controls**: Play, pause, volume, and progress controls
- **Persistent Storage**: Local storage for user preferences and playlists

**Supported Features**:
- Built-in ambient sound library
- Custom music upload and management
- Playlist creation and organization
- Audio visualization (optional)
- Crossfade between tracks
- Loop and shuffle modes

### 7. Adaptive User Interface

**Description**: Intelligent interface that adapts to time of day and user preferences for optimal sleep preparation.

**Technical Implementation**:
- **Automatic Theme Switching**: Light/dark mode based on time of day
- **Blue Light Filtering**: CSS filters to reduce blue light emission
- **Manual Overrides**: User control over automatic settings
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with keyboard navigation support

**Adaptive Features**:
```javascript
// Automatic theme switching based on time
const hour = new Date().getHours()
const isEvening = hour >= 18 || hour < 6

if (isEvening && !manualThemeOverride) {
  setIsDarkMode(true)
  setBlueLightFilter(true)
}
```

## Dependencies and Requirements

### Frontend Dependencies

```json
{
  "dependencies": {
    "axios": "^1.11.0",           // HTTP client for API requests
    "dotenv": "^17.2.2",          // Environment variable management
    "lucide-react": "^0.543.0",   // Icon library
    "react": "^19.1.1",           // React framework
    "react-dom": "^19.1.1"        // React DOM rendering
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",  // Vite React plugin
    "eslint": "^9.33.0",               // Code linting
    "vite": "^7.1.2"                   // Build tool and dev server
  }
}
```

### Backend Dependencies

```txt
fastapi>=0.115.0          # Modern Python web framework
uvicorn[standard]>=0.32.0 # ASGI server for FastAPI
python-multipart>=0.0.18  # File upload support
pydantic>=2.10.0          # Data validation and serialization
```

### AI Model Requirements

- **VibeVoice-1.5B**: Pre-trained text-to-speech model (~3GB)
- **LM Studio**: Local language model runtime
- **Compatible LLM**: Any model supported by LM Studio (recommended: 7B+ parameters)

### System Requirements

**Minimum**:
- **CPU**: 4-core processor (Intel i5 or AMD Ryzen 5)
- **RAM**: 8GB (16GB recommended for optimal performance)
- **Storage**: 10GB free space for models and cache
- **GPU**: Optional but recommended (Apple Silicon MPS, NVIDIA CUDA, or AMD ROCm)

**Recommended**:
- **CPU**: 8-core processor or better
- **RAM**: 16GB or more
- **GPU**: Dedicated GPU with 6GB+ VRAM for faster TTS generation
- **Storage**: SSD for improved model loading times

## Setup and Installation

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.9 or higher)
3. **Git** for cloning the repository
4. **LM Studio** for local LLM inference

### Installation Steps

1. **Clone the Repository**
```bash
git clone <repository-url>
cd jiehao-fyp
```

2. **Install Frontend Dependencies**
```bash
cd sleep-assistant
npm install
```

3. **Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Download VibeVoice Model**
```bash
# The VibeVoice-1.5B model should be placed in the project root
# Ensure the model files are in: jiehao-fyp/VibeVoice-1.5B/
```

5. **Configure Environment Variables**
```bash
cp .env.example .env
# Edit .env with your LM Studio URL if different from default
```

6. **Set Up LM Studio**
- Download and install LM Studio
- Load a compatible language model (7B+ parameters recommended)
- Start the local server (default: http://localhost:1234)

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
python main.py
```
The TTS API will be available at `http://localhost:8000`

2. **Start the Frontend Development Server**
```bash
cd sleep-assistant
npm run dev
```
The web application will be available at `http://localhost:5173`

3. **Verify LM Studio Connection**
- Ensure LM Studio is running with a loaded model
- Test the connection through the ChatBot interface

## Configuration Options

### Environment Variables

```bash
# .env file configuration
VITE_LM_STUDIO_URL=http://localhost:1234  # LM Studio API endpoint
```

### TTS Service Configuration

```python
# Backend TTS settings (tts_service.py)
DDPM_INFERENCE_STEPS = 25        # Quality vs speed trade-off
MAX_TEXT_LENGTH = 10000          # Maximum text length for TTS
CHUNK_SIZE = 800                 # Text chunking for streaming TTS
```

### Audio Settings

```javascript
// Frontend audio configuration
DEFAULT_VOLUME = 0.5             // Default audio volume
AMBIENT_AUDIO_VOLUME = 0.3       // Ambient effects volume
CROSSFADE_DURATION = 2000        // Crossfade time in milliseconds
```

## Usage Guidelines

### Basic Usage

1. **Access the Application**: Open your browser to `http://localhost:5173`
2. **Choose a Feature**: Select from the available tabs (Breathing, Sounds, Coach, etc.)
3. **Customize Settings**: Adjust themes, audio levels, and effects as needed
4. **Begin Your Session**: Start with breathing exercises or ambient sounds

### AI Sleep Coach Usage

1. **Start a Conversation**: Click on the "Coach" tab
2. **Ask for Guidance**: Type questions about sleep, relaxation, or request bedtime stories
3. **Listen to Responses**: Enable TTS to hear AI responses in natural speech
4. **Follow Recommendations**: Implement suggested techniques and practices

### Creating Custom Sleep Routines

1. **Navigate to AI Routine**: Select the "AI Routine" tab
2. **Describe Your Needs**: Enter details about your sleep challenges or preferences
3. **Generate Routine**: Let the AI create a personalized routine
4. **Listen and Save**: Play the generated audio and save routines for future use

### Breathing Exercise Sessions

1. **Select Technique**: Choose from available breathing methods
2. **Start Exercise**: Follow the visual guide and audio cues
3. **Complete Cycles**: Finish the recommended number of breathing cycles
4. **Track Progress**: Monitor your session time and cycle completion

## Known Limitations and Edge Cases

### Performance Limitations

- **TTS Generation Time**: Initial audio generation may take 10-30 seconds depending on hardware
- **Model Loading**: First-time model initialization can take 2-5 minutes
- **Memory Usage**: Large language models require significant RAM (8GB+ recommended)

### Browser Compatibility

- **Audio Context**: Some browsers require user interaction before enabling audio
- **File Upload**: Large audio files (>50MB) may cause performance issues
- **WebGL Effects**: Atmospheric effects may not work on older browsers or devices

### Network Dependencies

- **LM Studio Connection**: Requires local LM Studio instance for AI features
- **CORS Issues**: May require browser security adjustments for local development
- **Audio Streaming**: Large TTS files may experience buffering on slower connections

### Edge Cases

1. **Model Unavailability**: Graceful fallback when TTS or LLM models are unavailable
2. **Audio Format Support**: Some browsers may not support all uploaded audio formats
3. **Long Text Processing**: Very long texts (>10,000 characters) are automatically chunked
4. **Concurrent Sessions**: Multiple browser tabs may conflict with audio playback

## Maintenance and Contribution Guidelines

### Code Structure

- **Component Organization**: Each feature is contained in its own React component
- **Service Layer**: API interactions are abstracted into service classes
- **Styling**: CSS modules and component-specific stylesheets
- **State Management**: React hooks for local state, context for global state

### Development Workflow

1. **Feature Development**: Create feature branches for new functionality
2. **Testing**: Test all features across different browsers and devices
3. **Code Review**: Ensure code quality and consistency
4. **Documentation**: Update README and inline documentation

### Contributing

1. **Fork the Repository**: Create your own fork for development
2. **Create Feature Branch**: `git checkout -b feature/new-feature`
3. **Implement Changes**: Follow existing code patterns and conventions
4. **Test Thoroughly**: Verify functionality across different scenarios
5. **Submit Pull Request**: Include detailed description of changes

### Maintenance Tasks

- **Model Updates**: Periodically update VibeVoice and LLM models
- **Dependency Updates**: Keep npm and pip packages up to date
- **Performance Monitoring**: Monitor TTS generation times and optimize as needed
- **User Feedback**: Collect and implement user experience improvements

## Licensing Information

This project is developed for educational and research purposes. Please ensure compliance with the following:

- **VibeVoice Model**: Check the specific license terms for the VibeVoice model
- **LM Studio**: Verify licensing requirements for commercial use
- **Third-party Libraries**: All dependencies maintain their respective licenses
- **Audio Content**: Ensure proper licensing for any included audio files

For commercial use, please review all component licenses and obtain necessary permissions.

## Support and Troubleshooting

### Common Issues

1. **TTS Service Not Starting**: Verify Python dependencies and model file locations
2. **LM Studio Connection Failed**: Check if LM Studio is running and accessible
3. **Audio Not Playing**: Verify browser audio permissions and file formats
4. **Performance Issues**: Monitor system resources and consider hardware upgrades

### Getting Help

- **Documentation**: Refer to this README and inline code comments
- **Issue Tracking**: Report bugs and feature requests through the project repository
- **Community**: Join discussions about sleep technology and AI applications

### Performance Optimization

- **GPU Acceleration**: Enable CUDA, MPS, or ROCm for faster model inference
- **Model Quantization**: Use quantized models for reduced memory usage
- **Caching**: Implement audio caching for frequently used content
- **Streaming**: Use streaming TTS for real-time audio generation

---

*This Sleep Assistant platform represents a comprehensive approach to AI-powered sleep improvement, combining cutting-edge technology with evidence-based relaxation techniques to help users achieve better sleep quality and overall well-being.*