import PropTypes from "prop-types";

import "./Main.css";
import { assets } from "../../assets/assets";

const Result = ({ recentPrompt, resultData, loading }) => {
  return (
    <div className="result">
      <div className="result-title">
        <img src={assets.user_icon} />
        <p>{recentPrompt}</p>
      </div>

      <div className="result-data">
        <img src={assets.gemini_icon} />
        {loading ? (
          <>
            <div className="loader">
              <hr />
              <hr />
              <hr />
            </div>
          </>
        ) : (
          <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
        )}
      </div>
    </div>
  );
};

Result.propTypes = {
  recentPrompt: PropTypes.string.isRequired,
  resultData: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Result;
