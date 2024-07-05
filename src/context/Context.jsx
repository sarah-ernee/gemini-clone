import { createContext, useState, useRef, useEffect, useReducer } from "react";
import PropTypes from "prop-types";

import run from "../config/gemini";
export const Context = createContext();

const initialState = {
  showResult: false,
  loading: false,
  isTyping: false,
  isNewChat: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_SHOW_RESULT":
      return { ...state, showResult: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_NEW_CHAT":
      return { ...state, isNewChat: action.payload };
    default:
      return state;
  }
};

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");

  const [resultData, setResultData] = useState([]);
  const [prevPrompt, setPrevPrompt] = useState([]);
  const [sidebarPrompt, setSidebarPrompt] = useState([]);

  // const [showResult, setShowResult] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [isTyping, setIsTyping] = useState(false);
  // const [isNewChat, setIsNewChat] = useState(false);
  const isCancelled = useRef(false);

  const [state, dispatch] = useReducer(reducer, initialState);

  const typingEffect = (index, nextWord, totalWords, responseIndex) => {
    if (isCancelled.current) {
      return;
    }

    if (index === 0) {
      // setIsTyping(true);
      dispatch({ type: "SET_TYPING", payload: true });
    }

    setTimeout(() => {
      if (!isCancelled.current) {
        setResultData((prevData) => {
          const newData = [...prevData];
          if (!newData[responseIndex]) {
            newData[responseIndex] = "";
          }
          newData[responseIndex] += nextWord;
          return newData;
        });

        if (index === totalWords - 1) {
          // setIsTyping(false);
          dispatch({ type: "SET_TYPING", payload: false });
        }
      }
    }, 75 * index);
  };

  useEffect(() => {
    if (state.isNewChat && sidebarPrompt.length === 0) {
      setSidebarPrompt((prev) => [...prev, input]);
    }
  }, [state.isNewChat, input, sidebarPrompt]);

  const onSent = async (prompt) => {
    // setLoading(true);
    // setShowResult(true);
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_SHOW_RESULT", payload: true });

    isCancelled.current = false;

    let response;
    // Clicking on an archived chat
    if (prompt !== undefined) {
      setRecentPrompt(prompt);
    }

    // Within same conversation thread
    else {
      if (sidebarPrompt.length === 0) {
        // setIsNewChat(true);
        dispatch({ type: "SET_NEW_CHAT", payload: true });
      } else if (initialState.isNewChat) {
        setPrevPrompt([]);
        setSidebarPrompt((prev) => [...prev, input]);
      }

      prompt = input;
      setPrevPrompt((prev) => [...prev, input]);
      setRecentPrompt(input);
    }

    response = await run(prompt);

    if (!isCancelled.current) {
      let formattedResponse = response
        .replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: 550;">$1</span>')
        .replace(/##(.*?)\n/g, "<h3>$1</h3>")
        .replace(/^\*(.*?)$/gm, "<ul><li>$1</li></ul>")
        .replace(/\n/g, "</br>");

      formattedResponse = formattedResponse.replace(/<\/ul>\n<ul>/g, "");

      let newResponseArray = formattedResponse.split(" ");
      const responseIndex = resultData.length;
      for (let i = 0; i < newResponseArray.length; i++) {
        const nextWord = newResponseArray[i];
        typingEffect(i, nextWord + " ", newResponseArray.length, responseIndex);
      }

      setResultData((prev) => [...prev, ""]);
    }

    setInput("");
    // setLoading(false);
    // setIsNewChat(false);
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_NEW_CHAT", payload: false });
  };

  const newChat = () => {
    // setIsNewChat(true);
    // setLoading(false);
    // setShowResult(false);

    dispatch({ type: "SET_NEW_CHAT", payload: true });
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_SHOW_RESULT", payload: false });
  };

  const stopGeneration = () => {
    isCancelled.current = true;
    // setLoading(false);
    // setIsTyping(false);
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_TYPING", payload: false });
  };

  const contextValue = {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    prevPrompt,
    setPrevPrompt,
    // showResult,
    // setShowResult,
    // loading,
    // isTyping,
    ...state,
    resultData,
    onSent,
    newChat,
    stopGeneration,
    sidebarPrompt,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ContextProvider;
