import { useEffect } from "react";
import { useAppContext } from "../context/AppProvider";

export const useDisconnect = () => {
  const { dispatchApp, leaveVideoChatTrigger } = useAppContext();
  useEffect(() => {
    dispatchApp({ type: "DISCONNECTED" });
    // fuck the memory leak, imma just reload the window 🤡
    if (leaveVideoChatTrigger) window.location.reload();
  }, []);
};
