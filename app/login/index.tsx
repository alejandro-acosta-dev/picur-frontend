import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet, Text, View
} from "react-native";
import { login } from "../../services/login.service";
import Button from "../components/Button";
import Input from "../components/Input";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    let response = await login(email, password);
    if (response.success) {
      router.push("/home");
    } else {
      setError("Correo electrónico o contraseña incorrectos");
      // setEmail("");
      setPassword("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <Image
              source={require("../../assets/images/Logo2.png")}
              style={styles.logo}
            />

            <Text style={styles.title}>FrigoSafe</Text>
            <Text style={styles.subtitle}>Monitoreo Inteligente de Vacunas</Text>

            <View style={styles.form}>
              <Input
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
              />

              <Input
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Button title="Iniciar sesión" onPress={handleLogin} />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable onPress={() => router.push("/recover-password")}>
                <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
              </Pressable>

              <Pressable onPress={() => router.push("/register")}>
                <Text style={styles.register}>¿No tienes cuenta? <Text style={styles.link}>Crear cuenta</Text></Text>
              </Pressable>

              {/* 🤖 Botón IA */}
              {/* <Pressable
                style={styles.aiButton}
                onPress={() => router.push("/chat-ai")}
              >
                <Ionicons name="hardware-chip" size={28} color="white" />
              </Pressable> */}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  aiButton: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginBottom: 80,
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
  error: {
    color: "#ef4444", // rojo tipo Tailwind
    textAlign: "center",
    marginTop: 5,
    fontSize: 13,
    fontWeight: "500",
  },
  register: {
    marginTop: 15,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },

  link: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});
