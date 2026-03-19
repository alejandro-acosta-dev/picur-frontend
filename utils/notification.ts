import * as Notifications from "expo-notifications";

export const GetNotification = async (message: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: message,
    },
    trigger: null,
  });
};
