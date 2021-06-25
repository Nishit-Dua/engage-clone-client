import "../styles/Homepage.scss";
import { FC } from "react";
import { FaGithub, FaGoogle, FaMicrosoft } from "react-icons/fa";
import { GoPerson } from "react-icons/go";
import { useHistory } from "react-router-dom";

const Homepage: FC = () => {
  const history = useHistory();

  const anonLoginHandler = () => {
    history.push("/anonLogin");
  };

  return (
    <main>
      <div className="btn-container">
        <div className="clamp-container">
          <button>
            <FaGoogle /> Login With Google
          </button>
          <button>
            <FaGithub /> Login With Github
          </button>
          {/* <button>
            <FaMicrosoft /> Login With Microsoft
          </button> */}
          <button onClick={anonLoginHandler}>
            <GoPerson /> Join As A Guest
          </button>
        </div>
      </div>
    </main>
  );
};

export default Homepage;
