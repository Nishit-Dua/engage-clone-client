import Peer from "simple-peer";
import React, { FC, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000");

type UrlParams = {
  roomId: string;
};

type PeerType = {
  peerId: string;
  peer: Peer.Instance;
};

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

const VideoStyle: React.CSSProperties = {
  height: "480px",
};

const UserMediaConstraints: MediaStreamConstraints = {
  video: {
    height: {
      min: 144,
      ideal: 360,
      max: 720,
    },
  },
  audio: true,
};

const Video = ({ peer }: { peer: Peer.Instance }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current!.srcObject = stream;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // we dont need to add peer as a dependency array because we manually cleanup
  // the disconneted users so after the repaint the components unmounts itself
  return <video playsInline autoPlay ref={ref} style={VideoStyle} />;
};

const Room: FC = () => {
  // Note to self Don't be a retard and over complicate things # Note 1
  // const socketRef = useRef(socket);

  const [peers, setPeers] = useState<PeerType[]>([]);
  // Fuck that i can't deal with JS closures anymore just use a god damn ref
  const peersRef = useRef<PeerType[]>([]);

  const userVideo = useRef<HTMLVideoElement>(null);
  const { roomId } = useParams<UrlParams>();

  useEffect(() => {
    console.log(roomId);
    navigator.mediaDevices.getUserMedia(UserMediaConstraints).then((stream) => {
      userVideo.current!.srcObject = stream;
      socket.emit("join-room", roomId);
      socket.on("all-users", (users) => {
        const peers: PeerType[] = [];
        users.forEach((userId: string) => {
          const peer = createPeer(userId, socket.id, stream);
          peersRef.current.push({
            peerId: userId,
            peer,
          });
          peers.push({
            peerId: userId,
            peer,
          });
        });
        setPeers(peers);
      });

      socket.on("user-joined", ({ signal, callerId }) => {
        const peer = addPeer(signal, callerId, stream);
        peersRef.current.push({
          peerId: callerId,
          peer,
        });

        setPeers((users) => [...users, { peerId: callerId, peer }]);
      });

      socket!.on("receiving returned signal", ({ signal, id }) => {
        const item = peersRef.current.find((p) => p.peerId === id);
        if (item) item.peer.signal(signal);
      });

      socket.on("user-left", ({ quiterId }) => {
        const quiter = peersRef.current.find(
          (peer) => peer.peerId === quiterId
        );
        if (quiter) {
          quiter.peer.destroy();
          setPeers((prevPeers) =>
            prevPeers.filter((peer) => peer.peerId !== quiterId)
          );
        }
      });
    });
    // This time we need the dependency array as if the user decides to change the room using URL
    // We'd not be able to remake the connections and shit
  }, [roomId]);

  const createPeer = (
    userToConnect: string,
    callerId: string,
    stream: MediaStream
  ) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: { iceServers },
    });

    peer.on("signal", (signal) => {
      socket.emit("sending signal", {
        userToConnect,
        callerId,
        signal,
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
      socket.emit("returning signal", { signal, callerId });
    });

    peer.signal(signalRecieved);

    return peer;
  };

  return (
    <div>
      <h1>My socket Id: {socket.id}</h1>
      <video muted ref={userVideo} autoPlay playsInline style={VideoStyle} />
      {/* Note 2 don't use fucking indexes as keys! */}
      {peers.map((peer) => {
        return <Video key={peer.peerId} peer={peer.peer} />;
      })}
    </div>
  );
};

export default Room;

// Note 1: you dont need to define everyfucking think inside the react component
// Problem was socket when defined inside the component doesn't get's registered when
// the useEffect fires onMount, my solution was to use a reference to the socket 🤦🏼‍♂️
// a simpler solution was just to connect before the components mounts and no need for reference.
