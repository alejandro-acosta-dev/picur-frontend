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
  const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleValidEmail = async () => {

    // 🔹 Validar campo vacío
    if (!email.trim()) {
      GetNotification("Por favor ingrese un correo electrónico");
      return;
    }

    // 🔹 Validar formato
    if (!isValidEmail(email)) {
      GetNotification("Ingrese un correo electrónico válido");
      return;
    }

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
        Aquí el usuario podrá ingresar su email se le enviará un código de autenticación.
      </Text>
      <Input
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 15 }}
      />
      <Button
        title="Validar email"
        onPress={handleValidEmail}
        disabled={!email || !isValidEmail(email)}
      />
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
    marginBottom: 20,
    color: "white",
  },
  text: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
    textAlign: "center",

  },
});
