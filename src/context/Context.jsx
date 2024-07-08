import { createContext, useRef, useReducer } from "react";
import PropTypes from "prop-types";

import run from "../config/gemini";
export const Context = createContext();

const initialState = {
  showResult: false,
  loading: false,
  isTyping: false,
  input: "",
  recentPrompt: "",
  resultData: [],
  prevPrompt: [],
  sidebarPrompt: [],
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
      return {
        ...state,
        input:
          typeof action.payload === "function"
            ? action.payload(state)
            : action.payload,
      };
    case "SET_RECENT_PROMPT":
      return { ...state, recentPrompt: action.payload };
    case "SET_RESULT":
      return {
        ...state,
        resultData:
          typeof action.payload === "function"
            ? action.payload(state)
            : action.payload,
      };
    case "SET_PREV_PROMPT":
      return {
        ...state,
        prevPrompt:
          typeof action.payload === "function"
            ? action.payload(state)
            : action.payload,
      };
    case "SET_SIDEBAR_PROMPT":
      return {
        ...state,
        sidebarPrompt:
          typeof action.payload === "function"
            ? action.payload(state)
            : action.payload,
      };
    default:
      return state;
  }
};

const ContextProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isCancelled = useRef(false);
  const isNewChat = useRef(false);

  // Function that handles sidebar, recent and previous prompts
  const onSent = async (prompt) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_SHOW_RESULT", payload: true });
    isCancelled.current = false;

    let response;
    // Archived chat where onSent(arg)
    if (prompt) {
      dispatch({ type: "SET_RECENT_PROMPT", payload: prompt });
      response = await run(prompt);
      await handleResponse(response);
      return;
    }

    // Within same conversation thread - first chat
    if (state.sidebarPrompt.length === 0) {
      isNewChat.current = true;
      dispatch({ type: "SET_SIDEBAR_PROMPT", payload: [state.input] });
    }

    // Consecutive new chats
    else if (isNewChat.current && state.sidebarPrompt.length > 0) {
      dispatch({
        type: "SET_SIDEBAR_PROMPT",
        payload: (prevState) => [...prevState.sidebarPrompt, state.input],
      });
    }

    dispatch({
      type: "SET_PREV_PROMPT",
      payload: (prevState) => [...prevState.prevPrompt, state.input],
    });
    dispatch({ type: "SET_RECENT_PROMPT", payload: state.input });
    response = await run(state.input);
    await handleResponse(response);

    dispatch({ type: "SET_INPUT", payload: "" });
    dispatch({ type: "SET_LOADING", payload: false });
    isNewChat.current = false;
  };

  // Function that reformats Gemini response
  const handleResponse = async (response) => {
    if (isCancelled.current) return;

    let formattedResponse = response
      .replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: 550;">$1</span>')
      .replace(/##(.*?)\n/g, "<h3>$1</h3>")
      .replace(/^\*(.*?)$/gm, "<ul><li>$1</li></ul>")
      .replace(/\n/g, "</br>");

    formattedResponse = formattedResponse.replace(/<\/ul>\n<ul>/g, "");

    let newResponseArray = formattedResponse.split(" ");
    const responseIndex = state.resultData.length;
    for (let i = 0; i < newResponseArray.length; i++) {
      if (isCancelled.current) return;
      const nextWord = newResponseArray[i];
      typingEffect(i, nextWord + " ", newResponseArray.length, responseIndex);
    }

    dispatch({
      type: "SET_RESULT",
      payload: (prevState) => [...prevState.resultData, ""],
    });
  };

  // Function that handles the typing illusion of Gemini response
  const typingEffect = (index, nextWord, totalWords, responseIndex) => {
    if (isCancelled.current) return;

    if (index === 0) {
      dispatch({ type: "SET_TYPING", payload: true });
    }

    setTimeout(() => {
      if (!isCancelled.current) {
        dispatch({
          type: "SET_RESULT",
          payload: (prevState) => {
            const newData = [...prevState.resultData];
            if (!newData[responseIndex]) {
              newData[responseIndex] = "";
            }
            newData[responseIndex] += nextWord;
            return newData;
          },
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
    dispatch({ type: "SET_PREV_PROMPT", payload: [] });
    dispatch({ type: "SET_RESULT", payload: [] });
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
