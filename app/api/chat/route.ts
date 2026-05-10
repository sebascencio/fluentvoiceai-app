import { NextResponse } from 'next/server';

// Fallback responses cuando no hay API key configurada
function getFallbackResponse(userName: string, userLevel: string, lastMessage: string): string {
  const msg = lastMessage.toLowerCase()
  
  if (msg.match(/^(hi|hello|hey|hola|good morning|good afternoon|good evening)/)) {
    return `Hello ${userName}! Great to see you today. I'm Sarah, your English tutor. How are you feeling? Ready to practice some ${userLevel} level English?`
  }
  
  if (msg.includes('how are you')) {
    return `I'm doing wonderful, thank you for asking! As your ${userLevel} level tutor, I'm excited to help you improve. What would you like to practice today?`
  }
  
  if (msg.match(/(bye|goodbye|see you)/)) {
    return `Goodbye, ${userName}! You did great today. Keep practicing and I'll see you next time!`
  }
  
  const responses = [
    `That's interesting, ${userName}! Can you tell me more about that in English?`,
    `Good effort! For ${userLevel} level, you're doing well. Let's continue practicing.`,
    `Nice! I'd love to hear more. What else can you share about this topic?`,
    `Great job expressing yourself, ${userName}. Keep going!`,
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

export async function POST(req: Request) {
  try {
    const { messages, userLevel, userName } = await req.json();
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || ''

    // Si no hay API key, usar respuestas de fallback
    if (!process.env.GROQ_API_KEY) {
      console.warn('[Chat API] GROQ_API_KEY no configurada, usando respuestas de fallback')
      return NextResponse.json({
        content: getFallbackResponse(userName || 'Student', userLevel || 'A2', lastUserMessage),
        role: 'assistant'
      })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Eres Sarah, una tutora de inglés muy humana y cercana. Hablas con ${userName}, nivel ${userLevel}.

            ESTRUCTURA DE TU RESPUESTA:
            1. Responde primero en inglés a lo que el usuario dijo, manteniendo la conversación natural y adaptada al nivel ${userLevel}.
            2. Inmediatamente después, si hubo un error, añade un párrafo breve en ESPAÑOL que empiece de forma natural, por ejemplo: "Por cierto, una pequeña observación...", "Estuvo genial, solo que...", o "Un tip rápido sobre lo que dijiste...".
            3. Menciona la palabra o frase en inglés que se debe corregir y explica por qué en español.

            REGLA CRÍTICA: No uses etiquetas como "Feedback:", "Corrección:" o "Notas:". Habla como lo haría una profesora real en una charla amistosa.`
          },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json();
    
    return NextResponse.json({
      content: data.choices?.[0]?.message?.content || getFallbackResponse(userName, userLevel, lastUserMessage),
      role: 'assistant'
    });
  } catch (error) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json({ 
      content: "I'm sorry, I had a small technical issue. Could you please try again?", 
      role: 'assistant' 
    }, { status: 500 });
  }
}
