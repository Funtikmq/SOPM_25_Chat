import { useState } from "react";
import { User } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <User />
        </div>
        <h1>Bine ai venit!</h1>
        <p>Introdu numele pentru a intra în chat</p>

        <label>Numele tău</label>
        <input
          type="text"
          className="login-input"
          maxLength={20}
          placeholder="Introdu numele..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onLogin(username)}
        />

        <button className="login-button" onClick={() => onLogin(username)}>
          Intră în chat
        </button>
      </div>
    </div>
  );
}
