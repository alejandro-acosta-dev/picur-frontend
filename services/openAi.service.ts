export const createQuestion = async (question: string): Promise<string> => {
  const ahora = new Date();
  const contextoFecha = ahora.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const preguntaEnriquecida = `[Fecha y hora actual: ${contextoFecha}]\n${question}`;

  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/OpenAI`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preguntaEnriquecida),
  });

  const text = await response.text();

  try {
    const parsed = JSON.parse(text);
    return parsed.response ?? text;
  } catch {
    return text;
  }
};
