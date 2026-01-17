import { useState, useEffect, useRef } from 'react'
import { Moon, Music, MessageCircle, Volume2, VolumeX, Upload, Play, Pause, Wind, Sun, Zap, Brain, Timer, CheckCircle, AlertCircle } from 'lucide-react'
import MusicPlayer from './components/MusicPlayer'
import ChatBot from './components/ChatBot'
import CustomMusicUpload from './components/CustomMusicUpload'
import BreathingExercise from './components/BreathingExercise'
import AtmosphericEffects from './components/AtmosphericEffects'
import AISleepRoutine from './components/AISleepRoutine'
import GlobalEffectsRenderer from './components/GlobalEffectsRenderer'
import AtmosphericAudio from './components/AtmosphericAudio'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('breathing')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [blueLightFilter, setBlueLightFilter] = useState(false)
  const [manualThemeOverride, setManualThemeOverride] = useState(false)
  const [manualFilterOverride, setManualFilterOverride] = useState(false)
  const [activeEffect, setActiveEffect] = useState(null)
  const [ambientLightingEnabled, setAmbientLightingEnabled] = useState(true)
  const [ambientAudioEnabled, setAmbientAudioEnabled] = useState(true)
  const [ambientAudioVolume, _setAmbientAudioVolume] = useState(0.3)

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('light-theme', !isDarkMode)
    root.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])
  
  // Audio-related state and ref for persistence
  const audioRef = useRef(null)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [_duration, setDuration] = useState(0)
  const [_audioCurrentTime, setAudioCurrentTime] = useState(0)

  // Keep-alive mechanism for Render backend
  useEffect(() => {
    // Ping the health endpoint every 45 seconds (Render sleeps after 50s of inactivity)
    const pingInterval = setInterval(async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : window.location.origin)
        await fetch(`${baseURL}/health`)
        // console.log('Backend ping successful')
      } catch (error) {
        // console.error('Backend ping failed', error)
      }
    }, 45000)

    return () => clearInterval(pingInterval)
  }, [])

  // Audio management effects
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Enable looping for continuous ambient sound playback
    audio.loop = true

    const updateTime = () => setAudioCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [currentTrack])

  // Handle global audio mute/unmute
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!ambientAudioEnabled) {
      audio.pause()
      setIsPlaying(false)
    }
  }, [ambientAudioEnabled])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now)
      
      // Auto-switch themes only if user hasn't manually overridden
      // Removed filter logic
    }, 1000)
    return () => clearInterval(timer)
  }, []) // Removed dependencies to stop it from running on state changes

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleCustomTrackSelect = (track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    setActiveTab('music') // Switch to music tab to show the player
  }

  return (
    <div className={`app ${blueLightFilter ? 'blue-light-filter' : ''}`}>
      {/* Global Atmospheric Effects */}
      {ambientLightingEnabled && <GlobalEffectsRenderer activeEffect={activeEffect} />}
      
      {/* Atmospheric Audio */}
      <AtmosphericAudio 
        activeEffect={activeEffect} 
        isEnabled={ambientAudioEnabled} 
        volume={ambientAudioVolume} 
      />
      
      {/* Persistent Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        volume={isMuted ? 0 : volume}
        style={{ display: 'none' }}
      />
      
      {/* Header */}
      <header className="header">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="logo floating">
              <Moon size={32} className="text-gradient" />
            </div>
            <div>
              <h1 className="text-medium text-gradient">Sleep Assistant</h1>
              <p className="text-small">Your companion for better sleep</p>
            </div>
          </div>
          <div className="header-controls">
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode)
                setManualThemeOverride(true)
              }}
              className={`btn ${isDarkMode ? 'btn-secondary' : 'btn-primary'} filter-btn`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={() => {
                setBlueLightFilter(!blueLightFilter)
                setManualFilterOverride(true)
              }}
              className={`btn ${blueLightFilter ? 'btn-primary' : 'btn-secondary'} filter-btn`}
              title={blueLightFilter ? 'Disable blue light filter' : 'Enable blue light filter'}
            >
              {blueLightFilter ? <Moon size={16} /> : <Sun size={16} />}
              {blueLightFilter ? 'Filter On' : 'Filter Off'}
            </button>
            <button
              onClick={() => setAmbientLightingEnabled(!ambientLightingEnabled)}
              className={`btn ${ambientLightingEnabled ? 'btn-primary' : 'btn-secondary'} filter-btn`}
              title={ambientLightingEnabled ? 'Disable ambient lighting' : 'Enable ambient lighting'}
            >
              <Zap size={16} />
              {ambientLightingEnabled ? 'Lighting On' : 'Lighting Off'}
            </button>
            <button
              onClick={() => {
                setAmbientAudioEnabled(!ambientAudioEnabled)
                // If disabling audio, also pause current track
                if (ambientAudioEnabled && isPlaying) {
                  setIsPlaying(false)
                }
              }}
              className={`btn ${ambientAudioEnabled ? 'btn-primary' : 'btn-secondary'} filter-btn`}
              title={ambientAudioEnabled ? 'Mute all ambient sounds' : 'Enable ambient sounds'}
            >
              {ambientAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {ambientAudioEnabled ? 'Sounds On' : 'Sounds Off'}
            </button>
            <div className="time-display">
              <div className="text-medium">{formatTime(currentTime)}</div>
              <div className="text-small">Time to relax</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Navigation Tabs */}
          <nav className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'breathing' ? 'active' : ''}`}
              onClick={() => setActiveTab('breathing')}
            >
              <Wind size={20} />
              Breathing
            </button>
            <button
              className={`tab-button ${activeTab === 'music' ? 'active' : ''}`}
              onClick={() => setActiveTab('music')}
            >
              <Music size={20} />
              Sounds
            </button>
            <button
              className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageCircle size={20} />
              Coach
            </button>
            <button
              className={`tab-button ${activeTab === 'ai-routine' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai-routine')}
            >
              <Brain size={20} />
              AI Routine
            </button>
            <button
              className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={20} />
              My Music
            </button>
            <button
              className={`tab-button ${activeTab === 'effects' ? 'active' : ''}`}
              onClick={() => setActiveTab('effects')}
            >
              <Zap size={20} />
              Effects
            </button>
          </nav>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'breathing' && (
              <div className="breathing-section">
                <BreathingExercise />
              </div>
            )}

            {activeTab === 'music' && (
              <div className="music-section">
                <MusicPlayer 
                  isPlaying={isPlaying} 
                  setIsPlaying={setIsPlaying}
                  currentTrack={currentTrack}
                  setCurrentTrack={setCurrentTrack}
                  ambientAudioEnabled={ambientAudioEnabled}
                  audioRef={audioRef}
                  volume={volume}
                  setVolume={setVolume}
                  isMuted={isMuted}
                  setIsMuted={setIsMuted}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="chat-section">
                <ChatBot />
              </div>
            )}

            {activeTab === 'ai-routine' && (
              <div className="ai-routine-section">
                <AISleepRoutine />
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="upload-section">
                <CustomMusicUpload 
                  onTrackSelect={handleCustomTrackSelect}
                  isPlaying={isPlaying}
                  currentTrack={currentTrack}
                />
              </div>
            )}

            {activeTab === 'effects' && (
              <div className="effects-section">
                <AtmosphericEffects 
                  activeEffect={activeEffect}
                  setActiveEffect={setActiveEffect}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="flex justify-center items-center gap-4">
            <div className="pulse">
              <div className="status-indicator"></div>
            </div>
            <p className="text-small">
              {activeTab === 'breathing' && 'Practice breathing exercises to calm your mind'}
              {activeTab === 'music' && (isPlaying ? 'Playing ambient sounds' : 'Choose calming sounds for relaxation')}
              {activeTab === 'chat' && 'Chat with your AI sleep coach for personalized guidance'}
              {activeTab === 'ai-routine' && 'Create personalized sleep routines with AI-generated audio guidance'}
              {activeTab === 'upload' && 'Add your own relaxing music for a personalized experience'}
              {activeTab === 'effects' && 'Enhance your environment with atmospheric effects'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
