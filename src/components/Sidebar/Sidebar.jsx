import "../../styles/Sidebar.css";
import { assets } from "../../assets/assets";
import { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";

import HelpDialog from "./HelpDialog";
import ConfirmDialog from "./ConfirmDialog";
import Prompts from "./Prompts";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { newChat } = useContext(AppContext);

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
        {extended ? <Prompts setShowResult={true} /> : null}
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
      />
    </div>
  );
};

export default Sidebar;
