import React, { useEffect, useState } from "react";
import firebase from "firebase";
import { auth } from "../firebaseConfig";

const AuthContext = React.createContext<null>(null);

const AuthProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  // const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const returnValue = {
    currentUser,
  };

  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
};

const useAuthContext = () => {
  return React.useContext(AuthContext);
};

export { AuthProvider, useAuthContext };
