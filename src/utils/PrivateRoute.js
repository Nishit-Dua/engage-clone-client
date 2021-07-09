import { Redirect, Route, useLocation, useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { useEffect } from "react";

// I cant figure out the types for ...rest so imma just use js for this!
const PrivateRoute = ({ component: Component, ...rest }) => {
  const { pathname } = useLocation();
  const { currentUser, dispatch } = useAuthContext();
  useEffect(() => {
    const pathSplitList = pathname.split("/");
    if (pathSplitList[pathSplitList.length - 2] === "room")
      dispatch({
        type: "REDIRECT-AFTER-LOGIN",
        payload: { roomId: pathSplitList[pathSplitList.length - 1] },
      });
    if (!currentUser) {
      dispatch({ type: "TRY-JOIN-WITHOUT-LOGIN" });
    }
  }, []);

  return (
    <Route
      {...rest}
      children={(props) =>
        !!currentUser ? <Component {...props} /> : <Redirect to={"/"} />
      }
    />
  );
};

export default PrivateRoute;
