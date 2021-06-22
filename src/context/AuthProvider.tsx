import React from "react";

const AuthContext = React.createContext<null>(null);

const AuthProvider: React.FC = ({ children }) => {
  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
};

const useAuthContext = () => {
  return React.useContext(AuthContext);
};

export { AuthProvider, useAuthContext };
