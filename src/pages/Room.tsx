import { useParams } from "react-router-dom";
import { FC, useState } from "react";
import VideoChat from "../components/VideoChats";
import TextChat from "../components/ChatLibrary";
import "../styles/room.scss";
import { BiChat } from "react-icons/bi";
import { FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { MdCallEnd } from "react-icons/md";
import { RiChatVoiceLine } from "react-icons/ri";
import { useAppContext } from "../context/AppProvider";

type UrlParams = {
  roomId: string;
};

const Room: FC = () => {
  const { isMicOn, isVideoOn, dispatchApp } = useAppContext();
  const [isChatOpen, setIsChatOpen] = useState(true);

  const { roomId } = useParams<UrlParams>();

  return (
    <main id="room">
      <div className="video-grid">
        <VideoChat roomId={roomId} />
      </div>
      <TextChat
        roomId={roomId}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />
      <div className="controls">
        <button onClick={() => dispatchApp({ type: "MIC-TOGGLE" })}>
          {isMicOn ? <FiMic /> : <FiMicOff />}
        </button>
        <button onClick={() => dispatchApp({ type: "VIDEO-TOGGLE" })}>
          {isVideoOn ? <FiVideo /> : <FiVideoOff />}
        </button>
        <button>
          <MdCallEnd />
        </button>
        <button onClick={() => setIsChatOpen((s) => !s)}>
          <BiChat />
        </button>
        <button>
          <RiChatVoiceLine />
        </button>
      </div>
    </main>
  );
};

export default Room;
