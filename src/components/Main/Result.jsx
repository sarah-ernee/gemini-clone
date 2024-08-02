import "../../styles/Main.css";
import { assets } from "../../assets/assets";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
const Result = () => {
  const resultRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const { state } = useContext(AppContext);

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
      {state.resultData.map((data, index) => (
        <div key={index} className="result-entry">
          <div className="result-title">
            <img src={assets.user_icon} />
            <p
              dangerouslySetInnerHTML={{
                __html: state.prevPrompt[index]?.replace(/\n/g, "<br>"),
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
              <p dangerouslySetInnerHTML={{ __html: data }}></p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Result;
