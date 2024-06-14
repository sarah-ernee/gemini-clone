import { assets } from "../../assets/assets";
import PropTypes from "prop-types";
import { useContext } from "react";
import { Context } from "../../context/Context";

const Prompts = () => {
  const { onSent, prevPrompt, setRecentPrompt } = useContext(Context);

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
            <img src={assets.message_icon} alt="" />
            <p>{item.slice(0, 18)}...</p>
          </div>
        );
      })}
    </div>
  );
};

Prompts.propTypes = {
  prevPrompt: PropTypes.array.isRequired,
};

export default Prompts;
