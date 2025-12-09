import React, { useRef, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Avatar from "./Avatar";

export default function MessageList({ messages, username, onDelete, onEdit }) {
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {messages.map((msg, i) => (
        <View
          key={msg.id || msg._id || i}
          style={[
            styles.messageWrapper,
            msg.type === "system"
              ? styles.center
              : msg.username === username
              ? styles.right
              : styles.left,
          ]}
        >
          {msg.type === "system" ? (
            <View style={styles.systemMessage}>
              <Text style={styles.systemText}>{msg.message}</Text>
            </View>
          ) : msg.deleted ? (
            <View style={styles.systemMessage}><Text style={styles.systemText}>Deleted Message</Text></View>
          ) : (
            <View
              style={[
                styles.messageContainer,
                msg.username === username && styles.messageContainerReverse,
              ]}
            >
              <Avatar username={msg.username} size={36} />
              <View
                style={[
                  styles.bubble,
                  msg.username === username
                    ? styles.bubbleMine
                    : styles.bubbleTheirs,
                ]}
              >
                <Text style={styles.messageUsername}>{msg.username}</Text>
                <Text style={styles.messageText}>{msg.message}</Text>
                <Text style={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                {msg.edited && (
                  <Text style={styles.editedText}>
                    Edited{msg.editedBy ? ` by ${msg.editedBy}` : ""}{msg.editedAt ? ` at ${new Date(msg.editedAt).toLocaleTimeString()}` : ""}
                  </Text>
                )}
              </View>
              {msg.username === username && (
                <View style={styles.controlsRow}>
                  {onEdit && (
                    <TouchableOpacity onPress={() => onEdit(msg.id || msg._id, msg.message)} style={styles.editButton}>
                      <Text style={styles.editText}>✎</Text>
                    </TouchableOpacity>
                  )}
                  {onDelete && (
                    <TouchableOpacity onPress={() => onDelete(msg.id || msg._id)} style={styles.deleteButton}>
                      <Text style={styles.deleteText}>✖</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 12,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  center: {
    alignItems: "center",
  },
  left: {
    alignItems: "flex-start",
  },
  right: {
    alignItems: "flex-end",
  },
  systemMessage: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  systemText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "500",
  },
  messageContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    maxWidth: "80%",
  },
  messageContainerReverse: {
    flexDirection: "row-reverse",
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bubbleMine: {
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
  },
  messageUsername: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.6,
    alignSelf: "flex-end",
  },
  editedText: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },
  deleteButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(156,163,175,0.08)",
  },
  deleteText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(107,114,128,0.06)",
  },
  editText: {
    color: "#6b7280",
    fontSize: 14,
  },
});
