import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../components/button";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login PICUR</Text>

      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        placeholderTextColor="#666"
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#666"
      />

      <Button
        title="Iniciar sesión"
        onPress={() => router.replace("/(tabs)")}
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
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: "white",
  },
  text: {
    color: "white",
  },
  input: {
    width: "80%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "white",
  },
  button: {
    width: "80%",
    height: 45,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
