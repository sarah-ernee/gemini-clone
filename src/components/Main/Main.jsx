import "../../styles/Main.css";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

import Greet from "./Greet";
import Result from "./Result";

const Main = () => {
  const { state, updateState, onSent, stopGeneration } = useContext(AppContext);

  const handleKeyDown = (e) => {
    // Allow newline addition inside input box
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      updateState({ input: (prevState) => prevState.input + "\n" });
    }

    // Send message if ENTER is hit
    else if (e.key === "Enter") {
      e.preventDefault();
      onSent();
    }
  };

  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.user_icon} />
      </div>
      <div className="main-container">
        {!state.showResult ? <Greet /> : <Result />}
        <div className="main-bottom">
          <div className="search-box">
            <textarea
              placeholder="Enter a prompt here"
              onChange={(e) => updateState({ input: e.target.value })}
              onKeyDown={handleKeyDown}
              value={state.input}
              rows={Math.min(5, state.input.split("\n").length)}
            />
            <div>
              {state.loading || state.isTyping ? (
                <img src={assets.stop_icon} onClick={() => stopGeneration()} />
              ) : (
                <img src={assets.send_icon} onClick={() => onSent()} />
              )}
            </div>
          </div>
          <p className="bottom-info">
            Gemini can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
