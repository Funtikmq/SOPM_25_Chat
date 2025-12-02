import React, { useRef, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import Avatar from "./Avatar";

export default function MessageList({ messages, username }) {
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
          key={i}
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
              </View>
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
});
