import { FC, useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FiSend } from "react-icons/fi";
import firebase from "firebase/app";
import "firebase/firestore";
import { useAuthContext } from "../context/AuthProvider";
import "../styles/chat.scss";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { ImCross } from "react-icons/im";
import { useHistory } from "react-router-dom";

type Chat = {
  message: string;
};

type MessageType = {
  senderName: string;
  senderPfp: string | null;
  message: string;
  time: Date;
};

TimeAgo.addDefaultLocale(en);
// const timeAgo = new TimeAgo("en-IN");

const ChatLibrary: FC<{
  roomId: string;
  isChatOpen?: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>> | VoidFunction;
  customClass?: string;
}> = ({ roomId, isChatOpen = true, setIsChatOpen, customClass }) => {
  const scrollToNewMessageRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset } = useForm<Chat>({
    shouldFocusError: true,
  });
  const history = useHistory();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const { currentUser } = useAuthContext();

  useEffect(() => {
    const docData: MessageType[] = [];
    const unsubscribe = firebase
      .firestore()
      .collection("rooms")
      .doc("chats")
      .collection(roomId)
      .orderBy("time", "asc")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((doc) => {
          docData.push(doc.doc.data() as MessageType);
        });
        setMessages(docData);
      });
    return unsubscribe;
  }, [roomId]);

  useEffect(() => {
    scrollToNewMessageRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const submitHandler: SubmitHandler<Chat> = async (data) => {
    reset({ message: "" });
    const docData = {
      senderName: currentUser?.displayName,
      senderPfp: currentUser?.photoURL || null,
      message: data.message,
      time: new Date(),
    };

    firebase
      .firestore()
      .collection("rooms")
      .doc("chats")
      .collection(roomId)
      .doc()
      .set(docData)
      .then(() => {
        setMessages((old) => [...old]);
      })
      .catch(() => {
        console.log("Some Bt?");
      });

    return;
  };

  const joinBackHander = () => {
    history.push(`/room/${roomId}`);
  };

  return (
    <aside className={`${customClass} ${isChatOpen ? "open" : "close"}`}>
      <button
        className="close-chat"
        onClick={() => {
          setIsChatOpen(false);
        }}
      >
        <ImCross />
      </button>
      <div className="chats">
        {messages.map((message, index) => {
          return (
            <ChatMessage
              {...(message as unknown as ChatMessageProps)}
              key={index}
            />
          );
        })}
        <div ref={scrollToNewMessageRef}></div>
      </div>
      <form onSubmit={handleSubmit(submitHandler)} autoComplete="off">
        <input
          type="text"
          placeholder="Send a message to all"
          {...register("message", { required: true })}
        />
        <button>
          Send <FiSend />
        </button>
        <button className="join-back" onClick={joinBackHander}>
          Join Back
        </button>
      </form>
    </aside>
  );
};

type ChatMessageProps = {
  senderName: string;
  senderPfp: string | null;
  message: string;
  time: any;
};

const ChatMessage: FC<ChatMessageProps> = ({
  message,
  senderName,
  senderPfp,
  time,
}) => {
  console.log(time.toString());
  return (
    <div className="message">
      <img
        src={
          senderPfp ||
          "https://pbs.twimg.com/media/EfwfM9mX0AcM7Ea?format=jpg&name=small"
        }
        alt={senderName}
      />
      <div className="profile">
        <div className="compose">
          <p>{senderName}</p>
          <p className="date">{time.seconds}</p>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ChatLibrary;
