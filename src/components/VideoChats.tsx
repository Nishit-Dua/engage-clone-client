import Peer from "simple-peer";
import { FC, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "../context/AuthProvider";
import { useAppContext } from "../context/AppProvider";
import { useHistory } from "react-router-dom";
import { __prod__, iceServers, UserMediaConstraints } from "../utils/const";
import { FiVideoOff } from "react-icons/fi";
import { PeerType, UserType } from "../utils/types";
import { Video } from "./SingleVideo";
import useSound from "use-sound";

import joinSoundEffect from "../assets/discord-join.mp3";
import leaveSoundEffect from "../assets/discord-leave.mp3";

const socket = __prod__
  ? io("https://engage-clone-server.herokuapp.com/")
  : io("http://localhost:5000");

const VideoChat: FC<{ roomId: string }> = ({ roomId }) => {
  const { currentUser } = useAuthContext();
  const { isMicOn, isVideoOn, leaveVideoChatTrigger, chatRoomTrigger } =
    useAppContext();

  const [joiningSound] = useSound(joinSoundEffect, { volume: 0.3 });
  const [leavingingSound] = useSound(leaveSoundEffect);

  const history = useHistory();
  const [peers, setPeers] = useState<PeerType[]>([]);
  const [numUsers, setNumUsers] = useState(0);

  const userVideo = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>();

  useEffect(() => {
    if (peers.length > numUsers) {
      joiningSound();
    } else if (numUsers > peers.length) {
      leavingingSound();
    }
    setNumUsers(peers.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peers.length]);

  useEffect(() => {
    if (streamRef.current)
      streamRef.current.getAudioTracks()[0].enabled = isMicOn;
  }, [isMicOn]);

  useEffect(() => {
    if (streamRef.current)
      streamRef.current.getVideoTracks()[0].enabled = isVideoOn;
  }, [isVideoOn]);

  useEffect(() => {
    if (leaveVideoChatTrigger) {
      // removes shit from state
      peers.forEach((peer) => {
        peer.peer.destroy();
      });

      socket.emit("manual-disconnect", { id: socket.id });
      streamRef.current?.getTracks().forEach(function (track) {
        track.stop();
      });

      if (chatRoomTrigger) {
        history.push(`/chatroom/${roomId}`);
      } else {
        history.push("/login");
      }
    }
    // Memory leak fix, do not call an event which would lead to
    // change this in this use effet
  }, [leaveVideoChatTrigger, chatRoomTrigger, peers, history, roomId]);

  useEffect(() => {
    const localArrayOfPeers: PeerType[] = [];

    navigator.mediaDevices
      .getUserMedia(UserMediaConstraints)
      .then((stream) => {
        // eslint-ignore
        streamRef.current = stream;
        userVideo.current!.srcObject = streamRef.current;

        socket.emit("join-room", {
          roomId,
          name: currentUser?.displayName,
          isAnonymous: currentUser?.isAnonymous,
        });
        socket.on("all-users", (users: UserType[]) => {
          const peers: PeerType[] = [];
          users.forEach((user) => {
            const peer = createPeer(
              user.id,
              socket.id,
              streamRef.current!,
              currentUser?.displayName,
              currentUser?.isAnonymous!
            );
            localArrayOfPeers.push({
              peerId: user.id,
              peer,
              name: user.name,
              isAnonymous: user.isAnonymous,
            });
            peers.push({
              peerId: user.id,
              peer,
              name: user.name,
              isAnonymous: user.isAnonymous,
            });
          });
          setPeers(peers);
        });

        socket.on("user-joined", ({ signal, callerId, name, isAnonymous }) => {
          const peer = addPeer(signal, callerId, streamRef.current!);
          localArrayOfPeers.push({
            peerId: callerId,
            peer,
            name,
            isAnonymous,
          });

          setPeers((users) => [
            ...users,
            { peerId: callerId, peer, name, isAnonymous },
          ]);
        });

        socket.on("handshake", ({ signal, id }) => {
          const item = localArrayOfPeers.find((p) => p.peerId === id);
          if (item) item.peer.signal(signal);
        });

        socket.on("user-left", ({ quiterId }) => {
          const quiter = localArrayOfPeers.find(
            (peer) => peer.peerId === quiterId
          );
          if (quiter) {
            quiter.peer.destroy();
            setPeers((prevPeers) =>
              prevPeers.filter((peer) => peer.peerId !== quiterId)
            );
          }
        });
      })
      .catch(() => {
        alert("you need to give permissions for camera/mic!!!\nThen Refresh");
      });
    // fucking piece of shit es-lint recomendation had me a memory leak
    // which took more than 1.5 hours to fix
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPeer = (
    userToConnect: string,
    callerId: string,
    stream: MediaStream,
    myName: string,
    isAnonymous: boolean
  ) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: { iceServers },
    });

    peer.on("signal", (signal) => {
      socket.emit("signalling", {
        userToConnect,
        callerId,
        signal,
        myName,
        isAnonymous,
      });
    });

    return peer;
  };

  const addPeer = (
    signalRecieved: string | Peer.SignalData,
    callerId: string,
    stream: MediaStream
  ) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: { iceServers },
    });

    peer.on("signal", (signal) => {
      socket.emit("signalling-back", { signal, callerId });
    });

    peer.signal(signalRecieved);
    return peer;
  };

  return (
    <>
      <div className="my-video-container">
        <video muted ref={userVideo} autoPlay playsInline id="my-video" />
        {!isVideoOn && <FiVideoOff className="no-vid" />}
      </div>
      {peers.length > 0 ? (
        peers.map((peer) => {
          return (
            <Video
              key={peer.peerId}
              peer={peer.peer}
              name={peer.name}
              isAnonymous={peer.isAnonymous}
            />
          );
        })
      ) : (
        <p className="empty-room">
          Seems Like no one's here yet, Invite people by sharing the link in the
          url!
        </p>
      )}
    </>
  );
};

export default VideoChat;
