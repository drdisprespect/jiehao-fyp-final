class TTSService {
  constructor() {
    // Use environment variable for API URL
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    
    console.log('TTSService initialized with baseURL:', this.baseURL)
    this.isInitialized = false
    this.currentAudio = null
    this.audioQueue = []
    this.isPlaying = false
  }

  /**
   * Check if the TTS service is ready
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      const data = await response.json()
      this.isInitialized = data.tts_initialized
      return data
    } catch (error) {
      console.error('TTS health check failed:', error)
      this.isInitialized = false
      return { status: 'error', tts_initialized: false, message: 'Service unavailable' }
    }
  }

  /**
   * Convert text to speech and return audio URL
   */
  async textToSpeech(text, speakerName = 'Speaker 1') {
    try {
      // Validate input
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Text cannot be empty or invalid')
      }

      if (text.length > 10000) {
        throw new Error('Text is too long (max 10000 characters)')
      }

      if (!this.isInitialized) {
        const health = await this.checkHealth()
        if (!health.tts_initialized) {
          throw new Error('TTS service is not ready yet. Please wait a moment and try again.')
        }
      }

      const response = await fetch(`${this.baseURL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          speaker_name: speakerName
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('TTS API error response:', response.status, errorText)
        throw new Error(`TTS API Error (${response.status}): ${errorText}`)
      }

      const data = await response.json()

      if (!data.success) {
        console.error('TTS API returned error:', data)
        throw new Error(data.error || 'Failed to generate speech')
      }

      return {
        audioUrl: `${this.baseURL}${data.audio_url}`,
        audioId: data.audio_id,
        duration: data.duration,
        generationTime: data.generation_time,
        realTimeFactor: data.real_time_factor
      }

    } catch (error) {
      console.error('TTS error:', error)
      throw error
    }
  }

  /**
   * Play audio from URL
   */
  async playAudio(audioUrl, onEnd = null, onError = null) {
    try {
      // Stop current audio if playing
      this.stopAudio()

      this.currentAudio = new Audio(audioUrl)
      this.isPlaying = true

      this.currentAudio.onended = () => {
        this.isPlaying = false
        this.currentAudio = null
        if (onEnd) onEnd()
        this.playNextInQueue()
      }

      this.currentAudio.onerror = (error) => {
        console.error('Audio playback error:', error)
        console.error('Audio error details:', {
          error: this.currentAudio.error,
          networkState: this.currentAudio.networkState,
          readyState: this.currentAudio.readyState,
          src: this.currentAudio.src
        })
        this.isPlaying = false
        this.currentAudio = null
        if (onError) onError(error)
        this.playNextInQueue()
      }

      // Set volume
      this.currentAudio.volume = 0.8

      await this.currentAudio.play()

    } catch (error) {
      console.error('Audio play error:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      })
      this.isPlaying = false
      this.currentAudio = null
      if (onError) onError(error)
    }
  }

  /**
   * Stop current audio playback
   */
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
    this.isPlaying = false
  }

  /**
   * Add audio to queue for sequential playback
   */
  queueAudio(audioUrl, onEnd = null, onError = null) {
    this.audioQueue.push({ audioUrl, onEnd, onError })
    
    // If not currently playing, start the queue
    if (!this.isPlaying) {
      this.playNextInQueue()
    }
  }

  /**
   * Play next audio in queue
   */
  playNextInQueue() {
    if (this.audioQueue.length > 0 && !this.isPlaying) {
      const { audioUrl, onEnd, onError } = this.audioQueue.shift()
      this.playAudio(audioUrl, onEnd, onError)
    }
  }

  /**
   * Clear audio queue
   */
  clearQueue() {
    this.audioQueue = []
  }

  /**
   * Split long text into chunks for TTS
   */
  splitTextIntoChunks(text, maxLength = 1800) {
    if (text.length <= maxLength) {
      return [text]
    }

    const chunks = []
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    let currentChunk = ''

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) continue

      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence

      if (potentialChunk.length <= maxLength) {
        currentChunk = potentialChunk
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.')
          currentChunk = trimmedSentence
        } else {
          // Single sentence is too long, split by words
          const words = trimmedSentence.split(' ')
          let wordChunk = ''
          for (const word of words) {
            if ((wordChunk + ' ' + word).length <= maxLength) {
              wordChunk += (wordChunk ? ' ' : '') + word
            } else {
              if (wordChunk) chunks.push(wordChunk)
              wordChunk = word
            }
          }
          if (wordChunk) currentChunk = wordChunk
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + '.')
    }

    return chunks
  }

  /**
   * Convert text to speech with streaming for real-time playback
   */
  async speakText(text, speakerName = 'Speaker 1', onEnd = null, onError = null) {
    try {
      // For any text longer than 1000 chars, use streaming approach
      if (text.length > 1000) {
        return await this.streamingTTS(text, speakerName, onEnd, onError)
      } else {
        // Short text - process normally
        const result = await this.textToSpeech(text, speakerName)
        await this.playAudio(result.audioUrl, onEnd, onError)
        return result
      }
    } catch (error) {
      console.error('🔴 Speak text error:', error)
      if (onError) onError(error)
      throw error
    }
  }

  /**
   * Streaming TTS for real-time playback of long text
   */
  async streamingTTS(text, speakerName, onEnd, onError) {
    try {
      // Split into smaller, optimal chunks for faster processing
      const chunks = this.splitTextIntoChunks(text, 800) // Smaller chunks for faster TTS
      
      let hasStartedPlaying = false
      const audioQueue = []
      
      // Process chunks in parallel but play sequentially
      const chunkPromises = chunks.map(async (chunk, index) => {
        try {
          const result = await this.textToSpeech(chunk, speakerName)
          
          // Add to queue with order information
          audioQueue[index] = {
            audioUrl: result.audioUrl,
            audioId: result.audioId,
            index: index,
            ready: true
          }
          
          // Start playing as soon as first chunk is ready
          if (!hasStartedPlaying && index === 0) {
            hasStartedPlaying = true
            this.playStreamingQueue(audioQueue, chunks.length, onEnd, onError)
          }
          
          return result
        } catch (error) {
          console.error(`Chunk ${index + 1} failed:`, error)
          audioQueue[index] = { error: error, index: index, ready: false }
          throw error
        }
      })
      
      // Wait for all chunks to complete
      await Promise.allSettled(chunkPromises)
      
      return { 
        streaming: true, 
        chunkCount: chunks.length,
        totalLength: text.length
      }
      
    } catch (error) {
      console.error('Streaming TTS error:', error)
      if (onError) onError(error)
      throw error
    }
  }

  /**
   * Play streaming audio queue in order
   */
  async playStreamingQueue(audioQueue, totalChunks, onEnd, onError) {
    let currentIndex = 0
    
    const playNext = () => {
      // Find next ready chunk
      while (currentIndex < totalChunks) {
        const chunk = audioQueue[currentIndex]
        
        if (chunk && chunk.ready && chunk.audioUrl) {
          console.log(`🔊 Playing streaming chunk ${currentIndex + 1}/${totalChunks}`)
          
          const isLast = currentIndex === totalChunks - 1
          this.playAudio(
            chunk.audioUrl,
            () => {
              // Clean up this chunk
              if (chunk.audioId) {
                this.deleteAudio(chunk.audioId)
              }
              
              currentIndex++
              
              if (isLast) {
                if (onEnd) onEnd()
              } else {
                // Play next chunk
                setTimeout(playNext, 100) // Small gap between chunks
              }
            },
            (error) => {
              console.error(`Streaming playback error on chunk ${currentIndex + 1}:`, error)
              currentIndex++
              if (onError) onError(error)
              // Continue with next chunk
              setTimeout(playNext, 100)
            }
          )
          break
        } else if (chunk && chunk.error) {
          // Skip failed chunks
          currentIndex++
        } else {
          // Wait for chunk to be ready
          setTimeout(playNext, 200)
          break
        }
      }
    }
    
    playNext()
  }

  /**
   * Convert text to speech and add to queue
   */
  async queueText(text, speakerName = 'Speaker 1', onEnd = null, onError = null) {
    try {
      const result = await this.textToSpeech(text, speakerName)
      this.queueAudio(result.audioUrl, onEnd, onError)
      return result
    } catch (error) {
      console.error('Queue text error:', error)
      if (onError) onError(error)
      throw error
    }
  }

  /**
   * Delete audio file from server to free up space
   */
  async deleteAudio(audioId) {
    try {
      await fetch(`${this.baseURL}/api/audio/${audioId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Delete audio error:', error)
    }
  }

  /**
   * Get current playback status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isInitialized: this.isInitialized,
      queueLength: this.audioQueue.length,
      currentTime: this.currentAudio ? this.currentAudio.currentTime : 0,
      duration: this.currentAudio ? this.currentAudio.duration : 0
    }
  }
}

// Export singleton instance
export const ttsService = new TTSService()
export default TTSService
