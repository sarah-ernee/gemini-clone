import { createContext, useState } from "react";
import PropTypes from "prop-types";

import run from "../config/gemini";
export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompt, setPrevPrompt] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const typingEffect = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const onSent = async () => {
    setResultData(""); // clear previous prompts
    setLoading(true);
    setShowResult(true);

    setRecentPrompt(input); // displays user prompt beside user icon
    setPrevPrompt((prev) => [...prev, input]); // store history of prompts

    // formatting result - bold and newlines
    const response = await run(input);
    let responseArray = response.split("**");
    let boldedResponse;
    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 != 1) {
        boldedResponse += responseArray[i];
      } else {
        boldedResponse += "<b>" + responseArray[i] + "</b>";
      }
    }
    let formattedResponse = boldedResponse.split("*").join("</br");
    let newResponseArray = formattedResponse.split(" ");
    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      typingEffect(i, nextWord + " ");
    }

    setInput(""); // clear input field
    setLoading(false);
  };

  const contextValue = {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    prevPrompt,
    setPrevPrompt,
    showResult,
    loading,
    resultData,
    onSent,
    // newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContextProvider;
