import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ChatLibrary from "./components/ChatLibrary";
import AnonLogin from "./pages/AnonLogin";
import Homepage from "./pages/Homepage";
import Landingpage from "./pages/Landingpage";
import Room from "./pages/Room";
import PrivateRoute from "./utils/PrivateRoute";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact children={<Homepage />} />
          <Route path="/anonLogin" exact children={<AnonLogin />} />
          <Route path="/land" exact children={<Landingpage />} />
          <PrivateRoute
            component={() => <ChatLibrary roomId={"test"} />}
            path="/test"
            exact
            children={<ChatLibrary roomId={"test"} />}
          />
          <PrivateRoute path="/room/:roomId" exact component={Room} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
