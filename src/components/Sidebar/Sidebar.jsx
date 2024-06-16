import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { useState, useContext } from "react";
import PropTypes from "prop-types";

import { Context } from "../../context/Context";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const { newChat, onSent, prevPrompt, setRecentPrompt } = useContext(Context);

  const Prompts = ({ onSent, prevPrompt, setRecentPrompt }) => {
    const loadPrompt = async (prompt) => {
      setRecentPrompt(prompt);
      await onSent(prompt);
    };

    return (
      <div className="recent">
        <p className="recent-title">Recent</p>
        {prevPrompt.map((item, index) => {
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
    onSent: PropTypes.func.isRequired,
    prevPrompt: PropTypes.array.isRequired,
    setRecentPrompt: PropTypes.func.isRequired,
  };

  return (
    <div className="sidebar">
      <div className="top">
        <img
          className="menu"
          src={assets.menu_icon}
          onClick={() => setExtended((prev) => !prev)}
        />
        <div className="new-chat" onClick={() => newChat()}>
          <img src={assets.plus_icon} />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <Prompts
            onSent={onSent}
            prevPrompt={prevPrompt}
            setRecentPrompt={setRecentPrompt}
          />
        ) : null}
      </div>

      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} />
          {extended ? <p>Help</p> : null}
        </div>

        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} />
          {extended ? <p>Activity</p> : null}
        </div>

        <div className="bottom-item recent-entry">
          <img src={assets.setting_icon} />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
