const getavatarColor = (username) => {
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

export default function avatar({ username, size = 40 }) {
  const bgColor = getavatarColor(username);
  const initials = getInitials(username);

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: "50%",
    backgroundColor: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: `${size * 0.4}px`,
    flexShrink: 0,
    userSelect: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    border: "2px solid rgba(255,255,255,0.8)",
  };

  return <div style={avatarStyle}>{initials}</div>;
}
