import React from "react";
import { render } from "react-dom";
import { Zoomer } from "./Zoomer";
import { Ruler } from "./Ruler";

class App extends React.Component {
  render() {
    return (
      <Ruler style={{ width: "100%" }}>
        {width => <Zoomer width={width} />}
      </Ruler>
    );
  }
}

render(<App />, document.getElementById("root"));
