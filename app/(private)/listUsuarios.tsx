import { User } from "@/interfaces/User";
import { getUsers } from "@/services/user.service";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
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
            <View style={styles.rowContainer}>

              {/* 🧾 Información */}
              <View style={styles.info}>
                <View style={styles.nameContainer}>
                  <Ionicons name="person-circle" size={22} color="#3b82f6" />
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <Text style={styles.text}>{item.email}</Text>
                <Text style={styles.text}>{item.phone}</Text>
              </View>

              {/* 🔘 Acciones */}
              <View style={styles.actions}>
                <Pressable style={styles.editButton}>
                  <Ionicons name="pencil" size={16} color="white" />
                  <Text style={styles.actionText}>Actualizar</Text>
                </Pressable>

                <Pressable style={styles.deleteButton}>
                  <Ionicons name="trash" size={16} color="white" />
                  <Text style={styles.actionText}>Eliminar</Text>
                </Pressable>
              </View>

            </View>
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
    marginBottom: 30,
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
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  info: {
    flex: 1,
  },

  actions: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#3b82f6",
    paddingVertical: 6,
    width: 110,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 10

  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    width: 110,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  actionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
});