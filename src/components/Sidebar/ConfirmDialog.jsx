import "../../styles/Sidebar.css";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const ConfirmDialog = ({ showConfirm, setShowConfirm, setShowHelp }) => {
  const { updateState } = useContext(AppContext);
  if (!showConfirm) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <div className="dialog-body">
          <h2>Clear your chat history - are you sure?</h2>
          <br />
          <p className="subtitle">
            This action will remove all past prompts sent to Gemini.
          </p>
        </div>

        <div className="action">
          <button
            className="cancel-settings-button"
            onClick={() => {
              setShowConfirm(false);
              setShowHelp(true);
            }}
          >
            Cancel
          </button>
          <button
            className="settings-button"
            onClick={() => {
              setShowConfirm(false);
              setShowHelp(false);
              updateState({ prevPrompt: [] });
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
