import { useState, useEffect, useRef } from 'react'
import { Brain, Play, Pause, Download, Save, Loader, CheckCircle, AlertCircle, Sparkles, Wand2, Clock, Volume2, Mic, Settings } from 'lucide-react'
import { OpenAIService } from '../services/OpenAIService'
import { ttsService } from '../services/TTSService'
// WebSpeech TTS removed in favor of Unreal Speech TTS
import './AISleepRoutine.css'

const AISleepRoutine = () => {
  const [routineInput, setRoutineInput] = useState('')
  const [generatedRoutine, setGeneratedRoutine] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [savedRoutines, setSavedRoutines] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [routineName, setRoutineName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [cardAnimations, setCardAnimations] = useState({})


  const openaiService = useRef(new OpenAIService()).current

  // Load saved routines on component mount
  useEffect(() => {
    loadSavedRoutines()
    // Remove Web Speech initialization
    // initializeWebSpeech() // deleted
  }, [])



  // Auto-resize textarea
  useEffect(() => {
    const textarea = document.querySelector('.routine-input')
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }, [routineInput])

  const loadSavedRoutines = () => {
    try {
      const saved = localStorage.getItem('sleepRoutines')
      if (saved) {
        const routines = JSON.parse(saved)
        setSavedRoutines(routines)
        // Add entrance animations for saved routines
        routines.forEach((routine, index) => {
          setTimeout(() => {
            setCardAnimations(prev => ({ ...prev, [routine.id]: 'slide-in-up' }))
          }, index * 100)
        })
      }
    } catch (error) {
      console.error('Error loading saved routines:', error)
    }
  }

  const saveToStorage = (routines) => {
    try {
      localStorage.setItem('sleepRoutines', JSON.stringify(routines))
      setSavedRoutines(routines)
    } catch (error) {
      console.error('Error saving routines:', error)
      setError('Failed to save routine')
      setTimeout(() => setError(''), 5000)
    }
  }

  const generateRoutine = async () => {
    if (!routineInput.trim()) return

    setIsGenerating(true)
    setError('')
    setStatus('')

    try {
      const routine = await openaiService.generateSleepRoutine(routineInput.trim())
      setGeneratedRoutine(routine)
      setStatus('Sleep routine generated successfully!')
      setTimeout(() => setStatus(''), 5000)


    } catch (error) {
      console.error('Error generating routine:', error)
      setError('Failed to generate routine. Please try again.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsGenerating(false)
    }
  }

  // Build a sensible default name for auto-saved routines
  const buildDefaultRoutineName = () => {
    const now = new Date()
    const ts = now.toLocaleString()
    const preview = (routineInput || generatedRoutine || 'Sleep Routine')
      .split('\n')[0]
      .slice(0, 40)
    return `${preview} • ${ts}`
  }

  const generateAudio = async () => {
    if (!generatedRoutine) return

    setIsGeneratingAudio(true)
    setError('')

    try {
      const audioData = await ttsService.textToSpeech(generatedRoutine, 'Emily')
      setAudioUrl(audioData.audioUrl)

      // Auto-save routine + audio immediately
      const newRoutine = {
        id: Date.now(),
        name: buildDefaultRoutineName(),
        content: generatedRoutine,
        audioUrl: audioData.audioUrl,
        audioId: audioData.audioId,
        playbackSpeed: playbackSpeed,
        createdAt: new Date().toISOString(),
        preferences: routineInput
      }
      const updatedRoutines = [...savedRoutines, newRoutine]
      saveToStorage(updatedRoutines)

      setStatus('Audio generated and saved successfully!')
      setTimeout(() => setStatus(''), 5000)
    } catch (error) {
      console.error('Error generating audio:', error)
      setError('Failed to generate audio. Please try again.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsGeneratingAudio(false)
    }
  }


  const playAudio = () => {
    if (!audioUrl) return

    if (isPlaying) {
      if (window.aiRoutineAudio) {
        window.aiRoutineAudio.pause()
        setIsPlaying(false)
      }
    } else {
      if (window.aiRoutineAudio) {
        window.aiRoutineAudio.pause()
      }

      const audio = new Audio(audioUrl)
      audio.playbackRate = playbackSpeed
      window.aiRoutineAudio = audio

      audio.onplay = () => setIsPlaying(true)
      audio.onpause = () => setIsPlaying(false)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        setIsPlaying(false)
        setError('Error playing audio')
        setTimeout(() => setError(''), 5000)
      }

      audio.play().catch(error => {
        console.error('Audio play error:', error)
        setError('Failed to play audio')
        setTimeout(() => setError(''), 5000)
      })
    }
  }



  const downloadAudio = () => {
    if (!audioUrl) return

    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `sleep-routine-${Date.now()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const saveRoutine = () => {
    if (!generatedRoutine || !routineName.trim()) return

    const newRoutine = {
      id: Date.now(),
      name: routineName.trim(),
      content: generatedRoutine,
      audioUrl: audioUrl,
      playbackSpeed: playbackSpeed,
      createdAt: new Date().toISOString(),
      preferences: routineInput
    }

    const updatedRoutines = [...savedRoutines, newRoutine]
    saveToStorage(updatedRoutines)
    setCardAnimations(prev => ({ ...prev, [newRoutine.id]: 'slide-in-up' }))
    setStatus('Routine saved successfully!')
    setShowSaveDialog(false)
    setRoutineName('')
    setTimeout(() => setStatus(''), 5000)
  }

  const loadRoutine = (routine) => {
    setGeneratedRoutine(routine.content)
    setAudioUrl(routine.audioUrl || '')
    setPlaybackSpeed(routine.playbackSpeed || 1.0)
    setRoutineInput(routine.preferences || '')
    setStatus(`Loaded routine: ${routine.name}`)
    setTimeout(() => setStatus(''), 3000)
  }

  const deleteRoutine = (routineId) => {
    const updatedRoutines = savedRoutines.filter(r => r.id !== routineId)
    saveToStorage(updatedRoutines)
    setStatus('Routine deleted')
    setTimeout(() => setStatus(''), 3000)
  }

  const examplePrompts = [
    {
      text: "I like gentle nature sounds, progressive muscle relaxation, and positive affirmations before sleep",
      icon: <Sparkles size={16} />,
      category: "Relaxation"
    },
    {
      text: "I prefer breathing exercises, gratitude practice, and visualization of peaceful places",
      icon: <Brain size={16} />,
      category: "Mindfulness"
    },
    {
      text: "I need help with anxiety at bedtime, prefer meditation and calming mantras",
      icon: <Wand2 size={16} />,
      category: "Anxiety Relief"
    },
    {
      text: "I enjoy guided imagery, body scan relaxation, and soft background music",
      icon: <Clock size={16} />,
      category: "Guided Practice"
    }
  ]

  return (
    <div className="ai-sleep-routine modern-sleep-routine">
      {/* Modern Header */}
      <div className="routine-header modern-routine-header">
        <div className="header-content">
          <div className="header-icon-container">
            <Brain size={40} className="header-icon" />
            <div className="icon-glow"></div>
          </div>
          <div className="header-text">
            <h1 className="header-title">AI Sleep Routine Creator</h1>
            <p className="header-subtitle">Create personalized sleep routines with AI-generated audio guidance</p>
          </div>
        </div>
      </div>

      {/* Modern Status Messages */}
      {status && (
        <div className="status-message modern-status success slide-in-down">
          <CheckCircle size={18} />
          <span>{status}</span>
        </div>
      )}
      
      {error && (
        <div className="status-message modern-status error slide-in-down">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="routine-content modern-content">
        {/* Modern Input Section */}
        <div className="input-section modern-input-section">
          <h2 className="section-title modern-section-title">
            <Sparkles size={24} />
            <span>Describe Your Ideal Sleep Routine</span>
          </h2>
          
          <div className="example-prompts modern-prompts">
            <p className="prompts-label">Try these examples:</p>
            <div className="prompt-grid modern-prompt-grid">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="example-prompt modern-prompt"
                  onClick={() => setRoutineInput(prompt.text)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="prompt-icon">{prompt.icon}</div>
                  <div className="prompt-content">
                    <div className="prompt-category">{prompt.category}</div>
                    <div className="prompt-text">{prompt.text}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`input-container ${inputFocused ? 'focused' : ''}`}>
            <textarea
              value={routineInput}
              onChange={(e) => setRoutineInput(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Describe your preferred sleep routine... (e.g., 'I like gentle breathing exercises, nature sounds, and positive affirmations to help me relax before bed')"
              className="routine-input modern-routine-input"
              disabled={isGenerating}
            />
            <div className="input-glow"></div>
          </div>

          <button
            onClick={generateRoutine}
            disabled={isGenerating || !routineInput.trim()}
            className="generate-btn modern-generate-btn"
          >
            <div className="btn-content">
              {isGenerating ? (
                <>
                  <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                  </div>
                  <span>Generating Routine...</span>
                </>
              ) : (
                <>
                  <Brain size={20} />
                  <span>Generate AI Sleep Routine</span>
                </>
              )}
            </div>
            <div className="btn-glow"></div>
          </button>
        </div>

        {/* Loading Skeleton for Routine Generation */}
        {isGenerating && (
          <div className="routine-skeleton modern-skeleton slide-in-up">
            <div className="skeleton-header">
              <div className="skeleton-title"></div>
              <div className="skeleton-subtitle"></div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-line long"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line long"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line long"></div>
            </div>
            <div className="skeleton-actions">
              <div className="skeleton-button"></div>
              <div className="skeleton-button small"></div>
            </div>
          </div>
        )}

        {/* Modern Generated Routine Section */}
        {generatedRoutine && !isGenerating && (
          <div className="routine-output modern-routine-output slide-in-up">
            <div className="section-header modern-section-header">
              <h2 className="section-title modern-section-title">
                <Wand2 size={24} />
                <span>Your Personalized Sleep Routine</span>
              </h2>
              <div className="routine-actions modern-actions">
                <button
                  onClick={() => setShowSaveDialog(!showSaveDialog)}
                  className="btn btn-secondary modern-action-btn"
                  disabled={isGenerating}
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {showSaveDialog && (
              <div className="save-dialog modern-save-dialog slide-in-down">
                <div className="save-dialog-content">
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    placeholder="Enter routine name..."
                    className="routine-name-input modern-name-input"
                    autoFocus
                  />
                  <div className="save-dialog-actions">
                    <button
                      onClick={saveRoutine}
                      disabled={!routineName.trim()}
                      className="btn btn-primary modern-save-btn"
                    >
                      <Save size={16} />
                      Save Routine
                    </button>
                    <button
                      onClick={() => setShowSaveDialog(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="routine-text modern-routine-text">
              {generatedRoutine}
            </div>



            {/* Modern Audio Player */}
            {!audioUrl ? (
              <div className="audio-generation modern-audio-gen">
                 {isGeneratingAudio ? (
                   <div className="audio-skeleton modern-audio-skeleton">
                     <div className="skeleton-audio-header">
                       <div className="skeleton-audio-icon"></div>
                       <div className="skeleton-audio-text"></div>
                     </div>
                     <div className="skeleton-waveform">
                       {[...Array(12)].map((_, i) => (
                         <div 
                           key={i} 
                           className="skeleton-wave-bar"
                           style={{ animationDelay: `${i * 0.1}s` }}
                         ></div>
                       ))}
                     </div>
                     <div className="skeleton-audio-controls">
                       <div className="skeleton-play-btn"></div>
                       <div className="skeleton-speed-controls">
                         {[...Array(4)].map((_, i) => (
                           <div key={i} className="skeleton-speed-btn"></div>
                         ))}
                       </div>
                     </div>
                   </div>
                 ) : (
                   <button
                     onClick={generateAudio}
                     disabled={isGeneratingAudio}
                     className="generate-audio-btn modern-audio-btn"
                   >
                     <div className="btn-content">
                       <Volume2 size={18} />
                       <span>Generate Audio</span>
                     </div>
                     <div className="btn-shimmer"></div>
                   </button>
                 )}
                </div>
             ) : (
              <div className="audio-player modern-audio-player slide-in-up">
                <div className="audio-controls modern-audio-controls">
                  <button
                    onClick={playAudio}
                    className="play-btn modern-play-btn"
                  >
                    <div className="play-btn-content">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      <span>{isPlaying ? 'Pause' : 'Play'} Routine</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={downloadAudio}
                    className="btn btn-secondary modern-download-btn"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>

                <div className="speed-control modern-speed-control">
                  <label className="speed-label">
                    <Clock size={16} />
                    Playback Speed
                  </label>
                  <div className="speed-buttons modern-speed-buttons">
                    {[0.75, 1.0, 1.25, 1.5].map(speed => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed)
                          if (window.aiRoutineAudio) {
                            window.aiRoutineAudio.playbackRate = speed
                          }
                        }}
                        className={`speed-btn modern-speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                        disabled={isGeneratingAudio}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="audio-info modern-audio-info">
                  <div className="audio-status">
                    <span className="audio-quality">High-quality Unreal Speech AI</span>
                    {isPlaying && (
                      <span className="playing-indicator">
                        <div className="playing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        Playing at {playbackSpeed}x speed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modern Saved Routines Section */}
        {savedRoutines.length > 0 && (
          <div className="saved-routines modern-saved-routines">
            <h2 className="section-title modern-section-title">
              <Save size={24} />
              <span>Saved Sleep Routines</span>
            </h2>
            <div className="routines-grid modern-routines-grid">
              {savedRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className={`routine-card modern-routine-card ${cardAnimations[routine.id] || ''}`}
                >
                  <div className="routine-card-header modern-card-header">
                    <div className="routine-title modern-routine-title">
                      <Brain size={18} />
                      <span>{routine.name}</span>
                      {routine.audioUrl && (
                        <div className="audio-badge">
                          <Volume2 size={12} />
                        </div>
                      )}
                    </div>
                    <div className="routine-meta modern-routine-meta">
                      <span className="creation-date">
                        {new Date(routine.createdAt).toLocaleDateString()}
                      </span>
                      {routine.playbackSpeed && routine.playbackSpeed !== 1.0 && (
                        <span className="speed-indicator">{routine.playbackSpeed}x</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="routine-description modern-routine-description">
                    {routine.content.substring(0, 150)}...
                  </div>
                  
                  <div className="routine-card-actions modern-card-actions">
                    <button
                      onClick={() => loadRoutine(routine)}
                      className="btn btn-primary modern-load-btn"
                    >
                      <Play size={14} />
                      Load
                    </button>
                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      className="btn btn-secondary modern-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AISleepRoutine
