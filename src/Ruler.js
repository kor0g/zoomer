import * as React from "react";

export class Ruler extends React.Component {
  state = {
    width: 0,
    height: 0
  };

  updateContainerSize = () => {
    this.setState({
      width: (this.container && this.container.offsetWidth) || 0,
      height: (this.container && this.container.offsetHeight) || 0
    });
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateContainerSize);
    window.addEventListener("orientationchange", this.updateContainerSize);
    this.updateContainerSize();
  }

  componentWillReceiveProps() {
    this.updateContainerSize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateContainerSize);
    window.removeEventListener("orientationchange", this.updateContainerSize);
  }

  render() {
    const { children, ...rest } = this.props;

    return (
      <div ref={container => (this.container = container)} {...rest}>
        {children(this.state.width, this.state.height)}
      </div>
    );
  }
}
