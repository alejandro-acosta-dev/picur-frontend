import { HardwareReading } from "@/interfaces/HardwareReading";

export const getReadings = async (): Promise<HardwareReading[]> => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reading`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};
