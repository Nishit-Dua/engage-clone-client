import { FC } from "react";
import { useParams } from "react-router-dom";
import ChatLibrary from "../components/ChatLibrary";
import { useDisconnect } from "../utils/useDisconnect";

type UrlParams = {
  roomId: string;
};

const ChatRoom: FC = () => {
  const { roomId } = useParams<UrlParams>();
  useDisconnect();
  return (
    <ChatLibrary
      customClass="chat-room"
      roomId={roomId}
      setIsChatOpen={() => {
        return null;
      }}
    />
  );
};

export default ChatRoom;
