import firebase from "firebase/app";
import "firebase/auth";

export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const githubProvider = new firebase.auth.GithubAuthProvider();

export const socialMediaProvider = async (
  provider: firebase.auth.AuthProvider
) => {
  try {
    const res = await firebase.auth().signInWithPopup(provider);
    return res.user;
  } catch (err) {
    console.log(err);
    alert("Some error Occoured! Please try again");
  }
};
