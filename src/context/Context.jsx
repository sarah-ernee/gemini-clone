import { createContext, useState, useRef } from "react";
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

  const isCancelled = useRef(false);

  const typingEffect = (index, nextWord) => {
    if (!isCancelled.current) {
      setTimeout(function () {
        setResultData((prev) => prev + nextWord);
      }, 75 * index);
    }
  };

  const onSent = async (prompt) => {
    setResultData(""); // clear previous prompts
    setLoading(true);
    setShowResult(true);
    isCancelled.current = false;

    setRecentPrompt(input); // displays user prompt beside user icon
    setPrevPrompt((prev) => [...prev, input]); // store history of prompts

    // formatting result - bold and newlines
    let response;
    if (prompt !== undefined) {
      response = await run(prompt);
      setRecentPrompt(prompt);
    } else {
      setPrevPrompt((prev) => [...prev, input]);
      setRecentPrompt(input);
      response = await run(input);
    }

    if (!isCancelled.current) {
      let formattedResponse = response
        .replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: 550;">$1</span>')
        .replace(/##(.*?)\n/g, "<h3>$1</h3>")
        .replace(/^\*(.*?)$/gm, "<ul><li>$1</li></ul>")
        .replace(/\n/g, "</br>");

      // formattedResponse = formattedResponse.replace(/<\/ul>\n<ul>/g, "");

      let newResponseArray = formattedResponse.split(" ");
      for (let i = 0; i < newResponseArray.length; i++) {
        const nextWord = newResponseArray[i];
        typingEffect(i, nextWord + " ");
      }
    }

    setInput(""); // clear input field
    setLoading(false);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const stopGeneration = () => {
    isCancelled.current = true;
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
    newChat,
    stopGeneration,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContextProvider;
