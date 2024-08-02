import { useState, useCallback, useRef, useEffect } from "react";
import run from "../services/geminiService";
import { formatResponse } from "../utils/formatResponse";

export const useGemini = () => {
  const [state, setState] = useState({
    showResult: false,
    loading: false,
    isTyping: false,
    input: "",
    recentPrompt: "",
    resultData: [],
    prevPrompt: [],
    sidebarPrompt: [],
    pauses: {},
  });

  const isNewChat = useRef(false);
  const currPauseId = useRef(null);
  const pauseSnapshot = useRef(state.pauses);

  useEffect(() => {
    pauseSnapshot.current = state.pauses;
  }, [state.pauses]);

  useEffect(() => {
    console.log("Updated resultData: ", state.resultData);
  }, [state.resultData]);

  const updateState = useCallback((updates) => {
    setState((prevState) => ({
      ...prevState,
      ...updates,
    }));
  }, []);

  const typingEffect = useCallback(
    (wordIndex, nextWord, totalWords, responseIndex, pauseId) => {
      if (wordIndex === 0) {
        updateState({ isTyping: true });
      }

      setTimeout(() => {
        if (!pauseSnapshot.current[pauseId]) {
          updateState((prevState) => {
            const newData = [...prevState.resultData];
            newData[responseIndex] += nextWord;
            return { resultData: newData };
          });

          if (wordIndex === totalWords - 1) {
            updateState({
              isTyping: false,
              pauses: {
                ...pauseSnapshot.current,
                [pauseId]: true,
              },
            });
          }
        }
      }, 75 * wordIndex);
    },
    [updateState]
  );

  const handleResponse = useCallback(
    async (response, pauseId) => {
      if (pauseSnapshot.current[pauseId]) return;

      const formattedResponse = formatResponse(response);
      let newResponseArray = formattedResponse.split(" ");

      for (let i = 0; i < newResponseArray.length; i++) {
        const nextWord = newResponseArray[i];
        await typingEffect(
          i,
          nextWord + " ",
          newResponseArray.length,
          state.resultData.length,
          pauseId
        );
      }

      updateState((prevState) => ({
        resultData: [...prevState.resultData, ""],
      }));
    },
    [state.resultData.length, typingEffect, updateState]
  );

  const onSent = useCallback(
    async (prompt) => {
      updateState({ loading: true, showResult: true });

      // Cancel all previous responses
      Object.keys(pauseSnapshot.current).forEach((id) => {
        updateState({
          pauses: {
            ...state.pauses,
            [id]: true,
          },
        });
      });

      // Register new pauseId
      const pauseId =
        Date.now().toString(36) + Math.random().toString(36).substr(2);
      currPauseId.current = pauseId;
      updateState({
        pauses: {
          ...state.pauses,
          [pauseId]: false,
        },
      });

      let response;
      if (prompt) {
        updateState({ recentPrompt: prompt });
        response = await run(prompt);
        await handleResponse(response, pauseId);
        return;
      }

      if (state.sidebarPrompt.length === 0) {
        isNewChat.current = true;
        updateState({ sidebarPrompt: [state.input] });
      } else if (isNewChat.current && state.sidebarPrompt.length > 0) {
        updateState((prevState) => ({
          sidebarPrompt: [...prevState.sidebarPrompt, state.input],
        }));
      }

      updateState((prevState) => ({
        prevPrompt: [...prevState.prevPrompt, state.input],
        recentPrompt: state.input,
      }));

      response = await run(state.input);
      await handleResponse(response, pauseId);

      updateState({ input: "", loading: false });
      isNewChat.current = false;
    },
    [
      updateState,
      state.pauses,
      state.sidebarPrompt.length,
      state.input,
      handleResponse,
    ]
  );

  const newChat = useCallback(() => {
    isNewChat.current = true;
    updateState({
      prevPrompt: [],
      resultData: [],
      loading: false,
      showResult: false,
      pauses: {},
    });
  }, [updateState]);

  const stopGeneration = useCallback(() => {
    if (currPauseId.current) {
      updateState({
        pauses: {
          ...state.pauses,
          [currPauseId.current]: true,
        },
        loading: false,
        isTyping: false,
      });
    }
  }, [state.pauses, updateState]);

  return {
    state,
    onSent,
    newChat,
    stopGeneration,
    updateState,
  };
};
