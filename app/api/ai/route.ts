import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, currentText, sectionTitle, context, model, apiKey, mode, tipo } = await req.json();

    // La key del servidor es la fuente por defecto; el cliente puede mandar una propia.
    const key = apiKey || process.env.OPENROUTER_API_KEY;
    const chosenModel = model || process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku";

    if (!key) {
      return NextResponse.json(
        { error: "No hay API key de OpenRouter (ni en el servidor ni en el pedido)" },
        { status: 400 }
      );
    }

    const tipoNota =
      tipo === "personal"
        ? "Esta entrada es algo íntimo de Naevara: lo que vivió, sintió, descubrió o decidió."
        : tipo === "partida"
        ? "Esta entrada narra lo que ocurrió en una sesión de juego con el grupo."
        : "";

    const systemPrompt = `Sos una asistente de escritura creativa especializada en roleplay de D&D y fantasía.
Tu trabajo es ayudar a desarrollar el perfil, historia y narrativa del personaje Naevara Tirael.

Contexto del personaje:
- Semielfa brujo del Gran Antiguo, Pacto del Tomo
- Criada en el borde del Bosque Oscuro
- Observadora, habla poco pero cada palabra es precisa
- Tiene un mechón ceniza desde la noche del pacto
- Su abuela era adivina y le enseñó astronomía y runas
- Tiene la Escritura del Umbral: un sistema de símbolos propio que nadie más puede leer
- Coexisten en ella: Sehanine Moonbow (diosa de la luna) y el Gran Antiguo
- La voz del Gran Antiguo se intensificó al llegar a RedMica/Atlanta
- Tono narrativo: poético, misterioso, preciso. Nunca grandilocuente.

${context ? `Contexto adicional: ${context}` : ""}
${tipoNota}

Responde SIEMPRE en español. Mantenés el tono y voz del resto del perfil.
Sección actual: "${sectionTitle}"`;

    // Modo "mejorar": instrucción horneada, no hace falta que el usuario escriba nada.
    const improveInstruction = `Mejorá y pulí el siguiente texto para que esté MUCHO mejor escrito: más evocador, claro y con mejor ritmo, sin inventar hechos nuevos ni cambiar lo que dice. Mantené el tono poético, misterioso y preciso del personaje. Devolvé ÚNICAMENTE el texto final mejorado, sin comillas, sin encabezados ni comentarios.${
      prompt?.trim() ? `\n\nAdemás tené en cuenta esta indicación: ${prompt.trim()}` : ""
    }`;

    const instruction = mode === "improve" ? improveInstruction : prompt;

    const userMessage = currentText
      ? `Texto actual:\n"${currentText}"\n\nInstrucción: ${instruction}`
      : `Instrucción: ${instruction}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://naevara-app.vercel.app",
        "X-Title": "Naevara Character App",
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.error?.message || `Error OpenRouter: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ result });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
