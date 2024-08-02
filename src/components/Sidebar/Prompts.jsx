import "../../styles/Sidebar.css";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const Prompts = ({ setShowResult }) => {
  const { state, updateState } = useContext(AppContext);

  const loadPrompt = async (prompt) => {
    updateState({ recentPrompt: prompt });
    setShowResult(true);
  };

  return (
    <div className="recent">
      <p className="recent-title">Recent</p>
      {state.sidebarPrompt.map((item, index) => {
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

export default Prompts;
