import { updatePassword } from "@/services/user.service";
import { GetNotification } from "@/utils/notification";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Button from "./components/Button";
import Input from "./components/Input";

export default function NewPasswordScreen() {
  const { userId } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValidPassword = (password: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    if (!isValidPassword(password)) {
      setError(
        "La contraseña debe tener mínimo 8 caracteres, una letra y un número",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");

    //Update password in backend
    let response = await updatePassword(userId as string, password);
    
    if(response.ok){
      GetNotification("Contraseña cambiada exitosamente");
      router.replace("/login");
    }else{
       GetNotification("Error al cambiar la contraseña");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva contraseña</Text>

      
      <Input
        placeholder="Nueva contraseña"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
      />
      
      <Input
        placeholder="Confirmar contraseña"
        secureTextEntry={!showPassword}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      

      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Text style={styles.showPassword}>
          {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        </Text>
      </TouchableOpacity>

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <Button title="Cambiar contraseña" onPress={handleChangePassword} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    padding: 20,
    marginBottom: 100,
    gap: 10,
  },

  title: {
    fontSize: 26,
    marginBottom: 30,
    color: "white",
    fontWeight: "bold",
  },

  showPassword: {
    color: "#4da6ff",
    marginBottom: 15,
  },

  error: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
});
