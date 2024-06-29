import "./Main.css";
import { assets } from "../../assets/assets";
import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../../context/Context";
import PropTypes from "prop-types";

const Greet = ({ setInput }) => {
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
            onClick={() => setInput(card.prompt)}
          >
            <p>{card.prompt}</p>
            <img src={card.icon} />
          </div>
        ))}
      </div>
    </div>
  );
};

Greet.propTypes = {
  setInput: PropTypes.func.isRequired,
};

const Result = ({ prevPrompt, resultData, loading }) => {
  const resultRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = resultRef.current;

      // If user already scrolled to bottom + result still generating, then auto scroll
      if (scrollHeight - scrollTop === clientHeight) {
        setAutoScroll(true);
      }

      // Allow user to scroll while result is generating
      else {
        setAutoScroll(false);
      }
    };

    const resultDiv = resultRef.current;
    resultDiv.addEventListener("scroll", handleScroll);

    return () => {
      resultDiv.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // if (autoScroll && resultRef.current) {
    //   resultRef.current.scrollTop = resultRef.current.scrollHeight;
    // }
    const scrollToBottom = () => {
      if (autoScroll && resultRef.current) {
        resultRef.current.scrollTop = resultRef.current.scrollHeight;
      }
    };

    const timeout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeout);
  }, [resultData, autoScroll]);

  return (
    <div className="result" ref={resultRef}>
      {prevPrompt.map((prompt, index) => (
        <div key={index} className="result-entry">
          <div className="result-title">
            <img src={assets.user_icon} />
            <p>{prompt}</p>
          </div>
          <div className="result-data">
            <img src={assets.gemini_icon} />
            {index === prevPrompt.length - 1 && loading ? (
              <div className="loader">
                <hr />
                <hr />
                <hr />
              </div>
            ) : (
              <p dangerouslySetInnerHTML={{ __html: resultData[index] }}></p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

Result.propTypes = {
  prevPrompt: PropTypes.array.isRequired,
  resultData: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
};

const Main = () => {
  const {
    onSent,
    prevPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    stopGeneration,
    isTyping,
    sidebarPrompt,
  } = useContext(Context);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setInput((prevInput) => prevInput + "\n");
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSent();
    }
  };

  console.log("sidebar:", sidebarPrompt);
  console.log("previous:", prevPrompt);

  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <img src={assets.user_icon} />
      </div>
      <div className="main-container">
        {!showResult ? (
          <Greet setInput={setInput} />
        ) : (
          <Result
            prevPrompt={prevPrompt}
            resultData={resultData}
            loading={loading}
          />
        )}
        <div className="main-bottom">
          <div className="search-box">
            <textarea
              placeholder="Enter a prompt here"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              value={input}
              rows={Math.min(5, input.split("\n").length)}
            />
            <div>
              {loading || isTyping ? (
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
