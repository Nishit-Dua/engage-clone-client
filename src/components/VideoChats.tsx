import Peer from "simple-peer";
import React, { FC, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "../context/AuthProvider";
import { useAppContext } from "../context/AppProvider";

const socket = io("http://localhost:5000");

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
  const { isMicOn, isVideoOn, dispatchApp } = useAppContext();

  // Note to self Don't be a retard and over complicate things # Note 1
  // const socketRef = useRef(socket);
  const [peers, setPeers] = useState<PeerType[]>([]);
  // Fuck that i can't deal with JS closures anymore just use a god damn ref
  // const peersRef = useRef<PeerType[]>([]);
  // Lite I solved this POS
  const userVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const localArrayOfPeers: PeerType[] = [];

    console.log(roomId);
    navigator.mediaDevices
      .getUserMedia(UserMediaConstraints)
      .then((stream) => {
        userVideo.current!.srcObject = stream;
        socket.emit("join-room", { roomId, name: currentUser?.displayName });
        socket.on("all-users", (users: { id: string; name: string }[]) => {
          const peers: PeerType[] = [];
          users.forEach((user) => {
            const peer = createPeer(
              user.id,
              socket.id,
              stream,
              currentUser?.displayName
            );
            localArrayOfPeers.push({
              peerId: user.id,
              peer,
              name: user.name,
            });
            // we need this peers array as if when user joins,server sends both user-joined
            // and all-users so BT
            peers.push({
              peerId: user.id,
              peer,
              name: user.name,
            });
          });
          setPeers(peers);
        });

        socket.on("user-joined", ({ signal, callerId, name }) => {
          const peer = addPeer(signal, callerId, stream);
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
    // This time we need the dependency array as if the user decides to change the room using URL
    // We'd not be able to remake the connections and shit
  }, [currentUser?.displayName, roomId]);

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
      <video muted ref={userVideo} autoPlay playsInline id="my-video" />
      {/* <h2 style={{ display: "inline" }}>{currentUser?.displayName}</h2> */}
      {/* Note 2 don't use fucking indexes as keys! */}
      {peers.map((peer) => {
        return <Video key={peer.peerId} peer={peer.peer} name={peer.name} />;
      })}
    </>
  );
};

export default VideoChat;

// Note 1: you dont need to define everyfucking think inside the react component
// Problem was socket when defined inside the component doesn't get's registered when
// the useEffect fires onMount, my solution was to use a reference to the socket 🤦🏼‍♂️
// a simpler solution was just to connect before the components mounts and no need for reference.
