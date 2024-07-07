import { createContext, useState, useRef, useEffect, useReducer } from "react";
import PropTypes from "prop-types";

import run from "../config/gemini";
export const Context = createContext();

const initialState = {
  showResult: false,
  loading: false,
  isTyping: false,
  input: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_SHOW_RESULT":
      return { ...state, showResult: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_INPUT":
      return { ...state, input: action.payload };
    default:
      return state;
  }
};

const ContextProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [recentPrompt, setRecentPrompt] = useState("");
  const [resultData, setResultData] = useState([]);
  const [prevPrompt, setPrevPrompt] = useState([]);
  const [sidebarPrompt, setSidebarPrompt] = useState([]);

  const isCancelled = useRef(false);
  const isNewChat = useRef(false);

  // Watcher given asynchronicity of onSent function
  useEffect(() => {
    if (isNewChat.current && state.input && sidebarPrompt.length === 0) {
      setSidebarPrompt([state.input]);
    }
  }, [isNewChat, state.input, sidebarPrompt]);

  // Function that handles sidebar, recent and previous prompts
  const onSent = async (prompt) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_SHOW_RESULT", payload: true });
    isCancelled.current = false;

    let response;
    // Archived chat where onSent(arg)
    if (prompt) {
      setRecentPrompt(prompt);
      response = await run(prompt);
      await handleResponse(response);
      return;
    }

    // Within same conversation thread - first chat
    if (sidebarPrompt.length === 0) {
      isNewChat.current = true;
      setSidebarPrompt([state.input]);
    }

    // Consecutive new chats
    else if (isNewChat.current && sidebarPrompt.length > 0) {
      setSidebarPrompt((prev) => [...prev, state.input]);
    }

    setPrevPrompt((prev) => [...prev, state.input]);
    setRecentPrompt(state.input);
    response = await run(state.input);
    await handleResponse(response);

    dispatch({ type: "SET_INPUT", payload: "" });
    dispatch({ type: "SET_LOADING", payload: false });
    isNewChat.current = false;
  };

  // Function that reformats Gemini response
  const handleResponse = async (response) => {
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
      console.log(resultData);
    }
  };

  // Function that handles the typing illusion of Gemini response
  const typingEffect = (index, nextWord, totalWords, responseIndex) => {
    if (isCancelled.current) {
      return;
    }

    if (index === 0) {
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
          dispatch({ type: "SET_TYPING", payload: false });
        }
      }
    }, 75 * index);
  };

  // Function that resets necessary states when New Chat is clicked
  const newChat = () => {
    isNewChat.current = true;
    setPrevPrompt([]);
    setResultData([]);
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_SHOW_RESULT", payload: false });
  };

  // Function that stops generation of Gemini response
  const stopGeneration = () => {
    isCancelled.current = true;
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_TYPING", payload: false });
  };

  const contextValue = {
    state,
    dispatch,
    recentPrompt,
    setRecentPrompt,
    prevPrompt,
    setPrevPrompt,
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
