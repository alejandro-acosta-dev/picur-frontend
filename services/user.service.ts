export const updatePassword = async (userId: string, newPassword: string) => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/User/update-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
        password: newPassword,
      }),
    },
  );
  return await response;
};
