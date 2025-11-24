/* import { useState } from "react";
import { User } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    if (!username.trim()) return;

    const res = await fetch("https://sopm-25-chat.onrender.com/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username }),
});


    const data = await res.json();

    if (data.success) {
      onLogin(data.username); // trimitem username-ul valid către App
    } else {
      alert("Eroare la login");
    }
  };

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
          onKeyPress={(e) => e.key === "Enter" && handleLogin()}
        />

        <button className="login-button" onClick={handleLogin}>
          Intră în chat
        </button>
      </div>
    </div>
  );
}
*/

import { useState } from "react";
import { User } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      alert("Te rog introdu un nume!");
      return;
    }
    
    onLogin(trimmed);
  };

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
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button 
          className="login-button" 
          onClick={handleLogin}
          disabled={!username.trim()}
        >
          Intră în chat
        </button>
      </div>
    </div>
  );
}