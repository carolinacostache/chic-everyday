import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // 1. Încercăm să luăm userul din LocalStorage (memoria browserului)
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // 2. Funcție pentru a actualiza userul (login, logout, sau update date)
  const updateUser = (data) => {
    setCurrentUser(data);
  };

  // 3. De fiecare dată când currentUser se schimbă, îl salvăm automat în LocalStorage
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};