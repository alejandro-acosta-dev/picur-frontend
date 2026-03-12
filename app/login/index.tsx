import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/Logo2.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>FrigoSafe</Text>

        <Text style={styles.subtitle}>Monitoreo Inteligente de Vacunas</Text>

        <View style={styles.form}>
          <Input placeholder="Correo electrónico" />

          <Input placeholder="Contraseña" secureTextEntry />

          <Button
            title="Iniciar sesión"
            onPress={() => router.replace("/(tabs)")}
          />

          <Pressable onPress={() => router.push("/recover-password")}>
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  content: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },

  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 15,
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
  },

  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 5,
    marginBottom: 35,
    textAlign: "center",
  },

  form: {
    width: "100%",
    gap: 18,
  },

  forgot: {
    marginTop: 8,
    textAlign: "center",
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
});
