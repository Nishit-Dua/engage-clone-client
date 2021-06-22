import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Room from "./pages/Room";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact children={() => <h2>Hi</h2>} />
          <Route path="/room/:roomId" exact children={<Room />} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
