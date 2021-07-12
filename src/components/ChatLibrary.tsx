import { FC, useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FiSend } from "react-icons/fi";
import firebase from "firebase/app";
import "firebase/firestore";
import { useAuthContext } from "../context/AuthProvider";
import "../styles/chat.scss";
import { ImCross } from "react-icons/im";
import { BsCameraVideo } from "react-icons/bs";
import { useHistory } from "react-router-dom";
import { MessageType } from "../utils/types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useSound from "use-sound";
import { formatDistance } from "date-fns";

import notificationSoundEffect from "../assets/discord-notification.mp3";
import React from "react";

type Chat = {
  message: string;
};

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

  const [notificatonSound] = useSound(notificationSoundEffect);

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
    if (
      messages.length > 0 &&
      messages[messages.length - 1].senderName !== currentUser?.displayName
    ) {
      notificatonSound();
      toast(messages[messages.length - 1].message, {
        autoClose: 2000,
        hideProgressBar: true,
        pauseOnHover: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    if (isChatOpen) {
    }
  }, [isChatOpen]);

  const submitHandler: SubmitHandler<Chat> = async (data) => {
    reset({ message: "" });
    const docData: MessageType = {
      senderName: currentUser?.displayName,
      senderPfp: currentUser?.photoURL || null,
      message: data.message,
      time: new Date(),
      isAnonymous: currentUser?.isAnonymous || true,
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
          Join Back <BsCameraVideo />
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
  isAnonymous: boolean;
};

const ChatMessage: FC<ChatMessageProps> = React.memo(
  ({ message, senderName, senderPfp, time, isAnonymous }) => {
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
            <p>
              {senderName} {isAnonymous && "(Guest)"}
            </p>
            <p className="date">
              {formatDistance(time.toMillis(), new Date())}
            </p>
          </div>
          <p>{message}</p>
        </div>
      </div>
    );
  }
);

export default ChatLibrary;
