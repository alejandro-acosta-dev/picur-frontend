import { router, Stack } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
export default function HomeScreen() {
  const userName = "Admin"; // luego vendrá del backend
  const handleLogout = () => {
  Alert.alert(
    "Cerrar sesión",
    "¿Seguro que deseas cerrar sesión?",
    [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sí, salir",
        style: "destructive",
        onPress: () => router.replace("/login"),
      },
    ]
  );
};;
  

  return (
    <>
      {/* 🔴 Configuración del header */}
      <Stack.Screen
        options={{
          headerBackVisible: false,
          headerRight: () => (
            <Pressable onPress={handleLogout}>
              <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 18 }}>
                Salir
              </Text>
            </Pressable>
          ),
        }}
      />

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

        {/* 🔵 Usuarios */}
        <Pressable
          style={styles.button}
          onPress={() => router.push("/listUsuarios")}
        >
          <Text style={styles.buttonText}>Ver usuarios</Text>
        </Pressable>

        {/* 🟢 Dashboard */}
        <Pressable
          style={styles.buttonDashboard}
          onPress={() => router.push("/dashboard")}
        >
          <Text style={styles.buttonText}>Ir al Dashboard</Text>
        </Pressable>
      </View>
    </>
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

  button: {
  marginTop: 30,
  backgroundColor: "#3b82f6",
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
},

  buttonText: {
  color: "white",
  fontSize: 16,
  fontWeight: "600",
},

buttonDashboard: {
  marginTop: 20,
  backgroundColor: "#22c55e", // verde
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
},



});
