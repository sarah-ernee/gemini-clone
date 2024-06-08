import PropTypes from "prop-types";

import "./Main.css";
import { assets } from "../../assets/assets";

const Result = ({ recentPrompt, resultData }) => {
  return (
    <div className="result">
      <div className="result-title">
        <img src={assets.user_icon} alt="" />
        <p>{recentPrompt}</p>
      </div>

      <div className="result-data">
        <img src={assets.gemini_icon} alt="" />
        <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
      </div>
    </div>
  );
};

Result.propTypes = {
  recentPrompt: PropTypes.string.isRequired,
  resultData: PropTypes.string.isRequired,
};

export default Result;
