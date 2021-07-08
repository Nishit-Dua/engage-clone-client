import React, { useEffect, useReducer } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import { useHistory } from "react-router-dom";

type DispatchType = {
  type: string;
  payload?: any;
};

type AnonUser = {
  displayName: any;
  email: any;
  isAnonymous: boolean;
};

interface ReturnType extends StateType {
  dispatch: React.Dispatch<DispatchType>;
  signOut: () => Promise<void>;
}

type StateType = {
  isAuthenticating: boolean;
  currentUser: firebase.User | AnonUser | null;
};

const authState: StateType = {
  isAuthenticating: true,
  currentUser: null,
};

const authReducer = (state: StateType, action: DispatchType): StateType => {
  switch (action.type) {
    case "GET-USER":
      return { ...state, currentUser: action.payload, isAuthenticating: false };
    case "SET-USER":
      return { ...state, currentUser: action.payload };
    case "ANON-LOGIN":
      const anonUser = {
        displayName: action.payload.name,
        email: action.payload.email,
        isAnonymous: true,
      };
      localStorage.setItem("anon-user", JSON.stringify(anonUser));
      return { ...state, currentUser: anonUser };
    case "SIGN-OUT":
      localStorage.removeItem("anon-user");
      return { ...state, currentUser: null };
    default:
      return authState;
  }
};

const AuthContext = React.createContext<ReturnType | null>(null);

const AuthProvider: React.FC = ({ children }) => {
  const history = useHistory();
  const [state, dispatch] = useReducer(authReducer, authState);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        const anonUser = localStorage.getItem("anon-user");
        if (anonUser) user = JSON.parse(anonUser);
      }
      dispatch({ type: "GET-USER", payload: user });
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await firebase.auth().signOut();
      dispatch({ type: "SIGN-OUT" });
      history.push("/land");
    } catch (err) {
      alert("error logining out, check console");
      console.log(err);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, dispatch, signOut }}>
      {!state.isAuthenticating && children}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => {
  return React.useContext(AuthContext)!;
};

export { AuthProvider, useAuthContext };
