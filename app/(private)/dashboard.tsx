import { cleanHistory } from "@/services/chatHistory.service";
import { GetNotification } from "@/utils/notification";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function Dashboard() {

  const confirmDeleteHistory = () => {
    Alert.alert(
      "Eliminar historial",
      "¿Estás seguro de eliminar todo el historial del chat?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: handleCleanHistory,
        },
      ]
    );
  };
  // 🔴 Datos simulados (luego vienen del backend)
  const data = {
    status: "RIESGO", // NORMAL | RIESGO | CRITICO
    temperature: 9.1,
    doorOpen: true,
    timeOutOfRange: 180, // segundos
    lastAlert: "Temperatura fuera de rango",
  };

  const getStatusColor = () => {
    switch (data.status) {
      case "NORMAL":
        return "#22c55e";
      case "RIESGO":
        return "#f59e0b";
      case "CRITICO":
        return "#ef4444";
      default:
        return "#9ca3af";
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  const handleCleanHistory = async () => {
    const result = await cleanHistory();

    if (result.ok) {
      GetNotification("Historial de chat limpiado correctamente!");
    } else {
      GetNotification("Error al limpiar el historial de chat");
    }
  }

  return (
    <View style={styles.container}>
      {/* 🔴 ESTADO GENERAL */}
      <View style={[styles.statusCard, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{data.status}</Text>
      </View>

      {/* 🌡️ Temperatura */}
      <View style={styles.card}>
        <Text style={styles.label}>Temperatura</Text>
        <Text style={styles.value}>{data.temperature} °C</Text>
      </View>

      {/* 🚪 Estado puerta */}
      <View style={styles.card}>
        <Text style={styles.label}>Puerta</Text>
        <Text style={styles.value}>
          {data.doorOpen ? "Abierta" : "Cerrada"}
        </Text>
      </View>

      {/* ⏱️ Tiempo fuera de rango */}
      <View style={styles.card}>
        <Text style={styles.label}>Tiempo fuera de rango</Text>
        <Text style={styles.value}>
          {formatTime(data.timeOutOfRange)}
        </Text>
      </View>

      {/* 🚨 Última alerta */}
      <View style={styles.card}>
        <Text style={styles.label}>Última alerta</Text>
        <Text style={styles.value}>{data.lastAlert}</Text>
      </View>

      {/* <View style={styles.card}>
        <Pressable

          onPress={() => handleCleanHistory()}
        >
          <Text style={styles.value}>Limpiar historial de chat</Text>
        </Pressable>
      </View> */}

      <Pressable
        style={styles.deleteChatButton}
        onPress={confirmDeleteHistory}
      >
        <Ionicons name="trash" size={24} color="white" />
      </Pressable>

      <View style={styles.aiWrapper}>
        <View style={styles.aiTooltip}>
          <Text style={styles.aiTooltipText}>Pregúntale a la IA</Text>
        </View>
        {/* 🤖 Botón IA */}
        <Pressable
          style={styles.aiButton}
          onPress={() => router.push("/chat-ai")}
        >
          <Ionicons name="hardware-chip" size={28} color="white" />
        </Pressable>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    padding: 20,
  },

  statusCard: {
    padding: 30,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: "center",
  },

  statusText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#1f2937",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  label: {
    color: "#9ca3af",
    fontSize: 14,
  },

  value: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  aiButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  // aiButton: {
  //   position: "absolute",
  //   bottom: 30,
  //   right: 25,
  //   width: 65,
  //   height: 65,
  //   borderRadius: 32.5,
  //   backgroundColor: "#2563eb",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   elevation: 8,
  // },

  aiWrapper: {
    position: "absolute",
    bottom: 55,
    right: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  aiTooltip: {
    backgroundColor: "#1f2937",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#374151",
    justifyContent: "center",
  },

  aiTooltipText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteChatButton: {
    position: "absolute",
    bottom: 145,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});