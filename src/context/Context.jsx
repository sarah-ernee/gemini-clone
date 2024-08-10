import "./Context.css";
import run from "../config/gemini";
import { createContext, useRef, useReducer } from "react";
import { formatResponse } from "../utils/formatting";

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
  // isNewChat: false,
};

const functionPayload = (state, action, key) => {
  return {
    ...state,
    [key]:
      typeof action.payload === "function"
        ? action.payload(state)
        : action.payload,
  };
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
      return functionPayload(state, action, "input");
    case "SET_RECENT_PROMPT":
      return { ...state, recentPrompt: action.payload };
    case "SET_RESULT":
      return functionPayload(state, action, "resultData");
    case "SET_PREV_PROMPT":
      return functionPayload(state, action, "prevPrompt");
    case "CREATE_NEW_CHAT":
      return { ...state, isNewChat: action.payload };
    case "SET_SIDEBAR_PROMPT":
      return functionPayload(state, action, "sidebarPrompt");
    default:
      return state;
  }
};

const ContextProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const timeouts = useRef([]);

  const clearAllTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  const onSent = async (prompt, isNewChat = true) => {
    if (isNewChat) {
      await newChat();
    }
    resetStates();

    let response;
    if (prompt !== undefined) {
      response = await run(prompt);
      dispatch({ type: "SET_RECENT_PROMPT", payload: prompt });
    } else {
      dispatch({
        type: "SET_PREV_PROMPT",
        payload: (prevState) => [...prevState.prevPrompt, state.input],
      });
      dispatch({
        type: "SET_SIDEBAR_PROMPT",
        payload: (prevState) => [...prevState.sidebarPrompt, state.input],
      });
      dispatch({ type: "SET_RECENT_PROMPT", payload: state.input });

      response = await run(state.input);
    }

    await handleResponse(response);

    dispatch({ type: "SET_INPUT", payload: "" });
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "CREATE_NEW_CHAT", payload: false });
  };

  const resetStates = () => {
    dispatch({ type: "SET_RESULT", payload: [] });
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_SHOW_RESULT", payload: true });
  };

  const handleResponse = async (response) => {
    let formattedResponse = formatResponse(response);
    let newResponseArray = formattedResponse.split(" ");

    dispatch({ action: "SET_TYPING", payload: true });

    dispatch({
      type: "SET_RESULT",
      payload: (prevState) => [...prevState.resultData, ""],
    });

    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      typingEffect(
        i,
        nextWord + " ",
        newResponseArray.length,
        state.resultData.length
      );
    }

    // Prevent undefined at the start of response
    // dispatch({
    //   type: "SET_RESULT",
    //   payload: (prevState) => [...prevState.resultData, ""],
    // });
  };

  const typingEffect = (wordIndex, nextWord, totalWords, responseIndex) => {
    const timeout = setTimeout(() => {
      // if (!nextWord) return;
      if (nextWord) {
        dispatch({
          type: "SET_RESULT",
          payload: (prevState) => {
            const newData = [...prevState.resultData];
            newData[responseIndex] += nextWord;
            return newData;
          },
        });
      }

      if (wordIndex === totalWords - 1) {
        dispatch({ type: "SET_TYPING", payload: false });
      }
    }, 75 * wordIndex);

    timeouts.current.push(timeout);
  };

  const newChat = async () => {
    clearAllTimeouts();

    dispatch({ type: "SET_PREV_PROMPT", payload: [] });
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_SHOW_RESULT", payload: false });

    // Wait for state to update
    await new Promise((resolve) => setTimeout(resolve, 0));
  };

  const stopGeneration = () => {
    clearAllTimeouts();

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

export default ContextProvider;
