import { FC, useEffect, useRef } from "react";
import { BiMicrophoneOff, BiCamera } from "react-icons/bi";
import { FiPlusSquare } from "react-icons/fi";
import { AiOutlineEnter } from "react-icons/ai";
import "../styles/landing.scss";
import { SubmitHandler, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import Navbar from "../components/Navbar";

const Landingpage: FC = () => {
  const vidRef = useRef<any>(null);
  const history = useHistory();

  useEffect(() => {
    const getMediaDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        vidRef.current.srcObject = stream;
      } catch (error) {}
    };
    getMediaDevices();
  }, []);

  // Form Logic

  interface JoinRoom {
    room: string;
  }

  interface MakeRoom {
    room: string;
  }

  const {
    register: joinRegister,
    handleSubmit: joinHandleSubmit,
    formState: { errors: joinErrors },
  } = useForm<JoinRoom>();

  const {
    register: makeRoomRegister,
    handleSubmit: makeRoomHandleSubmit,
    formState: { errors: registerErrors },
  } = useForm<MakeRoom>();

  const joinSubmitHandler: SubmitHandler<JoinRoom> = (data, e) => {
    console.log(data);
    history.push(`/room/${data.room}`);

    e?.target.reset();
  };

  const makeRoomSubmitHandler: SubmitHandler<MakeRoom> = (data, e) => {
    console.log(data);
    e?.target.reset();
  };

  return (
    <>
      <Navbar />

      <main id="landing">
        <div className="video-container">
          <video ref={vidRef} autoPlay muted playsInline></video>
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
                placeholder="Join An Existing Room"
                {...joinRegister("room", {
                  required: "Enter The Room Code To Join",
                })}
              />
              <button>
                <AiOutlineEnter /> Join
              </button>
            </form>
            {joinErrors.room && (
              <p className="error">{joinErrors.room.message}</p>
            )}
            <form
              onSubmit={makeRoomHandleSubmit(makeRoomSubmitHandler)}
              autoComplete="off"
            >
              <input
                type="text"
                placeholder="Make a new Room"
                {...makeRoomRegister("room", {
                  required: "Enter Anything As Room Code To Create A Room",
                  maxLength: {
                    value: 25,
                    message:
                      "Room Code must be less than 25 characters long :(",
                  },
                })}
              />
              <button>
                <FiPlusSquare /> Create
              </button>
            </form>
            {registerErrors.room && (
              <p className="error">{registerErrors.room.message}</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Landingpage;
