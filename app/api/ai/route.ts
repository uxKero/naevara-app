import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, currentText, sectionTitle, context, model, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API key de OpenRouter requerida" }, { status: 400 });
    }

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

Responde SIEMPRE en español. Mantenés el tono y voz del resto del perfil.
Sección actual: "${sectionTitle}"`;

    const userMessage = currentText
      ? `Texto actual:\n"${currentText}"\n\nInstrucción: ${prompt}`
      : `Instrucción: ${prompt}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://naevara-app.local",
        "X-Title": "Naevara Character App",
      },
      body: JSON.stringify({
        model,
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
