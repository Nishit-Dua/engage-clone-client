import { FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { FiSend } from "react-icons/fi";
import "../styles/chat.scss";

interface Chat {
  message: string;
}

const ChatLibrary: FC = () => {
  const { register, handleSubmit, reset } = useForm<Chat>({
    shouldFocusError: true,
  });

  const submitHandler: SubmitHandler<Chat> = async (data) => {
    reset({ message: "" });
    console.log(data);

    return;
  };

  return (
    <main>
      <div className="wire-frame"></div>
      <aside>
        <div className="chats"></div>
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
