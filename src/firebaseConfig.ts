import firebase from "firebase";
import "firebase/auth";

firebase.initializeApp({
  apiKey: "AIzaSyBiIig2cyRCfnAaVELz5M1cjSJMHALio9s",
  authDomain: "engage-clone-9639d.firebaseapp.com",
  projectId: "engage-clone-9639d",
  storageBucket: "engage-clone-9639d.appspot.com",
  messagingSenderId: "141645357973",
  appId: "1:141645357973:web:3f211432fd2a285fdecc9c",
  measurementId: "G-B26YTDR9SG",
});

const auth = firebase.auth();

export { auth };
