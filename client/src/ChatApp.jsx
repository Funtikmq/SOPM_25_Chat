import React, { useState } from "react";
import Login from "./components/Login";
import ChatWindow from "./components/ChatWindow";

export default function ChatApp() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {!isLoggedIn ? (
        <Login
          onLogin={(name) => {
            setUsername(name);
            setIsLoggedIn(true);
          }}
        />
      ) : (
        <ChatWindow username={username} />
      )}
    </>
  );
}
