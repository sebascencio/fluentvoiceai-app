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
  console.log('[Chat API] POST request recibido')
  try {
    const body = await req.json();
    console.log('[Chat API] Body parseado:', JSON.stringify(body).substring(0, 200))
    const { messages, userLevel = 'A2', userName = 'Student' } = body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'No hay mensajes para procesar' },
        { status: 400 }
      );
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';

    // Si no hay API key, usar respuestas de fallback inteligentes
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        content: getFallbackResponse(userName, userLevel, lastUserMessage),
        role: 'assistant'
      });
    }

    // Filtrar solo mensajes con roles válidos y contenido no vacío
    const validRoles = ['user', 'assistant'];
    const filteredMessages = messages
      .filter((m: any) => validRoles.includes(m.role) && m.content?.trim())
      .map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content).trim()
      }));

    // Contar interacciones para análisis periódico
    const interactionCount = filteredMessages.filter((m: any) => m.role === 'user').length;
    const shouldAnalyzeProgress = interactionCount > 0 && interactionCount % 5 === 0;

    // Preparar mensajes para Groq con formato correcto
    const systemPrompt = `Eres Sarah, una tutora de inglés amigable y cercana. Hablas con ${userName} (nivel ${userLevel}). Tu PRIORIDAD es su aprendizaje.

ESTRUCTURA DE RESPUESTA:
1. Si hay un error, CORRÍGELO PRIMERO de forma suave: "Actually, we say 'X' instead of 'Y'..." o "Quick fix: it's 'X' not 'Y'..."
2. Luego responde en inglés de forma natural y breve (1-3 oraciones), como un chat de WhatsApp.
3. Solo si es necesario, añade un tip en español al final (máximo 2 líneas).

REGLAS CLAVE:
- CORRECCIÓN PROACTIVA: Si detectas errores de gramática, conjugación (do/did/does, was/were, etc.) o vocabulario, corrígelos al INICIO de tu respuesta de forma amable.
- DETECCIÓN DE SPANGLISH: Si el usuario mezcla español porque no sabe una palabra, detecta el término y enséñale: "The word you're looking for is 'X'. Nice try mixing languages!"
- Tono casual y cálido. Evita frases genéricas como "Your grammar is improving".
- Haz preguntas para mantener la conversación activa.
- Varía tus respuestas, no repitas patrones.
${shouldAnalyzeProgress ? `
- ANÁLISIS DE PROGRESO: Es momento de un breve resumen (2 líneas en español al final): "Por cierto, hemos mejorado en [X], pero sigamos practicando [Y]."` : ''}

FORMATO: Corrección (si aplica) > Respuesta en inglés > Tip en español (solo si es necesario).`;

    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...filteredMessages
    ];

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 800,
    };

    console.log('[Chat API] Body a enviar - modelo:', requestBody.model, 'mensajes:', groqMessages.length);
    console.log('[Chat API] Primer mensaje (system):', groqMessages[0]?.content?.substring(0, 80));
    console.log('[Chat API] Último mensaje:', groqMessages[groqMessages.length - 1]);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chat API] Groq error 400:', response.status);
      console.error('[Chat API] Error response:', errorText.substring(0, 200));
      console.warn('[Chat API] Usando fallback response');
      // Usar fallback silenciosamente sin lanzar error
      return NextResponse.json({
        content: getFallbackResponse(userName, userLevel, lastUserMessage),
        role: 'assistant'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || getFallbackResponse(userName, userLevel, lastUserMessage);
    
    return NextResponse.json({
      content,
      role: 'assistant'
    });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json({ 
      content: "I'm sorry, I had a small technical issue. Could you please try again?", 
      role: 'assistant' 
    }, { status: 500 });
  }
}
