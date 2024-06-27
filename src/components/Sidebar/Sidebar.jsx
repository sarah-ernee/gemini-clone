import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { useState, useContext } from "react";
import PropTypes from "prop-types";

import { Context } from "../../context/Context";

const HelpDialog = ({ show, handleClose, setShowConfirm }) => {
  if (!show) return null;

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>About Gemini</h2>
          <button onClick={handleClose} className="close-button">
            X
          </button>
        </div>
        <div className="dialog-body">
          <p className="dialog-text">
            Gemini is an advanced AI language model designed to assist users
            with a variety of tasks, including answering questions, providing
            recommendations, generating content, and more. Powered by
            cutting-edge machine learning algorithms, Gemini is capable of
            understanding and processing natural language to deliver accurate
            and relevant information.
          </p>
          <p className="dialog-text">
            This is a crude clone of an assistive chatbot utilizing Gemini
            model. While Gemini strives to provide accurate and up-to-date
            information, it may not always be correct or complete. Users should
            verify information from reliable sources, especially for critical
            decisions.
          </p>
          <hr />
          <div className="settings">
            <p>Archive all chats</p>
            <button
              className="settings-button"
              onClick={() => setShowConfirm(true)}
            >
              Archive All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

HelpDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  setShowConfirm: PropTypes.func.isRequired,
};

const ConfirmDialog = ({
  showConfirm,
  setShowConfirm,
  setShowHelp,
  setPrevPrompt,
}) => {
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
              setPrevPrompt([]);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  setPrevPrompt: PropTypes.func.isRequired,
  showConfirm: PropTypes.bool.isRequired,
  setShowConfirm: PropTypes.func.isRequired,
  setShowHelp: PropTypes.func.isRequired,
};

const Prompts = ({ setShowResult, sidebarPrompt, setRecentPrompt }) => {
  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    // await onSent(prompt);
    setShowResult(true);
  };

  return (
    <div className="recent">
      <p className="recent-title">Recent</p>
      {sidebarPrompt.map((item, index) => {
        return (
          <div
            onClick={() => loadPrompt(item)}
            className="recent-entry"
            key={index}
          >
            <img src={assets.message_icon} />
            <p>{item.slice(0, 18)}...</p>
          </div>
        );
      })}
    </div>
  );
};

Prompts.propTypes = {
  setShowResult: PropTypes.bool.isRequired,
  sidebarPrompt: PropTypes.array.isRequired,
  setRecentPrompt: PropTypes.func.isRequired,
};

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { newChat, sidebarPrompt, setRecentPrompt, setPrevPrompt } =
    useContext(Context);

  return (
    <div className="sidebar">
      <div className="top">
        <img
          className="menu"
          src={assets.menu_icon}
          onClick={() => setExtended((prev) => !prev)}
        />
        <div
          className="new-chat"
          onClick={() => {
            newChat();
            setExtended(false);
          }}
        >
          <img src={assets.plus_icon} />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <Prompts
            setShowResult={true}
            sidebarPrompt={sidebarPrompt}
            setRecentPrompt={setRecentPrompt}
          />
        ) : null}
      </div>

      <div className="bottom">
        <div
          className="bottom-item recent-entry"
          onClick={() => {
            setExtended((prev) => !prev);
            setShowHelp(true);
            setShowConfirm(false);
          }}
        >
          <img src={assets.question_icon} />
          {extended ? <p>Help</p> : null}
        </div>
      </div>

      <HelpDialog
        show={showHelp && !showConfirm}
        setShowConfirm={setShowConfirm}
        handleClose={() => setShowHelp(false)}
      />
      <ConfirmDialog
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        setShowHelp={setShowHelp}
        setPrevPrompt={setPrevPrompt}
      />
    </div>
  );
};

export default Sidebar;
