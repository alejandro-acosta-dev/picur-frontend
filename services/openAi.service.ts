export const createQuestion = async (question: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/OpenAI`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(question),
  });
  return await response.text();
};
