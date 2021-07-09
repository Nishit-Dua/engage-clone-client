import "../styles/Homepage.scss";
import firebase from "firebase/app";
import { FC, useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { GoPerson } from "react-icons/go";
import { useHistory } from "react-router-dom";
import {
  githubProvider,
  googleProvider,
  socialMediaProvider,
} from "../utils/auth-firebase";
import { useAuthContext } from "../context/AuthProvider";

const Homepage: FC = () => {
  const { dispatch, currentUser, protectedRouteJoiningError, roomId } =
    useAuthContext();
  const [error, setError] = useState("");
  const history = useHistory();

  console.log(currentUser?.displayName);

  const anonLoginHandler = () => {
    if (roomId) {
      history.push(`/room/${roomId}`);
    } else {
      history.push("/anonLogin");
    }
  };

  const handleLogin = async (provider: firebase.auth.AuthProvider) => {
    const res = await socialMediaProvider(provider);
    if (typeof res === "string") {
      setError(res);
    } else if (res) {
      dispatch({ type: "SET-USER", payload: res });
      console.log(res);
      if (roomId) {
        history.push(`/room/${roomId}`);
      } else {
        history.push("/land");
      }
    }
  };

  return (
    <main id="home">
      <div className="btn-container">
        <div className="clamp-container">
          <button onClick={() => handleLogin(googleProvider)}>
            <FaGoogle /> Login With Google
          </button>
          <button onClick={() => handleLogin(githubProvider)}>
            <FaGithub /> Login With Github
          </button>
          <button onClick={anonLoginHandler}>
            <GoPerson /> Join As A Guest
          </button>
          {error && (
            <p style={{ textAlign: "center", color: "red" }}>{error}</p>
          )}
          {protectedRouteJoiningError && (
            <p style={{ textAlign: "center", color: "red" }}>
              {protectedRouteJoiningError}
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Homepage;
