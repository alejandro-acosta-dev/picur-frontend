import { ChatMessage } from "@/types";

export const getAllChats = async (): Promise<ChatMessage[]> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/ChatMessageHistory`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();

  return data.map(
    (item: any): ChatMessage => ({
      role: item.role,
      content: item.content,
      createdAt: item.createdAt,
    }),
  );
};

export const cleanHistory = async () => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/ChatMessageHistory`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response;
};
