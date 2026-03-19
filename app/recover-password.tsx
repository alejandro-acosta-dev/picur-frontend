import { notification, recoveryPasswordByEmail } from "@/services/notification.service";
import { GetNotification } from "@/utils/notification";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "./components/Button";
import Input from "./components/Input";

export default function RecoverPasswordScreen() {
  const [email, setEmail] = useState("");

  const handleValidEmail = async () => {
    let responseEmail = await recoveryPasswordByEmail(email);
    if (responseEmail) {
      let response = await notification();
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        return;
      } else {
        if (response) {
          GetNotification(response.message);
          router.push({
            pathname: "/verify-code",
            params: {
              code: response.code,
              userId: responseEmail.id
            },
          });
        } else {
          GetNotification("Error al enviar el código");
        }
      }

    } else {
      GetNotification("El email ingresado no es válido");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.text}>
        Aquí el usuario podrá ingresar el código y su nueva contraseña.
      </Text>
      <Input
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Validar email" onPress={() => handleValidEmail()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    marginBottom: 400,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: "white",
  },
  text: {
    fontSize: 16,
    color: "white",
  },
});
