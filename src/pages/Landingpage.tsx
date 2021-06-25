import { FC, LegacyRef, useEffect, useRef, useState } from "react";
import { BiMicrophoneOff, BiCamera } from "react-icons/bi";
import { FiPlusSquare } from "react-icons/fi";
import { AiOutlineEnter } from "react-icons/ai";
import "../styles/landing.scss";
import { SubmitHandler, useForm } from "react-hook-form";
const Landingpage: FC = () => {
  const [mediaStream, setMediaStream] = useState<MediaStream>();
  const vidRef = useRef<any>(null);

  useEffect(() => {
    const getMediaDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        console.log(stream);
        setMediaStream(stream);
        vidRef.current.srcObject = stream;
        vidRef.current.muted = true;
        vidRef.current.play();
      } catch (error) {}
    };
    getMediaDevices();
    console.log(vidRef.current);
  }, []);

  // Form Logic

  interface JoinRoom {
    room: string;
  }

  interface MakeRoom {
    room: string;
  }

  const { register: joinRegister, handleSubmit: joinHandleSubmit } =
    useForm<JoinRoom>();

  const { register: makeRoomRegister, handleSubmit: makeRoomHandleSubmit } =
    useForm<MakeRoom>();

  const joinSubmitHandler: SubmitHandler<JoinRoom> = (data, e) => {
    console.log(data);
    e?.target.reset();
  };

  const makeRoomSubmitHandler: SubmitHandler<MakeRoom> = (data, e) => {
    console.log(data);
    e?.target.reset();
  };

  return (
    <main>
      <div className="video-container">
        <video ref={vidRef}></video>
        <button
          id="audio-btn"
          onClick={() => (vidRef.current.muted = !vidRef.current.muted)}
        >
          <BiMicrophoneOff />
        </button>
        <button id="video-btn">
          <BiCamera />
        </button>
      </div>
      <div className="room-container">
        <div className="form-clamp">
          <form
            onSubmit={joinHandleSubmit(joinSubmitHandler)}
            autoComplete="off"
          >
            <input
              type="text"
              placeholder="Make a new Room"
              {...joinRegister("room")}
            />
            <button>
              <FiPlusSquare /> Create
            </button>
          </form>
          <form
            onSubmit={makeRoomHandleSubmit(makeRoomSubmitHandler)}
            autoComplete="off"
          >
            <input
              type="text"
              placeholder="Enter An Existing Room"
              {...makeRoomRegister("room")}
            />
            <button>
              <AiOutlineEnter /> Join
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Landingpage;
