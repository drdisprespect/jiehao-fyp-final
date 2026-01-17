class OpenAIService {
  constructor() {
    // Use environment variable for API URL, fallback to localhost for local dev
    this.baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : window.location.origin)
    this.systemPrompt = `You are a gentle, empathetic sleep coach and wellness assistant. Your role is to help users relax, unwind, and prepare for restful sleep. You should:

- Provide calming, soothing responses
- Offer practical sleep hygiene tips and relaxation techniques
- Use a warm, understanding tone
- For regular conversations, keep responses concise but helpful (2-3 sentences)
- Focus on immediate comfort and relaxation
- Suggest breathing exercises, progressive muscle relaxation, or mindfulness techniques when appropriate
- Avoid stimulating topics or complex discussions
- If users seem anxious or stressed, acknowledge their feelings and guide them toward calming activities

IMPORTANT TEXT FORMATTING RULES:
- NEVER use emojis, special characters, or symbols in your responses
- Avoid quotation marks, asterisks, parentheses, or other punctuation that might interfere with text-to-speech
- Use only letters, numbers, basic punctuation (periods, commas), and spaces
- Write in clear, simple sentences that flow naturally when spoken aloud

STORYTELLING MODE: When users ask for stories, bedtime stories, or visualizations:
- IMMEDIATELY begin the story without any preamble, introduction, or "Here's a story..." 
- Start directly with immersive scene-setting
- Use present tense and second person ("You find yourself...")
- Create vivid, peaceful imagery that engages the senses
- Include gentle sounds, soft textures, warm lighting, and calming scents
- Guide the listener through a slow, meandering journey
- Build in natural pauses and breathing moments
- End with the listener settling into a comfortable, safe space ready for sleep
- Keep stories between 3-5 minutes when read aloud
- Focus on themes of safety, warmth, comfort, and tranquility
- Avoid any conflict, tension, or stimulating elements

Remember: Create diverse, unique stories each time. Never repeat the same setting or characters. Make each story a completely different peaceful journey that guides the listener naturally toward sleep.`
  }

  async sendMessage(userMessage, conversationHistory = []) {
    try {
      const requestBody = {
        message: userMessage,
        conversation_history: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HTTP error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.success && data.response) {
        return data.response.trim()
      } else {
        throw new Error(data.error || 'No response from OpenAI')
      }
    } catch (error) {
      console.error('❌ OpenAI Service error:', error.name, error.message)
      
      // Fallback to a gentle error message
      const fallbackResponses = [
        "I'm here with you. Take a deep breath and let your body relax. Sometimes the best thing we can do is simply focus on the present moment.",
        "Let's focus on what we can control right now - your breathing. Try breathing in slowly for 4 counts, then out for 6 counts.",
        "I understand you're seeking some guidance tonight. Remember that rest is important, and you deserve peaceful sleep. Try to release any tension in your shoulders and jaw.",
        "Even when things feel uncertain, your body knows how to rest. Let's create a calm space together. What usually helps you feel most relaxed?"
      ]
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  async generateSleepRoutine(preferences) {
    try {
      const requestBody = {
        preferences: preferences
      }
      
      const response = await fetch(`${this.baseURL}/api/sleep-routine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HTTP error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.success && data.routine) {
        return data.routine.trim()
      } else {
        throw new Error(data.error || 'Failed to generate sleep routine')
      }
    } catch (error) {
      console.error('❌ Sleep routine generation error:', error.name, error.message)
      
      // Fallback routine
      return `Let's begin your personalized sleep routine. Find a comfortable position and take a deep breath.

First, let's prepare your space. Dim the lights and ensure your room is at a comfortable temperature. Take a moment to put away any devices or distractions.

Now, let's start with some gentle breathing. Breathe in slowly through your nose for four counts. Hold for two counts. Breathe out through your mouth for six counts. Repeat this pattern three more times.

Next, we'll do some progressive muscle relaxation. Starting with your toes, tense them for five seconds, then release. Feel the tension melt away. Move up to your calves, tense and release. Continue this pattern through your thighs, abdomen, hands, arms, shoulders, and face.

Finally, let your mind settle. Imagine yourself in a peaceful place where you feel completely safe and relaxed. Focus on the gentle sounds and sensations of this place. Allow your breathing to become natural and easy.

Rest well tonight. You deserve peaceful, restorative sleep.`
    }
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/openai/health`)
      
      if (response.ok) {
        const health = await response.json()
        return health.status === 'healthy'
      } else {
        console.warn('OpenAI backend responded but not OK:', response.status)
        return false
      }
    } catch (error) {
      console.error('OpenAI backend connection check failed:', error.name, error.message)
      return false
    }
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      
      if (response.ok) {
        const health = await response.json()
        return health
      } else {
        console.warn('Backend health check failed:', response.status)
        return { status: 'error', openai_initialized: false, message: 'Backend not accessible' }
      }
    } catch (error) {
      console.error('Backend health check failed:', error.name, error.message)
      return { status: 'error', openai_initialized: false, message: 'Backend connection failed' }
    }
  }
}

export { OpenAIService }
