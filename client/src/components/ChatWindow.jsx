import React, { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { User, Wifi, WifiOff, LogOut } from "lucide-react";

export default function ChatWindow({ username }) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://sopm-25-chat.onrender.com");

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = (err) => console.error("WebSocket error:", err);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
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
    ws.current?.close();
    window.location.reload();
  };

  return (
    <div className="chat-page">
      <div className="chat-card">

        <header className="chat-header">
          <div className="chat-header-left">
            <User />
            <h1>Chat Room</h1>
            <div className="chat-status">
              {isConnected ? <Wifi /> : <WifiOff />}
            </div>
          </div>

          <div className="chat-header-right">
            <div className="username-badge">{username}</div>
            <button className="logout-btn" onClick={logout}>
              <LogOut />
            </button>
          </div>
        </header>

        <MessageList messages={messages} username={username} />
        <MessageInput onSend={sendMessage} disabled={!isConnected} />
      </div>
    </div>
  );
}
