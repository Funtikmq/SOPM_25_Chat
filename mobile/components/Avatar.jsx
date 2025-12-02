import React from "react";
import { View, Text, StyleSheet } from "react-native";

const getAvatarColor = (username) => {
  const colors = [
    "#818cf8",
    "#a78bfa",
    "#60a5fa",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#fb923c",
    "#a3e635",
    "#2dd4bf",
    "#c084fc",
    "#e879f9",
    "#fb7185",
  ];

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (username) => {
  if (!username) return "?";

  const parts = username.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
};

export default function Avatar({ username, size = 40 }) {
  const bgColor = getAvatarColor(username);
  const initials = getInitials(username);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  initials: {
    color: "white",
    fontWeight: "600",
  },
});
