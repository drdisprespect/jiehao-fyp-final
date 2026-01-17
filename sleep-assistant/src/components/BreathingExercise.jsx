import { useMemo, useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Wind, Heart, Zap, Settings, Volume2, VolumeX, Waves, Moon, Sun } from 'lucide-react'
import './BreathingExercise.css'

const BreathingExercise = () => {
  const [selectedTechnique, setSelectedTechnique] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [phaseTime, setPhaseTime] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [customCycles, setCustomCycles] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const intervalRef = useRef(null)
  const audioContextRef = useRef(null)
  const totalTimeRef = useRef(0)

  // Load recent sessions on component mount
  useEffect(() => {
    loadRecentSessions()
  }, [])

  const loadRecentSessions = async () => {
    try {
      const baseURL = import.meta.env.DEV ? 'http://localhost:8000' : window.location.origin
      const response = await fetch(`${baseURL}/api/breathing-sessions`)
      const data = await response.json()
      if (data.success) {
        setRecentSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to load breathing sessions:', error)
    }
  }

  const logSession = async (technique, cycles, duration) => {
    try {
      const baseURL = import.meta.env.DEV ? 'http://localhost:8000' : window.location.origin
      const response = await fetch(`${baseURL}/api/breathing-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technique_id: technique.id,
          technique_name: technique.name,
          cycles_completed: cycles,
          total_duration_seconds: duration,
          session_date: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        loadRecentSessions() // Refresh the sessions list
      }
    } catch (error) {
      console.error('Failed to log breathing session:', error)
    }
  }

  const breathingTechniques = [
    {
      id: '4-7-8',
      name: '4-7-8 Technique',
      description: 'Perfect for falling asleep quickly',
      icon: <Wind size={24} />,
      phases: [
        { name: 'inhale', duration: 4, instruction: 'Breathe in through your nose' },
        { name: 'hold', duration: 7, instruction: 'Hold your breath' },
        { name: 'exhale', duration: 8, instruction: 'Exhale through your mouth' }
      ],
      cycles: 4,
      benefits: ['Reduces anxiety', 'Promotes sleep', 'Calms nervous system'],
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'box',
      name: 'Box Breathing',
      description: 'Equal timing for balance and focus',
      icon: <Heart size={24} />,
      phases: [
        { name: 'inhale', duration: 4, instruction: 'Breathe in slowly' },
        { name: 'hold', duration: 4, instruction: 'Hold your breath' },
        { name: 'exhale', duration: 4, instruction: 'Breathe out slowly' },
        { name: 'hold', duration: 4, instruction: 'Hold empty lungs' }
      ],
      cycles: 6,
      benefits: ['Improves focus', 'Reduces stress', 'Balances nervous system'],
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'coherent',
      name: 'Coherent Breathing',
      description: 'Simple 5-second rhythm for relaxation',
      icon: <Zap size={24} />,
      phases: [
        { name: 'inhale', duration: 5, instruction: 'Breathe in gently' },
        { name: 'exhale', duration: 5, instruction: 'Breathe out slowly' }
      ],
      cycles: 10,
      benefits: ['Heart rate variability', 'Deep relaxation', 'Stress relief'],
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'triangle',
      name: 'Triangle Breathing',
      description: 'Three-part rhythm for deep calm',
      icon: <Waves size={24} />,
      phases: [
        { name: 'inhale', duration: 6, instruction: 'Breathe in deeply' },
        { name: 'hold', duration: 6, instruction: 'Hold and relax' },
        { name: 'exhale', duration: 6, instruction: 'Release slowly' }
      ],
      cycles: 5,
      benefits: ['Deep relaxation', 'Mental clarity', 'Stress reduction'],
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'extended',
      name: 'Extended Exhale',
      description: 'Longer exhale for maximum relaxation',
      icon: <Moon size={24} />,
      phases: [
        { name: 'inhale', duration: 4, instruction: 'Breathe in naturally' },
        { name: 'exhale', duration: 8, instruction: 'Exhale slowly and completely' }
      ],
      cycles: 8,
      benefits: ['Activates parasympathetic', 'Deep calm', 'Sleep preparation'],
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'energizing',
      name: 'Energizing Breath',
      description: 'Quick inhale for gentle alertness',
      icon: <Sun size={24} />,
      phases: [
        { name: 'inhale', duration: 2, instruction: 'Quick, energizing inhale' },
        { name: 'exhale', duration: 4, instruction: 'Slow, releasing exhale' }
      ],
      cycles: 12,
      benefits: ['Gentle energy', 'Mental clarity', 'Balanced alertness'],
      color: 'from-yellow-500 to-orange-600'
    }
  ]

  const techniqueTheme = useMemo(() => {
    const themes = {
      '4-7-8': { rgb1: '59, 130, 246', rgb2: '168, 85, 247', rgb3: '99, 102, 241', hex1: '#3b82f6', hex2: '#a855f7' },
      box: { rgb1: '34, 197, 94', rgb2: '20, 184, 166', rgb3: '16, 185, 129', hex1: '#22c55e', hex2: '#14b8a6' },
      coherent: { rgb1: '168, 85, 247', rgb2: '236, 72, 153', rgb3: '217, 70, 239', hex1: '#a855f7', hex2: '#ec4899' },
      triangle: { rgb1: '6, 182, 212', rgb2: '37, 99, 235', rgb3: '56, 189, 248', hex1: '#06b6d4', hex2: '#2563eb' },
      extended: { rgb1: '99, 102, 241', rgb2: '168, 85, 247', rgb3: '129, 140, 248', hex1: '#6366f1', hex2: '#a855f7' },
      energizing: { rgb1: '234, 179, 8', rgb2: '249, 115, 22', rgb3: '251, 191, 36', hex1: '#eab308', hex2: '#f97316' },
    }

    return selectedTechnique ? (themes[selectedTechnique.id] || themes['4-7-8']) : themes['4-7-8']
  }, [selectedTechnique])

  const currentPhaseData = useMemo(() => {
    if (!selectedTechnique) return null
    return selectedTechnique.phases[phaseIndex] || selectedTechnique.phases[0] || null
  }, [selectedTechnique, phaseIndex])

  const currentPhase = currentPhaseData?.name || 'inhale'

  const phaseProgress = useMemo(() => {
    if (!currentPhaseData) return 0
    const clamped = Math.max(0, Math.min(1, phaseTime / currentPhaseData.duration))
    return clamped
  }, [currentPhaseData, phaseTime])

  const phaseIntensity = useMemo(() => {
    if (!isActive || !currentPhaseData) return 0
    if (currentPhase === 'hold') {
      return 0.6 + Math.sin(phaseProgress * Math.PI * 6) * 0.1
    }
    if (currentPhase === 'inhale') {
      return 0.25 + phaseProgress * 0.75
    }
    return 1 - phaseProgress * 0.75
  }, [currentPhase, currentPhaseData, isActive, phaseProgress])

  const particles = useMemo(() => {
    const techniqueId = selectedTechnique?.id || ''
    const count = 18

    let seed = 2166136261
    for (let i = 0; i < techniqueId.length; i++) {
      seed ^= techniqueId.charCodeAt(i)
      seed = Math.imul(seed, 16777619)
    }

    const nextRandom = () => {
      seed += 0x6D2B79F5
      let t = seed
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    const randomInRange = (min, max) => min + nextRandom() * (max - min)

    return Array.from({ length: count }, (_, i) => {
      const angle = (360 / count) * i + randomInRange(-12, 12)
      const distance = randomInRange(88, 138)
      const size = randomInRange(4, 9)
      const duration = randomInRange(6, 14)
      const delay = randomInRange(0, 2.5)
      const drift = randomInRange(-10, 10)
      const blur = randomInRange(0, 1.5)

      return { angle, distance, size, duration, delay, drift, blur }
    })
  }, [selectedTechnique])

  useEffect(() => {
    if (isActive && selectedTechnique) {
      intervalRef.current = setInterval(() => {
        setPhaseTime(prev => {
          const phaseData = selectedTechnique.phases[phaseIndex] || selectedTechnique.phases[0]
          if (!phaseData) return 0
          if (prev >= phaseData.duration) {
            // Play phase transition sound
            if (audioEnabled) {
              playPhaseTransitionSound()
            }
            
            // Move to next phase
            const nextIndex = (phaseIndex + 1) % selectedTechnique.phases.length
            
            if (nextIndex === 0) {
              setCycleCount(prevCount => {
                const newCount = prevCount + 1
                const targetCycles = customCycles || selectedTechnique.cycles
                if (newCount >= targetCycles) {
                  setIsActive(false)
                  if (audioEnabled) {
                    playCompletionSound()
                  }
                  // Log completed session
                  logSession(selectedTechnique, newCount, totalTimeRef.current)
                  return newCount
                }
                return newCount
              })
            }
            
            setPhaseIndex(nextIndex)
            return 0
          }
          return prev + 0.1
        })
        
        setTotalTime(prev => {
          const next = prev + 0.1
          totalTimeRef.current = next
          return next
        })
      }, 100)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isActive, phaseIndex, selectedTechnique, audioEnabled, customCycles])

  const startExercise = (technique) => {
    setSelectedTechnique(technique)
    setIsActive(true)
    setPhaseIndex(0)
    setCycleCount(0)
    setPhaseTime(0)
    setTotalTime(0)
    totalTimeRef.current = 0
    if (audioEnabled) {
      playStartSound()
    }
  }

  const toggleExercise = () => {
    setIsActive(!isActive)
  }

  const resetExercise = () => {
    setIsActive(false)
    setPhaseIndex(0)
    setCycleCount(0)
    setPhaseTime(0)
    setTotalTime(0)
    totalTimeRef.current = 0
  }

  const playStartSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    
    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(440, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3)
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }

  const playPhaseTransitionSound = () => {
    if (!audioContextRef.current) return
    
    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    const freq = currentPhase === 'inhale' ? 330 : currentPhase === 'exhale' ? 220 : 275
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime)
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  const playCompletionSound = () => {
    if (!audioContextRef.current) return
    
    const ctx = audioContextRef.current
    const frequencies = [440, 554, 659, 880]
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime)
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)
        
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.4)
      }, index * 150)
    })
  }

  const getBreathingCircleScale = () => {
    if (!selectedTechnique || !isActive) return 1

    const phaseData = selectedTechnique.phases[phaseIndex]
    if (!phaseData) return 1
    const progress = phaseTime / phaseData.duration
    
    // Use smooth easing functions for natural breathing feel
    const easeIn = (t) => t * t * t
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)
    
    switch (currentPhase) {
      case 'inhale': {
        // Smooth expansion with slight acceleration at the end
        const inhaleProgress = easeOut(progress)
        return 1 + (inhaleProgress * 0.9) // Scale from 1 to 1.9
      }
      case 'exhale': {
        // Gentle contraction with natural deceleration
        const exhaleProgress = easeIn(progress)
        return 1.9 - (exhaleProgress * 0.9) // Scale from 1.9 to 1
      }
      case 'hold': {
        // Gentle pulsing during hold phases - maintain scale based on previous phase
        const holdPulse = Math.sin(progress * Math.PI * 4) * 0.05
        // Check if this is after inhale (full) or after exhale (empty)
        const prevPhase = phaseIndex > 0 ? selectedTechnique.phases[phaseIndex - 1].name : 'exhale'
        const baseScale = prevPhase === 'inhale' ? 1.9 : 1.0
        return baseScale + holdPulse
      }
      default:
        return 1
    }
  }

  const getCircleGlow = () => {
    if (!selectedTechnique || !isActive) return '0 8px 32px rgba(0, 0, 0, 0.4)'

    const progress = phaseProgress
    let intensity = 0.15
    let color = techniqueTheme.rgb1

    switch (currentPhase) {
      case 'inhale': {
        intensity = 0.15 + (progress * 0.35)
        color = techniqueTheme.rgb1
        break
      }
      case 'exhale': {
        intensity = 0.5 - (progress * 0.35)
        color = techniqueTheme.rgb2
        break
      }
      case 'hold': {
        const holdPulse = Math.sin(progress * Math.PI * 6) * 0.1 + 0.4
        intensity = holdPulse
        color = techniqueTheme.rgb3
        break
      }
    }
    
    const baseGlow = `0 0 ${15 + intensity * 25}px rgba(${color}, ${intensity * 0.7})`
    const innerGlow = `inset 0 0 ${8 + intensity * 12}px rgba(${color}, ${intensity * 0.3})`
    return `${baseGlow}, ${innerGlow}`
  }

  const getBreathingWaveOffset = () => {
    if (!selectedTechnique || !isActive) return 0

    const phaseData = selectedTechnique.phases[phaseIndex]
    if (!phaseData) return 0
    const progress = phaseTime / phaseData.duration
    
    switch (currentPhase) {
      case 'inhale':
        return progress * 100
      case 'exhale':
        return 100 - (progress * 100)
      case 'hold': {
        // For hold phases, maintain the wave position based on previous phase
        const prevPhase = phaseIndex > 0 ? selectedTechnique.phases[phaseIndex - 1].name : 'exhale'
        return prevPhase === 'inhale' ? 100 : 0
      }
      default:
        return 0
    }
  }

  const getParticleColors = () => {
    return { primary: techniqueTheme.rgb1, secondary: techniqueTheme.rgb2, tertiary: techniqueTheme.rgb3 }
  }

  const getWaveColors = () => {
    const colors = getParticleColors()
    return {
      wave1: `rgba(${colors.primary}, 0.22)`,
      wave2: `rgba(${colors.secondary}, 0.18)`,
      wave3: `rgba(${colors.tertiary}, 0.12)`
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCurrentInstruction = () => {
    if (!selectedTechnique) return ''
    return currentPhaseData?.instruction || ''
  }

  const getPhaseProgress = () => {
    if (!currentPhaseData) return 0
    return phaseProgress * 100
  }



  return (
    <div className="breathing-exercise">
      {/* Header */}
      <div className="breathing-header">
        <div className="breathing-title">
          <Wind size={32} className="text-gradient" />
          <div>
            <h2 className="text-large text-gradient">Breathing Exercises</h2>
            <p className="text-small">Guided breathing techniques for relaxation and sleep</p>
          </div>
        </div>
      </div>

      {/* Technique Selection */}
      {!selectedTechnique && (
        <div className="technique-selection">
          <div className="selection-header">
            <h3 className="text-medium mb-6">Choose a Breathing Technique</h3>
            <div className="global-controls">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`btn ${audioEnabled ? 'btn-primary' : 'btn-secondary'} control-btn`}
                title={audioEnabled ? 'Disable audio cues' : 'Enable audio cues'}
              >
                {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                Audio {audioEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </div>
          <div className="techniques-grid">
            {breathingTechniques.map(technique => (
              <div key={technique.id} className="technique-card card">
                <div className={`technique-icon bg-gradient-to-br ${technique.color}`}>
                  {technique.icon}
                </div>
                <div className="technique-info">
                  <h4 className="technique-name">{technique.name}</h4>
                  <p className="technique-description">{technique.description}</p>
                  <div className="technique-details">
                    <div className="cycles-info">
                      {technique.cycles} cycles • {technique.phases.reduce((sum, phase) => sum + phase.duration, 0) * technique.cycles}s total
                    </div>
                    <div className="benefits">
                      {technique.benefits.map((benefit, index) => (
                        <span key={index} className="benefit-tag">{benefit}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => startExercise(technique)}
                    className="btn btn-primary technique-btn"
                  >
                    <Play size={16} />
                    Start Exercise
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Exercise */}
      {selectedTechnique && (
        <div className="active-exercise">
          {/* Exercise Info */}
          <div className="exercise-info card">
            <div className="exercise-header">
              <div className={`exercise-icon bg-gradient-to-br ${selectedTechnique.color}`}>
                {selectedTechnique.icon}
              </div>
              <div className="exercise-details">
                <h3 className="text-medium text-gradient">{selectedTechnique.name}</h3>
                <p className="text-small">{selectedTechnique.description}</p>
              </div>
              <div className="exercise-stats">
                <div className="stat">
                  <span className="stat-value">{cycleCount}</span>
                  <span className="stat-label">/ {customCycles || selectedTechnique.cycles}</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{formatTime(totalTime)}</span>
                  <span className="stat-label">elapsed</span>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn btn-secondary"
                title="Exercise settings"
              >
                <Settings size={16} />
              </button>
            </div>
            
            {showSettings && (
              <div className="exercise-settings">
                <div className="setting-group">
                  <label>Custom Cycles:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={customCycles || selectedTechnique.cycles}
                    onChange={(e) => setCustomCycles(parseInt(e.target.value) || selectedTechnique.cycles)}
                    className="cycles-input"
                  />
                </div>
                <div className="setting-group">
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`btn ${audioEnabled ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    Audio {audioEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Breathing Visualization */}
          <div
            className="breathing-visualization card"
            style={{
              '--breath-accent-rgb-1': techniqueTheme.rgb1,
              '--breath-accent-rgb-2': techniqueTheme.rgb2,
              '--breath-accent-rgb-3': techniqueTheme.rgb3,
              '--breath-intensity': `${phaseIntensity}`,
              '--breath-active': isActive ? '1' : '0',
              '--breath-phase-progress': `${phaseProgress}`,
              '--breath-wave': `${getBreathingWaveOffset() / 100}`,
            }}
          >
            <div className="breathing-circle-container">
              {/* Breathing Waves Background */}
              <div className="breathing-waves">
                {[...Array(3)].map((_, i) => {
                  const waveColors = getWaveColors()
                  const colorKeys = ['wave1', 'wave2', 'wave3']
                  return (
                    <div
                      key={i}
                      className={`breathing-wave wave-${i + 1}`}
                      style={{
                        animationDelay: `${i * 0.5}s`,
                        opacity: isActive ? 0.4 - (i * 0.1) : 0, // Reduced from 0.6 - (i * 0.15)
                        transform: `translate(-50%, -50%) scale(${1 + (getBreathingWaveOffset() / 100) * (0.3 + i * 0.2)})`,
                        borderColor: waveColors[colorKeys[i]]
                      }}
                    />
                  )
                })}
              </div>
              
              {/* Floating Particles */}
              <div className="breathing-particles">
                {particles.map((particle, i) => {
                  const colors = getParticleColors()
                  const particleColor = i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.tertiary
                  const opacity = 0.6 - (i * 0.015)
                  return (
                    <div
                      key={i}
                      className="breathing-particle"
                      style={{
                        '--particle-angle': `${particle.angle}deg`,
                        '--particle-distance': `${particle.distance}`,
                        '--particle-size': `${particle.size}px`,
                        '--particle-duration': `${particle.duration}s`,
                        '--particle-delay': `${particle.delay}s`,
                        '--particle-drift': `${particle.drift}px`,
                        '--particle-blur': `${particle.blur}px`,
                        opacity: isActive ? 0.35 : 0,
                        background: `radial-gradient(circle, rgba(${particleColor}, ${opacity * 0.5}), rgba(${particleColor}, ${opacity * 0.18}) 55%, transparent 75%)`,
                        boxShadow: `0 0 10px rgba(${particleColor}, ${opacity * 0.25})`,
                      }}
                    />
                  )
                })}
              </div>
              
              <div 
                className={`breathing-circle bg-gradient-to-br ${selectedTechnique.color} ${currentPhase} ${isActive ? 'active' : ''}`}
                style={{ 
                  transform: `translate(-50%, -50%) scale(${getBreathingCircleScale()})`,
                  boxShadow: getCircleGlow(),
                }}
              >
                <div className="circle-inner">
                  <div className="phase-indicator">
                    {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
                  </div>
                  <div className="breath-count">
                    {Math.ceil((selectedTechnique.phases.find(p => p.name === currentPhase)?.duration || 0) - phaseTime)}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Progress Ring */}
              <svg className="progress-ring" width="300" height="300">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={techniqueTheme.hex1} stopOpacity="0.55"/>
                    <stop offset="100%" stopColor={techniqueTheme.hex2} stopOpacity="0.5"/>
                  </linearGradient>
                  <filter id="progressGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="2"
                  opacity="0.2"
                />
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  strokeDashoffset={`${2 * Math.PI * 140 * (1 - getPhaseProgress() / 100)}`}
                  transform="rotate(-90 150 150)"
                  className="progress-circle"
                  filter="url(#progressGlow)"
                  style={{
                    strokeLinecap: 'round',
                    opacity: isActive ? 0.7 : 0.3
                  }}
                />
                
                {/* Breathing Rhythm Waves */}
                <g className="rhythm-waves">
                  {[...Array(4)].map((_, i) => (
                    <circle
                      key={i}
                      cx="150"
                      cy="150"
                      r={120 + i * 15}
                      fill="none"
                      stroke={`rgba(${techniqueTheme.rgb3}, ${0.06 - i * 0.01})`}
                      strokeWidth="1"
                      opacity={isActive ? (0.3 - i * 0.05) * (getBreathingWaveOffset() / 100) : 0}
                      style={{
                        transform: `scale(${1 + (getBreathingWaveOffset() / 100) * 0.05})`,
                        transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                    />
                  ))}
                </g>
              </svg>
            </div>

            <div className="breathing-instruction">
              <h3 key={`${currentPhase}-${phaseIndex}-${cycleCount}`} className="instruction-text">{getCurrentInstruction()}</h3>
              <div className="phase-info">
                <div className="phase-timer">
                  {Math.ceil((currentPhaseData?.duration || 0) - phaseTime)}s
                </div>
                <div className="phase-name">{currentPhase}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="breathing-controls">
            <button
              onClick={toggleExercise}
              className="btn btn-primary control-btn"
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
              {isActive ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={resetExercise}
              className="btn btn-secondary control-btn"
            >
              <RotateCcw size={20} />
              Reset
            </button>
            <button
              onClick={() => setSelectedTechnique(null)}
              className="btn btn-secondary control-btn"
            >
              Change Technique
            </button>
          </div>

          {/* Completion */}
          {!isActive && cycleCount >= (customCycles || selectedTechnique.cycles) && (
            <div className="completion-message card">
              <div className="completion-content">
                <Wind size={48} className="text-gradient completion-icon" />
                <h3 className="text-large text-gradient">Exercise Complete!</h3>
                <p className="text-small">
                  You've completed {customCycles || selectedTechnique.cycles} cycles of {selectedTechnique.name}. 
                  Your body and mind should feel more relaxed and ready for sleep.
                </p>
                <div className="completion-stats">
                  <div className="completion-stat">
                    <span className="stat-number">{formatTime(totalTime)}</span>
                    <span className="stat-text">Total time</span>
                  </div>
                  <div className="completion-stat">
                    <span className="stat-number">{cycleCount}</span>
                    <span className="stat-text">Cycles completed</span>
                  </div>
                </div>
                <div className="completion-actions">
                  <button
                    onClick={() => startExercise(selectedTechnique)}
                    className="btn btn-primary"
                  >
                    <Play size={16} />
                    Repeat Exercise
                  </button>
                  <button
                    onClick={() => setSelectedTechnique(null)}
                    className="btn btn-secondary"
                  >
                    Try Another Technique
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips and Recent Sessions */}
      <div className="breathing-tips card">
        <h3 className="text-medium mb-4">Breathing Exercise Tips</h3>
        <div className="tips-list">
          <div className="tip-item">
            <div className="tip-number">1</div>
            <div className="tip-content">
              <h4>Find a comfortable position</h4>
              <p>Sit or lie down in a quiet, comfortable space where you won't be disturbed.</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-number">2</div>
            <div className="tip-content">
              <h4>Follow the visual guide</h4>
              <p>Watch the breathing circle expand and contract to match your breath rhythm naturally.</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-number">3</div>
            <div className="tip-content">
              <h4>Don't force it</h4>
              <p>If you feel dizzy or uncomfortable, return to normal breathing and try again later.</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-number">4</div>
            <div className="tip-content">
              <h4>Practice regularly</h4>
              <p>Regular practice makes breathing exercises more effective for sleep and stress relief.</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-number">5</div>
            <div className="tip-content">
              <h4>Use audio cues</h4>
              <p>Enable audio for gentle sound cues that help you maintain rhythm without watching the screen.</p>
            </div>
          </div>
        </div>

        {recentSessions.length > 0 && (
          <div className="recent-sessions">
            <h4 className="text-medium mb-3">Recent Sessions</h4>
            <div className="sessions-list">
              {recentSessions.slice(-5).reverse().map((session, index) => (
                <div key={index} className="session-item">
                  <div className="session-info">
                    <span className="session-technique">{session.technique_name}</span>
                    <span className="session-details">
                      {session.cycles_completed} cycles • {Math.floor(session.total_duration_seconds / 60)}m {Math.floor(session.total_duration_seconds % 60)}s
                    </span>
                  </div>
                  <div className="session-date">
                    {new Date(session.session_date).toLocaleDateString()}
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

export default BreathingExercise
