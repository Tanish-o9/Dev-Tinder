import { Component } from "react";

export default class ChatErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page-container">
          <div className="error-message">
            <p>Chat could not be displayed. Refresh the page and try again.</p>
            <p>{String(this.state.error?.message || this.state.error)}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
