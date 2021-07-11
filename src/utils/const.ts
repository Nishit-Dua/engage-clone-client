export const __prod__ = process.env.NODE_ENV === "production";

export const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

export const UserMediaConstraints: MediaStreamConstraints = {
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
