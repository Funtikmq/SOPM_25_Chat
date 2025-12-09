import React, { useRef, useEffect } from "react";
import Avatar from "./Avatar";

export default function MessageList({ messages, username, onDelete, onEdit }) {
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="chat-messages">
      {messages.map((msg, i) => (
        <div
          key={msg.id || msg._id || i}
          className={`message-wrapper ${
            msg.type === "system"
              ? "center"
              : msg.username === username
              ? "right"
              : "left"
          }`}
        >
          {msg.type === "system" ? (
            <div className="system-message">{msg.message}</div>
          ) : msg.deleted ? (
            <div style={{ maxWidth: "70%" }}>
              <div className="system-message">Deleted Message</div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                flexDirection:
                  msg.username === username ? "row-reverse" : "row",
                maxWidth: "70%",
              }}
            >
              <Avatar username={msg.username} size={36} />
              <div style={{ position: "relative" }}>
                <div
                  className={`chat-message ${
                    msg.username === username ? "mine" : "theirs"
                  }`}
                >
                  <div className="message-username">{msg.username}</div>
                  <div className="message-text">{msg.message}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString("ro-RO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {msg.username === username && (
                  <div style={{ position: "absolute", top: -8, right: -36, display: "flex", gap: 6 }}>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(msg.id || msg._id, msg.message)}
                        style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer" }}
                        title="Editează mesaj"
                      >
                        ✎
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(msg.id || msg._id)}
                        style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer" }}
                        title="Șterge mesaj"
                      >
                        ✖
                      </button>
                    )}
                  </div>
                )}
                {msg.edited && (
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                    Edited{msg.editedBy ? ` by ${msg.editedBy}` : ""}{msg.editedAt ? ` at ${new Date(msg.editedAt).toLocaleTimeString()}` : ""}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </main>
  );
}
