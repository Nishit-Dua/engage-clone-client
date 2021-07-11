import Peer from "simple-peer";

export type PeerType = {
  peerId: string;
  peer: Peer.Instance;
  name: string;
  photoURL: string | null | undefined;
  isAnonymous: boolean;
  email: string;
};

export type UserType = {
  id: string;
  name: string;
  photoURL: string | null | undefined;
  isAnonymous: boolean;
  email: string;
};

export type MessageType = {
  senderName: string;
  senderPfp: string | null;
  message: string;
  time: Date;
};
