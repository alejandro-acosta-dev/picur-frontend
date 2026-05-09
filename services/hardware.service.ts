export const getLatestReading = async () => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/SensorData/latest`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return await response.json();
};

export const getReadings = async () => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/SensorData`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
};
