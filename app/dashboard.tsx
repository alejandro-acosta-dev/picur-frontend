import { StyleSheet, Text, View } from "react-native";

export default function Dashboard() {
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
});