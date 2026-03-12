import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function VerifyCodeScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);
  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      router.push("/new-password");
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && index > 0 && otp[index] === "") {
      inputs.current[index - 1]?.focus();
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificar código</Text>

      <Text style={styles.subtitle}>
        Ingresa el código de verificación enviado a tu celular
      </Text>

      <View style={styles.codeContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            style={styles.codeBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(value) =>
              handleChange(value.replace(/[^0-9]/g, ""), index)
            }
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, index)
            }
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 20,
  },
  codeBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "white",
  },
});
