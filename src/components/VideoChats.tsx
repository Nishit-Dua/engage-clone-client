import Peer from "simple-peer";
import React, { FC, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "../context/AuthProvider";
import { useAppContext } from "../context/AppProvider";
import { useHistory } from "react-router-dom";
import { __prod__ } from "../utils/const";
import { FiVideoOff } from "react-icons/fi";

const socket = __prod__
  ? io("https://engage-clone-server.herokuapp.com/")
  : io("http://localhost:5000");

type PeerType = {
  peerId: string;
  peer: Peer.Instance;
  name: string;
};

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

const UserMediaConstraints: MediaStreamConstraints = {
  video: {
    height: {
      min: 144,
      ideal: 360,
      max: 720,
    },
    facingMode: {
      exact: "user",
    },
  },
  audio: true,
};

const Video = ({ peer, name }: { peer: Peer.Instance; name: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on("stream", (stream) => {
      videoRef.current!.srcObject = stream;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // we dont need to add peer as a dependency array because we manually cleanup
  // the disconneted users so after the repaint the components unmounts itself
  return (
    <div className="video-container">
      <video playsInline autoPlay ref={videoRef} />
      <p>{name}</p>
    </div>
  );
};

const VideoChat: FC<{ roomId: string }> = ({ roomId }) => {
  const { currentUser } = useAuthContext();
  const { isMicOn, isVideoOn, leaveVideoChatTrigger, chatRoomTrigger } =
    useAppContext();

  const history = useHistory();
  const [peers, setPeers] = useState<PeerType[]>([]);
  const userVideo = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>();

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
        history.push("/");
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
        socket.emit("join-room", { roomId, name: currentUser?.displayName });
        socket.on("all-users", (users: { id: string; name: string }[]) => {
          const peers: PeerType[] = [];
          users.forEach((user) => {
            const peer = createPeer(
              user.id,
              socket.id,
              streamRef.current!,
              currentUser?.displayName
            );
            localArrayOfPeers.push({
              peerId: user.id,
              peer,
              name: user.name,
            });
            peers.push({
              peerId: user.id,
              peer,
              name: user.name,
            });
          });
          setPeers(peers);
        });

        socket.on("user-joined", ({ signal, callerId, name }) => {
          const peer = addPeer(signal, callerId, streamRef.current!);
          localArrayOfPeers.push({
            peerId: callerId,
            peer,
            name,
          });

          setPeers((users) => [...users, { peerId: callerId, peer, name }]);
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
    myName: string
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
      {peers.map((peer) => {
        return <Video key={peer.peerId} peer={peer.peer} name={peer.name} />;
      })}
    </>
  );
};

export default VideoChat;
