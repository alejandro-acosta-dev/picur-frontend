import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const userName = "Admin"; // luego vendrá del backend

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido {userName}</Text>

      <Text style={styles.subtitle}>FrigoSafe</Text>

      <Text style={styles.description}>
        FrigoSafe es una plataforma de monitoreo inteligente diseñada para
        garantizar la correcta conservación de vacunas mediante el control
        continuo de la cadena de frío. Nuestro sistema permite detectar
        variaciones de temperatura en tiempo real, generar alertas tempranas y
        asegurar que las vacunas se mantengan dentro de los rangos adecuados de
        almacenamiento.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#3b82f6",
    marginBottom: 20,
  },

  description: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 24,
  },
});
