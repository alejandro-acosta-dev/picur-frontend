import { User } from "@/interfaces/User";
import { getUsers } from "@/services/user.service";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function ListUsuariosScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔄 Loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  // 📭 Lista vacía
  if (users.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay usuarios disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Usuarios</Text>

      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.text}>{item.email}</Text>
            <Text style={styles.text}>{item.phone}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    padding: 20,
  },

  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#1f2937",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  text: {
    color: "#9ca3af",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },

  loadingText: {
    color: "white",
    marginTop: 10,
  },

  emptyText: {
    color: "#9ca3af",
  },
});