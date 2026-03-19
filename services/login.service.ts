export const login = async (email: string, password: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/Auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  if (response.ok) {
    return { success: true };
  } else {
    return { success: false, status: response.status };
  }
};
