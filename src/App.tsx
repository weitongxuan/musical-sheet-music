import React from "react";
import styles from "./App.less";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  BrowserRouter
} from "react-router-dom";
import Score from "./pages/scores";

const App: React.FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <div>
          <div id={styles["header"]}>
            <div className={styles["menu"]}>
              <Link to="/">
                {" "}
                <div className={styles["block"]}>Home</div>
              </Link>
            </div>
            <div className={styles["menu"]}>
              <Link to="/Scores/123">
                <div className={styles["block"]}>Scores</div>
              </Link>
            </div>
          </div>

          <div id={styles["content"]}>
            <Switch>
              <Route path="/about" />
              <Route path="/Scores/:id" component={Score} />
              <Route path="/">dsadsa</Route>
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
