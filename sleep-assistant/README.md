# Sleep Assistant 🌙

A comprehensive web application designed to help people with insomnia and sleep difficulties achieve better rest through ambient sounds, AI-powered sleep coaching, and personalized music experiences.

## Features ✨

### 🎵 Ambient Sound Player
- **Pre-loaded ambient sounds**: Rainforest, rain sounds, ocean waves, white noise, forest night, and meditation bells
- **Interactive music player** with play/pause, volume control, and progress tracking
- **Beautiful visualizations** with gradient artwork for each sound
- **Responsive design** that works on all devices

### 🤖 AI Sleep Coach
- **OpenAI GPT-5 Nano integration** using responses.create API for intelligent sleep assistance
- **Natural conversation** about sleep concerns, anxiety, and relaxation
- **Voice interaction** with VibeVoice Text-to-Speech
- **Quick response buttons** for common sleep-related queries
- **Secure API key management** with backend-only access

### 🎶 Custom Music Upload
- **Drag-and-drop interface** for easy file uploads
- **Multiple audio format support** (MP3, WAV, OGG, M4A, AAC, FLAC)
- **Personal music library** with file management
- **Audio metadata display** (duration, file size)
- **Helpful tips** for choosing sleep-friendly music

### 🎨 Sleep-Friendly Design
- **Dark theme** with calming purple and blue gradients
- **Smooth animations** and transitions
- **Glassmorphism effects** with backdrop blur
- **Responsive layout** for mobile and desktop
- **Accessibility features** with proper contrast and focus states

## Technology Stack 🛠️

- **Frontend**: React 18 with Vite
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Lucide React
- **AI Services**:
  - OpenAI GPT-5 Nano with responses.create API for intelligent conversation
  - VibeVoice for high-quality text-to-speech
- **Audio**: Web Audio API with HTML5 audio elements

## Setup Instructions 🚀

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ for the TTS backend
- OpenAI API key for AI chat functionality

### Installation

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the project root with your OpenAI API key:
   ```env
   # OpenAI Configuration (Backend only - API key should NEVER be exposed to frontend)
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the backend TTS service**
   ```bash
   cd backend
   python main.py
   ```

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Usage Guide 📖

### Getting Started
1. **Choose an ambient sound** from the music player to start relaxing
2. **Chat with the AI sleep coach** about your sleep concerns (requires LM Studio)
3. **Upload your own music** for a personalized experience

### Music Player
- Click on any ambient sound card to start playing
- Use the volume slider to adjust audio levels
- The progress bar shows playback progress and allows seeking
- Multiple sounds can be queued for continuous playback

### AI Sleep Coach
- Type messages to chat with the local AI assistant
- Ask about sleep techniques, anxiety management, or request bedtime stories
- Enable voice responses to hear AI responses spoken aloud
- Use quick response buttons for common queries

### Custom Music Upload
- Drag and drop audio files onto the upload area
- Click "Choose Files" to browse for audio files
- Manage your uploaded tracks with play/remove controls
- Follow the provided tips for selecting sleep-friendly music

## File Structure 📁

```
sleep-assistant/
├── src/
│   ├── components/
│   │   ├── MusicPlayer.jsx       # Ambient sound player
│   │   ├── MusicPlayer.css
│   │   ├── ChatBot.jsx           # AI sleep coach interface
│   │   ├── ChatBot.css
│   │   ├── CustomMusicUpload.jsx # Music upload component
│   │   └── CustomMusicUpload.css
│   ├── services/
│   │   ├── OpenAIService.js      # OpenAI API integration
│   │   └── TTSService.js         # VibeVoice TTS client
│   ├── App.jsx                   # Main application component
│   ├── App.css
│   ├── index.css                 # Global styles and theme
│   └── main.jsx
├── backend/
│   ├── main.py                   # FastAPI TTS server
│   ├── tts_service.py           # VibeVoice TTS implementation
│   ├── requirements.txt         # Python dependencies
│   └── vibevoice-implementation/ # VibeVoice model files
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore
├── package.json
└── README.md
```

## Features in Detail 🔍

### Sleep-Optimized Audio
- **Nature sounds** and ambient audio for relaxation
- **Volume normalization** to prevent sudden loud sounds
- **Smooth transitions** between tracks
- **Loop functionality** for continuous playback

### AI Sleep Coaching
- **Personalized responses** based on user input
- **Sleep hygiene education** and tips
- **Breathing exercises** and relaxation techniques
- **Bedtime story generation** for better sleep onset

### Accessibility
- **Keyboard navigation** support
- **Screen reader compatibility**
- **High contrast** color schemes
- **Focus indicators** for interactive elements

## Troubleshooting 🔧

### Common Issues

**Audio not playing:**
- Check browser audio permissions
- Ensure audio files are in supported formats
- Verify volume levels and mute status

**Voice features not working:**
- Ensure the backend TTS service is running (`python backend/main.py`)
- Check that the VibeVoice model is properly installed
- Verify network connectivity to localhost:8000

**AI responses not working:**
- Ensure LM Studio is running and accessible at localhost:1234
- Check that a compatible language model is loaded in LM Studio
- Review browser console for connection errors

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 11.4+)
- **Edge**: Full support

## License 📄

This project is licensed under the MIT License.

---

**Sweet dreams! 🌙✨**
