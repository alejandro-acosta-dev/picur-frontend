import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
export default function HomeScreen() {
  const userName = "Admin"; // luego vendrá del backend
  // const [users, setUsers] = useState<User[]>([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await getUsers();
  //       console.log(data)
  //       setUsers(data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchData();
  // }, []);

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

      <Pressable
        style={styles.button}
        onPress={() => router.push("/listUsuarios")}
      >
        <Text style={styles.buttonText}>Ver usuarios</Text>
      </Pressable>

      
      {/* {users.map((user, index) => (
        <View style={styles.row}>
          <Text style={styles.header}>{user.name}</Text>
          <Text style={styles.header}>{user.email}</Text>
          <Text style={styles.header}>{user.phone}</Text>
        </View>
      ))
      } */}
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

  // table: {
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  // },
  // row: {
  //   flexDirection: "row",
  // },
  // header: {
  //   flex: 1,
  //   fontWeight: "bold",
  //   padding: 10,
  //   backgroundColor: "#eee",
  // },
  cell: {
    flex: 1,
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    color: "#fff"
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
});
