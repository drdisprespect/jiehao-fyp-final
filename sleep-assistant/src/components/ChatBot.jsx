import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Volume2, Bot, User, Loader, Sparkles, MessageCircle, Clock } from 'lucide-react'
import { OpenAIService } from '../services/OpenAIService'
import { ttsService } from '../services/TTSService'
import { getApiBaseUrl } from '../services/apiBaseUrl'
import './ChatBot.css'

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your sleep assistant. I'm here to help you relax and prepare for a good night's sleep. How are you feeling tonight?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [openaiConnected, setOpenaiConnected] = useState(true)
  const [messageAnimations, setMessageAnimations] = useState({})
  const [inputFocused, setInputFocused] = useState(false)
  const [showQuickResponses, setShowQuickResponses] = useState(true)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const openaiService = useRef(new OpenAIService())
  const isSubmittingRef = useRef(false)
  
  const [assemblyToken, setAssemblyToken] = useState(null)
  
  // AssemblyAI refs
  const socketRef = useRef(null)
  const recorderRef = useRef(null)
  const audioContextRef = useRef(null)

  // Fetch AssemblyAI token on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const baseURL = getApiBaseUrl()
        const response = await fetch(`${baseURL}/api/assemblyai/token`)
        const data = await response.json()
        if (data.token) {
          setAssemblyToken(data.token)
        }
      } catch (error) {
        console.error('Error fetching AssemblyAI token:', error)
      }
    }
    fetchToken()
    
    // Refresh token every 9 minutes (token expires in 10 mins)
    const interval = setInterval(fetchToken, 9 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Only auto-scroll when shouldAutoScroll is true (when new messages are added)
    if (shouldAutoScroll) {
      scrollToBottom()
      setShouldAutoScroll(false) // Reset the flag after scrolling
    }
  }, [messages, shouldAutoScroll])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [inputMessage])

  useEffect(() => {
    // Check OpenAI connection on component mount
    const checkConnection = async () => {
      const connected = await openaiService.current.checkConnection()
      setOpenaiConnected(connected)
    }
    checkConnection()

    // Check TTS service connection
    const checkTTSConnection = async () => {
      try {
        const health = await ttsService.checkHealth()
        
        // Poll for TTS readiness if initializing
        if (!health.tts_initialized && health.status !== 'error') {
          const pollInterval = setInterval(async () => {
            const newHealth = await ttsService.checkHealth()
            
            if (newHealth.tts_initialized || newHealth.status === 'error') {
              clearInterval(pollInterval)
            }
          }, 3000)
          
          return () => clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('TTS connection check failed:', error)
      }
    }

    checkTTSConnection()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleInputChange = (e) => {
    setInputMessage(e.target.value)
    
    // Add typing animation effect without triggering scroll
    const container = e.target.closest('.premium-input-container')
    if (container) {
      container.classList.add('typing')
      clearTimeout(container.typingTimeout)
      container.typingTimeout = setTimeout(() => {
        container.classList.remove('typing')
      }, 500)
    }
  }

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim()
    if (!text || isLoading || isSubmittingRef.current) return

    // Hide quick responses after first user message
    setShowQuickResponses(false)
    
    // Set submitting flag to prevent race conditions (double submission)
    isSubmittingRef.current = true

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    }

    // Add message with entrance animation and trigger auto-scroll
    setMessages(prev => [...prev, userMessage])
    setMessageAnimations(prev => ({ ...prev, [userMessage.id]: 'slide-in-right' }))
    setShouldAutoScroll(true) // Trigger auto-scroll for new message
    setInputMessage('')
    setIsLoading(true)

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      const response = await openaiService.current.sendMessage(text, conversationHistory)
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      setMessageAnimations(prev => ({ ...prev, [botMessage.id]: 'slide-in-left' }))
      setShouldAutoScroll(true) // Trigger auto-scroll for bot response

      // Generate and play TTS if voice is enabled
      if (voiceEnabled) {
        try {
          setIsSpeaking(true)
          await ttsService.speakText(
            response,
            'Emily',
            () => {
              setIsSpeaking(false)
            },
            (error) => {
              console.error('TTS Error:', error)
              setIsSpeaking(false)
            }
          )
        } catch (error) {
          console.error('TTS Error:', error)
          setIsSpeaking(false)
        }
      }

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting right now. Please try again in a moment, or consider trying some breathing exercises while I get back online.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setMessageAnimations(prev => ({ ...prev, [errorMessage.id]: 'slide-in-left' }))
      setShouldAutoScroll(true) // Trigger auto-scroll for error message
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isSpeaking) {
      ttsService.stopAudio()
      setIsSpeaking(false)
    }
    // No auto-scroll for voice toggle
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isListeningRef = useRef(false)
  
  const startRecording = async () => {
    setIsListening(true)
    isListeningRef.current = true
    try {
      // Create AudioContext immediately to get sample rate
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const sampleRate = audioContext.sampleRate

      // Use pre-fetched token if available, otherwise fetch new one
      let token = assemblyToken
      
      const promises = []
      
      // Always start mic immediately
      promises.push(navigator.mediaDevices.getUserMedia({ audio: true }))
      
      // If no token, fetch it in parallel
      if (!token) {
        const baseURL = getApiBaseUrl()
        promises.push(fetch(`${baseURL}/api/assemblyai/token`).then(r => r.json()))
      }

      const results = await Promise.all(promises)
      const stream = results[0]
      
      if (!token) {
        const data = results[1]
        if (data.error) throw new Error(data.error)
        token = data.token
        setAssemblyToken(token)
      }

      // Connect WebSocket with dynamic sample rate
      const connectionParams = {
        sample_rate: sampleRate,
        format_turns: true,
        end_of_turn_confidence_threshold: 0.4,
        min_end_of_turn_silence_when_confident: 160,
        max_turn_silence: 1280,
        token: token
      }
      const queryString = new URLSearchParams(connectionParams).toString()
      const socket = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?${queryString}`)
      socketRef.current = socket

      // Store the initial message state when recording starts
      const initialMessage = inputRef.current ? inputRef.current.value : '';
      
      const turns = {}
      
      socket.onmessage = (message) => {
        try {
          const res = JSON.parse(message.data)
          
          if (res.type === 'Turn') {
            let turnText = ''
            if (res.words && res.words.length > 0) {
              turnText = res.words.map(w => w.text).join(' ')
            } else {
              turnText = res.transcript || ''
            }
            
            turns[res.turn_order] = turnText
            
            const sortedKeys = Object.keys(turns).sort((a, b) => parseInt(a) - parseInt(b))
            let fullMsg = ''
            for (const key of sortedKeys) {
              if (turns[key]) {
                fullMsg += (fullMsg ? ' ' : '') + turns[key]
              }
            }
            
            // Append the new transcription to the initial message
            // Add a space if there's initial content and it doesn't end with a space
            const separator = (initialMessage && !initialMessage.endsWith(' ')) ? ' ' : '';
            setInputMessage(initialMessage + separator + fullMsg)
            
          }
        } catch (e) {
          console.error('Error parsing message:', e)
        }
      }

      socket.onerror = (event) => {
        console.error('WebSocket error:', event)
        setIsListening(false)
      }

      socket.onclose = () => {
        setIsListening(false)
        socketRef.current = null
      }

      socket.onopen = () => {
        // Start Streaming Audio
        const source = audioContext.createMediaStreamSource(stream)
        const processor = audioContext.createScriptProcessor(4096, 1, 1)

        source.connect(processor)
        processor.connect(audioContext.destination)
        
        let silenceStart = Date.now()

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0)
          
          // Calculate RMS volume for silence detection
          let sum = 0
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i]
          }
          const rms = Math.sqrt(sum / inputData.length)
          
          // Silence detection (5 seconds)
          // Increased threshold to 0.03 to ignore white noise better
          const SILENCE_THRESHOLD = 0.03 
          const SILENCE_DURATION = 5000 // 5 seconds
          
          if (rms > SILENCE_THRESHOLD) {
            silenceStart = Date.now()
          } else if (Date.now() - silenceStart > SILENCE_DURATION) {
             // Auto-stop and send if silence persists
             // Use ref for immediate state access in callback
             if (socketRef.current && isListeningRef.current) { 
               // Need to trigger the stop and send on the main thread/React cycle to be safe
               if (socket.readyState === WebSocket.OPEN) {
                 socket.close() 
                 
                 // Clean up audio resources
                 if (recorderRef.current) {
                    const { stream, processor, source } = recorderRef.current
                    stream.getTracks().forEach(track => track.stop())
                    processor.disconnect()
                    source.disconnect()
                 }
                 if (audioContextRef.current) {
                   audioContextRef.current.close()
                 }
                 
                 // Update UI state
                 setIsListening(false)
                 isListeningRef.current = false
                 socketRef.current = null

                 // Reconstruct full text to send
                 const sortedKeys = Object.keys(turns).sort((a, b) => parseInt(a) - parseInt(b))
                 let fullMsg = ''
                 for (const key of sortedKeys) {
                   if (turns[key]) {
                     fullMsg += (fullMsg ? ' ' : '') + turns[key]
                   }
                 }
                 
                 const separator = (initialMessage && !initialMessage.endsWith(' ')) ? ' ' : ''
                 const finalText = (initialMessage + separator + fullMsg).trim()
                 
                 if (finalText) {
                   handleSendMessage(finalText)
                 }
               }
               return
             }
          }

          // Convert Float32 to Int16 (PCM)
          const bufferData = new Int16Array(inputData.length)
          for (let i = 0; i < inputData.length; i++) {
            // Clamp value between -1 and 1
            const s = Math.max(-1, Math.min(1, inputData[i]));
            // Scale to 16-bit integer range
            bufferData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(bufferData.buffer)
          }
        }

        recorderRef.current = { stream, processor, source }
      }

    } catch (error) {
      console.error('Error starting recording:', error)
      setIsListening(false)
    }
  }

  const stopRecording = () => {
    if (socketRef.current) {
      socketRef.current.close()
    }
    
    if (recorderRef.current) {
      const { stream, processor, source } = recorderRef.current
      stream.getTracks().forEach(track => track.stop())
      processor.disconnect()
      source.disconnect()
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    setIsListening(false)
    isListeningRef.current = false
  }

  const toggleRecording = () => {
    if (isListening) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const quickResponses = [
    { text: "I can't fall asleep", icon: <MessageCircle size={14} />, category: "Sleep Issues" },
    { text: "I'm feeling anxious", icon: <Sparkles size={14} />, category: "Anxiety" },
    { text: "Tell me a bedtime story", icon: <Bot size={14} />, category: "Stories" },
    { text: "Help me relax", icon: <Sparkles size={14} />, category: "Relaxation" },
    { text: "I'm stressed about tomorrow", icon: <MessageCircle size={14} />, category: "Stress" },
    { text: "Breathing exercises", icon: <Sparkles size={14} />, category: "Exercises" }
  ]

  return (
    <div className="chatbot premium-chatbot">
      {/* Premium Chat Header */}
      <div className="chat-header premium-header">
        <div className="header-content">
          <div className="bot-info">
            <div className="bot-avatar premium-avatar">
              <Bot size={28} />
              <div className="avatar-pulse"></div>
            </div>
            <div className="bot-details">
              <h3 className="bot-name">Sleep Coach AI</h3>
              <div className="bot-status">
                <div className={`status-dot ${openaiConnected ? 'online' : 'offline'}`}></div>
                <span className="status-text">
                  {isSpeaking ? 'Speaking...' : isLoading ? 'Thinking...' : openaiConnected ? 'Ready to help' : 'Offline mode'}
                </span>
                {isSpeaking && <div className="speaking-waves">
                  <span></span><span></span><span></span>
                </div>}
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={toggleVoice}
              className={`voice-toggle ${voiceEnabled ? 'enabled' : 'disabled'}`}
              title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
            >
              <Volume2 size={20} />
              <span className="toggle-label">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Premium Messages Container */}
      <div className="messages-container premium-messages">
        <div className="messages-wrapper">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-row ${message.type === 'user' ? 'user-row' : 'bot-row'}`}
            >
              <div className={`message premium-message ${message.type}-message ${messageAnimations[message.id] || ''}`}>
                <div className="message-avatar premium-message-avatar">
                  {message.type === 'user' ? (
                    <User size={20} />
                  ) : (
                    <Bot size={20} />
                  )}
                </div>
                <div className="message-bubble">
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                  </div>
                  <div className="message-meta">
                    <span className="message-time">
                      <Clock size={12} />
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-row bot-row">
              <div className="message premium-message bot-message loading-message">
                <div className="message-avatar premium-message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-bubble">
                  <div className="message-content">
                    <div className="typing-indicator premium-typing">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="typing-text">Sleep coach is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Premium Quick Responses */}
      {showQuickResponses && (
        <div className="quick-responses premium-quick-responses">
        <div className="quick-responses-header">
          <Sparkles size={18} />
          <span>Quick responses</span>
        </div>
        <div className="quick-responses-grid">
          {quickResponses.map((response, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(response.text)}
              className="quick-response-btn premium-quick-btn"
              disabled={isLoading}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="quick-btn-icon">{response.icon}</div>
              <div className="quick-btn-content">
                <span className="quick-btn-category">{response.category}</span>
                <span className="quick-btn-text">{response.text}</span>
              </div>
            </button>
          ))}
        </div>
        </div>
      )}

      {/* Premium Input Area */}
      <div className="chat-input-area premium-input-area">
        <div className={`chat-input-container premium-input-container ${inputFocused ? 'focused' : ''} ${inputMessage.length > 0 ? 'has-content' : ''}`}>
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Share what's on your mind tonight..."
              className="chat-input premium-input"
              rows={1}
              disabled={isLoading}
            />
            <div className="input-glow-effect"></div>
          </div>
          <div className="input-actions">
            <button
              onClick={toggleRecording}
              className={`mic-btn premium-mic-btn ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Stop recording' : 'Start recording'}
            >
              {isListening ? (
                <div className="mic-listening-animation">
                   <div className="mic-wave"></div>
                   <div className="mic-wave"></div>
                   <MicOff size={20} />
                </div>
              ) : (
                <Mic size={20} />
              )}
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn premium-send-btn"
              title="Send message"
            >
              <div className="send-btn-content">
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner-dot"></div>
                    <div className="spinner-dot"></div>
                    <div className="spinner-dot"></div>
                  </div>
                ) : (
                  <Send size={20} />
                )}
              </div>
              <div className="send-btn-ripple"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBot
