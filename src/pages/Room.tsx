import { FC } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";

interface UrlParams {
  roomId: string;
}

const Room: FC = () => {
  const { roomId } = useParams<UrlParams>();
  return (
    <main>
      Room {roomId}
      <Loader />
    </main>
  );
};

export default Room;
