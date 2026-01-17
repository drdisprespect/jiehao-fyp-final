import { useEffect, useRef } from 'react'

const AtmosphericAudio = ({ activeEffect, isEnabled, volume = 0.3 }) => {
  const audioContextRef = useRef(null)
  const soundsRef = useRef({})

  // Initialize Audio Context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Rain sound generator
  const createRainSound = () => {
    const ctx = audioContextRef.current
    const bufferSize = ctx.sampleRate * 2 // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate rain-like noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1 * Math.sin(i * 0.01)
    }

    const source = ctx.createBufferSource()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    
    filter.type = 'lowpass'
    filter.frequency.value = 2000
    gainNode.gain.value = volume * 0.8

    source.buffer = buffer
    source.loop = true
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    return { source, gainNode, filter }
  }

  // Campfire sound generator
  const createCampfireSound = () => {
    const ctx = audioContextRef.current
    const bufferSize = ctx.sampleRate * 3
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate crackling fire sound
    for (let i = 0; i < bufferSize; i++) {
      const crackle = Math.random() > 0.99 ? Math.random() * 0.5 : 0
      const base = Math.sin(i * 0.001) * 0.1
      data[i] = base + crackle + (Math.random() * 2 - 1) * 0.05
    }

    const source = ctx.createBufferSource()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 2
    gainNode.gain.value = volume * 0.6

    source.buffer = buffer
    source.loop = true
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    return { source, gainNode, filter }
  }

  // Wind sound generator
  const createWindSound = () => {
    const ctx = audioContextRef.current
    const bufferSize = ctx.sampleRate * 4
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate wind-like whooshing sound
    for (let i = 0; i < bufferSize; i++) {
      const wave = Math.sin(i * 0.0001) * Math.sin(i * 0.00005)
      data[i] = wave * 0.3 + (Math.random() * 2 - 1) * 0.1
    }

    const source = ctx.createBufferSource()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    
    filter.type = 'lowpass'
    filter.frequency.value = 500
    gainNode.gain.value = volume * 0.5

    source.buffer = buffer
    source.loop = true
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    return { source, gainNode, filter }
  }

  // Storm sound generator
  const createStormSound = () => {
    const rainSound = createRainSound()
    const windSound = createWindSound()
    
    // Increase intensity for storm
    rainSound.gainNode.gain.value = volume * 1.2
    windSound.gainNode.gain.value = volume * 0.8
    rainSound.filter.frequency.value = 3000
    
    return { 
      rain: rainSound, 
      wind: windSound,
      stop: () => {
        rainSound.source.stop()
        windSound.source.stop()
      },
      start: () => {
        rainSound.source.start()
        windSound.source.start()
      }
    }
  }

  // Snow sound generator (gentle wind)
  const createSnowSound = () => {
    const ctx = audioContextRef.current
    const bufferSize = ctx.sampleRate * 5
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate gentle winter wind
    for (let i = 0; i < bufferSize; i++) {
      const gentle = Math.sin(i * 0.00001) * Math.sin(i * 0.000005)
      data[i] = gentle * 0.2 + (Math.random() * 2 - 1) * 0.03
    }

    const source = ctx.createBufferSource()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    
    filter.type = 'lowpass'
    filter.frequency.value = 300
    gainNode.gain.value = volume * 0.4

    source.buffer = buffer
    source.loop = true
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    return { source, gainNode, filter }
  }

  // Lightning sound generator
  const createLightningSound = () => {
    const ctx = audioContextRef.current
    
    // Create thunder rumble
    const createThunder = () => {
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (ctx.sampleRate * 0.5))
        data[i] = (Math.random() * 2 - 1) * 0.8 * decay
      }

      const source = ctx.createBufferSource()
      const gainNode = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      
      filter.type = 'lowpass'
      filter.frequency.value = 200
      gainNode.gain.value = volume * 0.7

      source.buffer = buffer
      source.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)

      return source
    }

    return { createThunder }
  }

  // Stop current sounds
  const stopCurrentSounds = () => {
    Object.values(soundsRef.current).forEach(sound => {
      if (sound && sound.stop) {
        try {
          sound.stop()
        } catch {
          return
        }
      }
    })
    soundsRef.current = {}
  }

  // Start sound for effect
  const startSound = (effect) => {
    if (!audioContextRef.current || !isEnabled) return

    // Resume audio context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }

    stopCurrentSounds()

    try {
      switch (effect) {
        case 'rain':
          soundsRef.current.rain = createRainSound()
          soundsRef.current.rain.source.start()
          break
        case 'campfire':
          soundsRef.current.campfire = createCampfireSound()
          soundsRef.current.campfire.source.start()
          break
        case 'wind':
          soundsRef.current.wind = createWindSound()
          soundsRef.current.wind.source.start()
          break
        case 'storm':
          soundsRef.current.storm = createStormSound()
          soundsRef.current.storm.start()
          break
        case 'snow':
          soundsRef.current.snow = createSnowSound()
          soundsRef.current.snow.source.start()
          break
        case 'lightning': {
          soundsRef.current.storm = createStormSound()
          soundsRef.current.storm.start()
          // Add periodic thunder
          const lightning = createLightningSound()
          const thunderInterval = setInterval(() => {
            if (activeEffect === 'lightning') {
              const thunder = lightning.createThunder()
              thunder.start()
            } else {
              clearInterval(thunderInterval)
            }
          }, 3000 + Math.random() * 5000)
          soundsRef.current.thunderInterval = thunderInterval
          break
        }
      }
    } catch (error) {
      console.warn('Audio playback failed:', error)
    }
  }

  // Effect change handler
  useEffect(() => {
    if (activeEffect && isEnabled) {
      startSound(activeEffect)
    } else {
      stopCurrentSounds()
    }

    return () => {
      if (soundsRef.current.thunderInterval) {
        clearInterval(soundsRef.current.thunderInterval)
      }
    }
  }, [activeEffect, isEnabled])

  // Volume change handler
  useEffect(() => {
    Object.values(soundsRef.current).forEach(sound => {
      if (sound && sound.gainNode) {
        sound.gainNode.gain.value = volume * (sound.gainNode.gain.value / volume || 0.5)
      }
    })
  }, [volume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentSounds()
      if (soundsRef.current.thunderInterval) {
        clearInterval(soundsRef.current.thunderInterval)
      }
    }
  }, [])

  return null // This component doesn't render anything
}

export default AtmosphericAudio
