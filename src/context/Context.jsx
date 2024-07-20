import "./Context.css";
import run from "../config/gemini";
import { createContext, useRef, useReducer, useEffect } from "react";

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
  pauses: {},
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
    case "SET_SIDEBAR_PROMPT":
      return functionPayload(state, action, "sidebarPrompt");
    case "SET_CANCELLATION_STATE":
      return {
        ...state,
        pauses: {
          ...state.pauses,
          [action.payload.id]: action.payload.isCancelled,
        },
      };
    case "CLEAR_CANCELLATION_STATES":
      return { ...state, pauses: {} };
    default:
      return state;
  }
};

const ContextProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isNewChat = useRef(false);
  const currPauseId = useRef(null);
  const pauseSnapshot = useRef(state.pauses);

  // Asynchronous nature may not have the updated val of dispatched state
  // Hence why we utilize useEffect to update a variable based on the state change
  useEffect(() => {
    pauseSnapshot.current = state.pauses;
  }, [state.pauses]);

  const onSent = async (prompt) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_SHOW_RESULT", payload: true });

    // Cancel all previous responses
    Object.keys(pauseSnapshot.current).forEach((id) => {
      dispatch({
        type: "SET_CANCELLATION_STATE",
        payload: { id, isCancelled: true },
      });
    });

    // Register new pauseId that defaults as false at first
    const pauseId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);
    currPauseId.current = pauseId;
    dispatch({
      type: "SET_CANCELLATION_STATE",
      payload: { id: pauseId, isCancelled: false },
    });

    let response;
    if (prompt) {
      dispatch({ type: "SET_RECENT_PROMPT", payload: prompt });
      response = await run(prompt);
      await handleResponse(response, pauseId);
      return;
    }

    if (state.sidebarPrompt.length === 0) {
      isNewChat.current = true;
      dispatch({ type: "SET_SIDEBAR_PROMPT", payload: [state.input] });
    } else if (isNewChat.current && state.sidebarPrompt.length > 0) {
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
    await handleResponse(response, pauseId);

    dispatch({ type: "SET_INPUT", payload: "" });
    dispatch({ type: "SET_LOADING", payload: false });
    isNewChat.current = false;
  };

  const handleResponse = async (response, pauseId) => {
    if (pauseSnapshot.current[pauseId]) return;

    let formattedResponse = response
      .replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: 550;">$1</span>')
      .replace(/##(.*?)\n/g, "<h3>$1</h3>")
      .replace(/^\*(.*?)$/gm, "<ul><li>$1</li></ul>")
      .replace(
        /```(\w+)\n([\s\S]*?)```/g,
        '<pre class="code-block"><div class="code-header"><span class="code-lang">$1</span></div><code>$2</code></pre>'
      )
      .replace(
        /```\n([\s\S]*?)```/g,
        '<pre class="code-block"><code>$1</code></pre>'
      )
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, "</br>");

    formattedResponse = formattedResponse.replace(/<\/ul>\n<ul>/g, "");

    let newResponseArray = formattedResponse.split(" ");
    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      typingEffect(
        i,
        nextWord + " ",
        newResponseArray.length,
        state.resultData.length,
        pauseId
      );
    }

    dispatch({
      type: "SET_RESULT",
      payload: (prevState) => [...prevState.resultData, ""],
    });
  };

  const typingEffect = (
    wordIndex,
    nextWord,
    totalWords,
    responseIndex,
    pauseId
  ) => {
    if (wordIndex === 0) {
      dispatch({ type: "SET_TYPING", payload: true });
    }

    setTimeout(() => {
      if (!pauseSnapshot.current[pauseId]) {
        dispatch({
          type: "SET_RESULT",
          payload: (prevState) => {
            const newData = [...prevState.resultData];
            newData[responseIndex] += nextWord;
            return newData;
          },
        });

        if (wordIndex === totalWords - 1) {
          dispatch({ type: "SET_TYPING", payload: false });

          // Clean up the cancellation state for this response
          dispatch({
            type: "SET_CANCELLATION_STATE",
            payload: { id: pauseId, isCancelled: true },
          });
        }
      }
    }, 75 * wordIndex);
  };

  const newChat = () => {
    isNewChat.current = true;
    dispatch({ type: "SET_PREV_PROMPT", payload: [] });
    dispatch({ type: "SET_RESULT", payload: [] });
    dispatch({ type: "SET_LOADING", payload: false });
    dispatch({ type: "SET_SHOW_RESULT", payload: false });
    dispatch({ type: "CLEAR_CANCELLATION_STATES" });
  };

  const stopGeneration = () => {
    if (currPauseId.current) {
      dispatch({
        type: "SET_CANCELLATION_STATE",
        payload: { id: currPauseId.current, isCancelled: true },
      });
    }
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
