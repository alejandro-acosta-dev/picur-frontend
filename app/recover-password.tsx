import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Button from "./components/Button";

export default function RecoverPasswordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.text}>
        Aquí el usuario podrá ingresar el código y su nueva contraseña.
      </Text>
      <Button
        title="Enviar código"
        onPress={() => router.push("/verify-code")}
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
    fontSize: 16,
    color: "white",
  },
});
