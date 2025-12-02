import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={text}
        editable={!disabled}
        onChangeText={setText}
        onSubmitEditing={submit}
        placeholder="Scrie un mesaj..."
        placeholderTextColor="#9ca3af"
        returnKeyType="send"
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[
          styles.button,
          (disabled || !text.trim()) && styles.buttonDisabled,
        ]}
        disabled={disabled || !text.trim()}
        onPress={submit}
      >
        <Text style={styles.buttonText}>📤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  inputDisabled: {
    backgroundColor: "#e5e7eb",
    color: "#9ca3af",
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    fontSize: 20,
  },
});
