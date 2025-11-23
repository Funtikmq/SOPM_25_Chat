import React, { useRef, useEffect } from "react";
import Avatar from "./avatar";

export default function MessageList({ messages, username }) {
  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="chat-messages">
      {messages.map((msg, i) => (
        <div
          key={i}
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
          ) : (
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                flexDirection: msg.username === username ? "row-reverse" : "row",
                maxWidth: "70%"
              }}
            >
              <Avatar username={msg.username} size={36} />
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
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </main>
  );
}