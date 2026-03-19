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

export const createUser = async (
  name: string,
  email: string,
  phone: string,
  password: string,
) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/User`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      password,
    }),
  });
  return await response;
};

export const getUsers = async () => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/User`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
};
