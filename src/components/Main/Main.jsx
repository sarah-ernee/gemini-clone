import "./Main.css";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { Context } from "../../context/Context";

import Greet from "./Greet.jsx";
import Result from "./Result.jsx";

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    stopGeneration,
  } = useContext(Context);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setInput((prevInput) => prevInput + "\n");
    } else if (e.key === "Enter") {
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
        {!showResult ? (
          <Greet />
        ) : (
          <Result
            recentPrompt={recentPrompt}
            resultData={resultData}
            loading={loading}
          />
        )}

        <div className="main-bottom">
          <div className="search-box">
            <textarea
              placeholder="Enter a prompt here"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              value={input}
              rows={Math.min(5, input.split("\n").length)}
            />
            <div>
              {loading || showResult ? (
                <img src={assets.stop_icon} onClick={() => stopGeneration()} />
              ) : (
                <img src={assets.send_icon} onClick={() => onSent()} />
              )}
            </div>
          </div>

          <p className="bottom-info">
            Gemini may display inaccurate info, including about people, so
            double check its responses. Your privacy and Gemini Apps
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
