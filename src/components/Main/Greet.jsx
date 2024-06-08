import { assets } from "../../assets/assets";
import "./Main.css";

const Greet = () => {
  return (
    <div>
      <div className="greet">
        <p>
          <span>Hello, Dev.</span>
        </p>
        <p>How can I help you today?</p>
      </div>
      <div className="cards">
        <div className="card">
          <p>Suggest beautiful places to see on an upcoming trip</p>
          <img src={assets.compass_icon} alt="" />
        </div>
        <div className="card">
          <p>Briefly summarize this concept: urban planning</p>
          <img src={assets.bulb_icon} alt="" />
        </div>
        <div className="card">
          <p>Brainstorm team bonding activities for our work retreat</p>
          <img src={assets.message_icon} alt="" />
        </div>
        <div className="card">
          <p>Improve the readability of the following code</p>
          <img src={assets.code_icon} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Greet;
