import { FC, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FiSend } from "react-icons/fi";
import firebase from "firebase/app";
import "firebase/firestore";
import { useAuthContext } from "../context/AuthProvider";
import "../styles/chat.scss";

type Chat = {
  message: string;
};

type MessageType = {
  senderName: string;
  senderPfp: string | null;
  message: string;
  time: Date;
};

const ChatLibrary: FC<{ roomId: string }> = ({ roomId }) => {
  const { register, handleSubmit, reset } = useForm<Chat>({
    shouldFocusError: true,
  });
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    const docData: MessageType[] = [];
    firebase
      .firestore()
      .collection("rooms")
      .doc("chats")
      .collection(roomId)
      .orderBy("time", "desc")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((doc) => {
          docData.push(doc.doc.data() as MessageType);
        });
        setMessages(docData);
      });
  }, [roomId]);

  const { currentUser, dispatch } = useAuthContext();

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

  return (
    <main>
      <div className="wire-frame"></div>
      <aside>
        <div className="chats">
          {messages.map((message, index) => {
            console.log(message.message, index);
            return <p key={index}>{message.message}</p>;
          })}
        </div>
        <form onSubmit={handleSubmit(submitHandler)} autoComplete="off">
          <input
            type="text"
            placeholder="Send a message to all"
            {...register("message")}
          />
          <button>
            Send <FiSend />
          </button>
        </form>
      </aside>
    </main>
  );
};

export default ChatLibrary;
