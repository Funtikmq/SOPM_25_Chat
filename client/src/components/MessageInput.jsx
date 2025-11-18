import React, { useState } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <footer className="chat-input">
      <input
        type="text"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && submit()}
        placeholder="Scrie un mesaj..."
      />
      <button disabled={disabled || !text.trim()} onClick={submit}>
        <Send /> Trimite
      </button>
    </footer>
  );
}
