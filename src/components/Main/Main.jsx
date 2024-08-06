import "./Main.css";
import { assets } from "../../assets/assets";
import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../../context/Context";

const Greet = () => {
  const { dispatch } = useContext(Context);
  const cardsData = [
    {
      prompt: "Suggest beautiful places to see on an upcoming trip",
      icon: assets.compass_icon,
    },
    {
      prompt: "Briefly summarize this concept: urban planning",
      icon: assets.bulb_icon,
    },
    {
      prompt: "Brainstorm team bonding activities for our work retreat",
      icon: assets.message_icon,
    },
    { prompt: "Improve readability of code", icon: assets.code_icon },
  ];

  return (
    <div>
      <div className="greet">
        <p>
          <span>Hello, Dev.</span>
        </p>
        <p>How can I help you today?</p>
      </div>
      <div className="cards">
        {cardsData.map((card, index) => (
          <div
            className="card"
            key={index}
            onClick={() =>
              dispatch({ type: "SET_INPUT", payload: card.prompt })
            }
          >
            <p>{card.prompt}</p>
            <img src={card.icon} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Result = () => {
  const resultRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const { state } = useContext(Context);

  // Setup event listener for `autoscroll` state
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = resultRef.current;

      if (scrollHeight - scrollTop <= clientHeight + 10) {
        setAutoScroll(true);
      } else {
        setAutoScroll(false);
      }
    };

    const resultDiv = resultRef.current;
    resultDiv.addEventListener("scroll", handleScroll);

    return () => {
      resultDiv.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Scroll behavior depending on `autoscroll`
  useEffect(() => {
    const scrollToBottom = () => {
      if (autoScroll) {
        resultRef.current.scrollTop = resultRef.current.scrollHeight;
      }
    };

    scrollToBottom();
  }, [state.resultData, autoScroll]);

  return (
    <div className="result" ref={resultRef}>
      {state.prevPrompt.map((prompt, index) => (
        <div key={index} className="result-entry">
          <div className="result-title">
            <img src={assets.user_icon} />
            <p
              dangerouslySetInnerHTML={{
                __html: prompt.replace(/\n/g, "<br>"),
              }}
            ></p>
          </div>
          <div className="result-data">
            <img src={assets.gemini_icon} />
            {index === state.prevPrompt.length - 1 && state.loading ? (
              <div className="loader">
                <hr />
                <hr />
                <hr />
              </div>
            ) : (
              <p
                dangerouslySetInnerHTML={{ __html: state.resultData[index] }}
              ></p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const Main = () => {
  const { state, dispatch, onSent, newChat, stopGeneration } =
    useContext(Context);

  const handleKeyDown = (e) => {
    // Allow newline addition inside input box
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      dispatch({
        type: "SET_INPUT",
        payload: (prevState) => prevState.input + "\n",
      });
    }

    // Send message if ENTER is hit
    else if (e.key === "Enter") {
      e.preventDefault();
      newChat();
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
              onChange={(e) =>
                dispatch({ type: "SET_INPUT", payload: e.target.value })
              }
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
