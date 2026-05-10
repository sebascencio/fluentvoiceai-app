// ARCHIVO: app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, userLevel, userName } = await req.json();

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

    const data = await response.json();
    return NextResponse.json(data.choices[0].message);
  } catch (error) {
    return NextResponse.json({ error: 'Error al conectar con Groq' }, { status: 500 });
  }
}