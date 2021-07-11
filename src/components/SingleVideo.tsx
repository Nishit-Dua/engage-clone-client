import { useRef, useEffect } from "react";
import Peer from "simple-peer";

export const Video = ({
  peer,
  name,
  isAnonymous,
}: {
  peer: Peer.Instance;
  name: string;
  isAnonymous: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>();

  useEffect(() => {
    peer.on("stream", (stream) => {
      streamRef.current = stream;
      videoRef.current!.srcObject = streamRef.current;

      console.log(streamRef.current.getAudioTracks()[0]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // we dont need to add peer as a dependency array because we manually cleanup
  // the disconneted users so after the repaint the components unmounts itself

  return (
    <div className="video-container">
      <video playsInline autoPlay ref={videoRef} />
      <p>{`${name} ${!!isAnonymous ? "(Guest)" : ""}`}</p>
    </div>
  );
};
