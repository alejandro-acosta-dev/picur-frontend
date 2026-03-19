import { router } from "expo-router";
import { useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Button from "./components/Button";
import Input from "./components/Input";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const scrollRef = useRef<ScrollView>(null);

  const handleFocus = () => {
    scrollRef.current?.scrollTo({ y: 250, animated: true });
  };

  const handleRegister = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Correo electrónico inválido");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Número celular inválido (10 dígitos)");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "La contraseña debe tener 8 caracteres, mayúscula, minúscula, número y símbolo"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    router.replace("/login");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 80 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Crear cuenta</Text>

          <View style={styles.form}>
            <Input
              placeholder="Nombre completo"
              value={name}
              onChangeText={setName}
              onFocus={handleFocus}
            />

            <Input
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              onFocus={handleFocus}
            />

            <Input
              placeholder="Número celular"
              value={phone}
              onChangeText={setPhone}
              keyboardType="numeric"
              onFocus={handleFocus}
            />

            <Input
              placeholder="Contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={handleFocus}
            />

            <Input
              placeholder="Confirmar contraseña"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={handleFocus}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button title="Crear cuenta" onPress={handleRegister} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
  },

  form: {
    width: "100%",
    maxWidth: 420,
    gap: 18,
  },

  error: {
    color: "#ef4444",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
  },
});