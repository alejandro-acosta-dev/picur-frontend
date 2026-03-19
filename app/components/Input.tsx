import { StyleSheet, TextInput } from "react-native";

type Props = {
  placeholder: string;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: any;
  keyboardType?: any;
  onFocus?: () => void;
};

export default function Input({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  style,
  keyboardType,
  onFocus,
}: Props) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      placeholderTextColor="#666"
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      onFocus={onFocus}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "white",
  },
});
