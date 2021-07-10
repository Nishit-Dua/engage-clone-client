import { FC } from "react";
import { useParams } from "react-router-dom";
import ChatLibrary from "../components/ChatLibrary";

type UrlParams = {
  roomId: string;
};

const ChatRoom: FC = () => {
  const { roomId } = useParams<UrlParams>();
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
