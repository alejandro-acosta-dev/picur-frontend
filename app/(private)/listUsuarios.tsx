import { User } from "@/interfaces/User";
import { deleteUser, getUsers, updateUser } from "@/services/user.service";
import { GetNotification } from "@/utils/notification";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../components/button";
import Input from "../components/Input";

export default function ListUsuariosScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (user: User) => {
    Alert.alert(
      "Eliminar usuario",
      `¿Estás seguro de eliminar a ${user.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const result = await deleteUser(user.id);
            if (result.ok) {
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
              GetNotification("Usuario eliminado correctamente");
            } else {
              GetNotification("Error al eliminar el usuario");
            }
          },
        },
      ],
    );
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setError("");
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
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

    setError("");
    setUpdating(true);
    const result = await updateUser(selectedUser!.id, name, email, phone);
    setUpdating(false);

    if (result.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser!.id ? { ...u, name, email, phone } : u,
        ),
      );
      setModalVisible(false);
      GetNotification("Usuario actualizado correctamente");
    } else {
      if (result.status === 409) {
        setError("Este email ya se encuentra registrado");
      } else {
        setError("Error al actualizar el usuario");
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

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
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowContainer}>
              <View style={styles.info}>
                <View style={styles.nameContainer}>
                  <Ionicons name="person-circle" size={22} color="#3b82f6" />
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <Text style={styles.text}>{item.email}</Text>
                <Text style={styles.text}>{item.phone}</Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => handleOpenEdit(item)}
                >
                  <Ionicons name="pencil" size={16} color="white" />
                  <Text style={styles.actionText}>Actualizar</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash" size={16} color="white" />
                  <Text style={styles.actionText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Actualizar usuario</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#9ca3af" />
                </Pressable>
              </View>

              <View style={styles.form}>
                <Input
                  placeholder="Nombre completo"
                  value={name}
                  onChangeText={setName}
                />
                <Input
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                />
                <Input
                  placeholder="Número celular"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="numeric"
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Button
                  title={updating ? "Actualizando..." : "Guardar cambios"}
                  onPress={handleUpdate}
                  disabled={updating}
                />
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
    marginBottom: 10,
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
  },

  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  modalCard: {
    backgroundColor: "#1f2937",
    borderRadius: 14,
    padding: 24,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },

  form: {
    gap: 18,
  },

  error: {
    color: "#ef4444",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
  },

  cancelText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
  },
});
