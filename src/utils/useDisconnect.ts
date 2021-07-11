import { useEffect } from "react";
import { useAppContext } from "../context/AppProvider";

export const useDisconnect = () => {
  const { dispatchApp, leaveVideoChatTrigger } = useAppContext();
  console.log("hello from useDisconnect!");
  useEffect(() => {
    dispatchApp({ type: "DISCONNECTED" });
    if (leaveVideoChatTrigger) window.location.reload();
  }, []);
};
