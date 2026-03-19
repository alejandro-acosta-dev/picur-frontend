export const notification = async () => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/Notification/send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return await response.json();
};

export const recoveryPasswordByEmail = async (email: string) => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/User/by-email/${email}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
};
