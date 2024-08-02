import "../../styles/Sidebar.css";

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

export default HelpDialog;
