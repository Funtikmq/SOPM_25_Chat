import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import Avatar from "./Avatar";

export default function ChatWindow({ username, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastClearAt, setLastClearAt] = useState(new Date(0));
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editText, setEditText] = useState("");
  const [editId, setEditId] = useState(null);
  const ws = useRef(null);

  // Load lastClearAt from AsyncStorage on component mount
  useEffect(() => {
    const initializeLastClear = async () => {
      try {
        const saved = await AsyncStorage.getItem("lastClearAt");
        if (saved) {
          setLastClearAt(new Date(saved));
        }
      } catch (err) {
        console.error("Error loading lastClearAt:", err);
      }
    };

    initializeLastClear();
  }, []);

  // WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket("wss://sopm-25-chat.onrender.com");

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = (err) => console.error("WebSocket error:", err);

    ws.current.onmessage = async (event) => {
      console.log("WebSocket raw data:", event.data, "(type:", typeof event.data, ")");

      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.error("Failed to JSON.parse WebSocket message:", err, "raw:", event.data);
        return;
      }
      console.log("WebSocket message received:", data);

      // Gestionare clear event
      if (data && data.type === "clear") {
        console.log("Clear event received. Timestamp:", data.timestamp);
        const clearTime = new Date(data.timestamp);
        console.log("clearTime Date object:", clearTime);
        setLastClearAt(clearTime);
        try {
          await AsyncStorage.setItem("lastClearAt", clearTime.toISOString());
          console.log("lastClearAt saved to AsyncStorage:", clearTime.toISOString());
        } catch (err) {
          console.error("Error saving lastClearAt:", err);
        }
        return;
      }

      // Handle delete event
      if (data && data.type === "delete") {
        console.log("Delete event received:", data);
        setMessages((prev) =>
          prev.map((m) => {
            const mid = m.id || m._id;
            if (String(mid) === String(data.id)) {
              return { ...m, deleted: true, deletedBy: data.deletedBy, deletedAt: data.deletedAt };
            }
            return m;
          })
        );
        return;
      }

      // Handle edit event
      if (data && data.type === "edit") {
        console.log("Edit event received:", data);
        setMessages((prev) =>
          prev.map((m) => {
            const mid = m.id || m._id;
            if (String(mid) === String(data.id)) {
              return { ...m, message: data.message, edited: !!data.edited, editedBy: data.editedBy, editedAt: data.editedAt };
            }
            return m;
          })
        );
        return;
      }

      // Mesaje normale - defensive timestamp
      if (data) {
        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
          console.warn("Incoming message missing timestamp — assigning now:", data.timestamp);
        }
        console.log("Adding message. Message timestamp:", data.timestamp);
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => ws.current?.close();
  }, []);

  const sendMessage = (text) => {
    ws.current?.send(
      JSON.stringify({
        username,
        message: text,
      })
    );
  };

  const logout = () => {
    Alert.alert("Deconectare", "Sigur vrei să ieși din chat?", [
      { text: "Anulează", style: "cancel" },
      {
        text: "Ieși",
        style: "destructive",
        onPress: () => {
          ws.current?.close();
          onLogout();
        },
      },
    ]);
  };

  const clearChat = () => {
    Alert.alert("Curăță chat", "Ștergi afișarea chat-ului? (mesajele rămân în baza de date)", [
      { text: "Anulează", style: "cancel" },
      {
        text: "Curăță",
        style: "destructive",
        onPress: async () => {
          const ts = new Date();
          console.log("Clearing chat locally at", ts.toISOString());
          setLastClearAt(ts);
          try {
            await AsyncStorage.setItem("lastClearAt", ts.toISOString());
            console.log("lastClearAt saved to AsyncStorage:", ts.toISOString());
          } catch (err) {
            console.error("Error saving lastClearAt:", err);
          }
        },
      },
    ]);
  };

  const deleteMessage = (id) => {
    Alert.alert("Șterge mesaj", "Sigur vrei să ștergi acest mesaj pentru toată lumea?", [
      { text: "Anulează", style: "cancel" },
      {
        text: "Șterge",
        style: "destructive",
        onPress: () => {
          try {
            console.log("Requesting delete for message id:", id);
            ws.current?.send(
              JSON.stringify({ type: "delete", id, username })
            );
          } catch (err) {
            console.error("Failed to send delete request:", err);
          }
        },
      },
    ]);
  };

  const openEditModal = (id, currentText) => {
    setEditId(id);
    setEditText(currentText || "");
    setEditModalVisible(true);
  };

  const submitEdit = () => {
    if (!editId) return;
    const newText = editText.trim();
    if (newText === "") {
      Alert.alert("Eroare", "Mesajul nu poate fi gol");
      return;
    }
    try {
      ws.current?.send(JSON.stringify({ type: "edit", id: editId, username, newText }));
      setEditModalVisible(false);
      setEditId(null);
      setEditText("");
    } catch (err) {
      console.error("Failed to send edit request:", err);
    }
  };

  // Filtrează mesajele să afișeze doar pe cele primite după clear
  const visibleMessages = messages.filter((m) => {
    if (m.type === "clear") return false;
    if (!m.timestamp) return true;
    const msgDate = new Date(m.timestamp);
    const isVisible = msgDate >= lastClearAt;
    console.log(`Filter check - Message: ${m.message || m.content}, timestamp: ${m.timestamp}, msgDate: ${msgDate}, lastClearAt: ${lastClearAt}, visible: ${isVisible}`);
    return isVisible;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar username={username} size={44} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Chat Room</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  isConnected
                    ? styles.statusConnected
                    : styles.statusDisconnected,
                ]}
              />
              <Text style={styles.statusText}>
                {isConnected ? "Conectat" : "Deconectat"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.usernameBadge}>
            <Text style={styles.usernameBadgeText}>{username}</Text>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={clearChat}>
            <Text style={styles.clearText}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <MessageList messages={visibleMessages} username={username} onDelete={deleteMessage} onEdit={openEditModal} />
      <Modal visible={editModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEditModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ width: "90%", backgroundColor: "white", padding: 16, borderRadius: 8 }}>
            <Text style={{ fontWeight: "600", marginBottom: 8 }}>Editează mesaj</Text>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              style={{ minHeight: 80, borderColor: "#e5e7eb", borderWidth: 1, padding: 8, borderRadius: 6, marginBottom: 12 }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: "#6b7280" }}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitEdit} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: "#ef4444", fontWeight: "600" }}>Salvează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <MessageInput onSend={sendMessage} disabled={!isConnected} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusConnected: {
    backgroundColor: "#10b981",
  },
  statusDisconnected: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    fontSize: 12,
    color: "#6b7280",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  usernameBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  usernameBadgeText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "600",
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  clearText: {
    fontSize: 18,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 18,
  },
});
