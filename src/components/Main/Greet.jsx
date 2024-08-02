import "../../styles/Main.css";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const Greet = () => {
  const { updateState } = useContext(AppContext);
  const cardsData = [
    {
      prompt: "Suggest beautiful places to see on an upcoming trip",
      icon: assets.compass_icon,
    },
    {
      prompt: "Briefly summarize this concept: urban planning",
      icon: assets.bulb_icon,
    },
    {
      prompt: "Brainstorm team bonding activities for our work retreat",
      icon: assets.message_icon,
    },
    { prompt: "Improve readability of code", icon: assets.code_icon },
  ];

  return (
    <div>
      <div className="greet">
        <p>
          <span>Hello, Dev.</span>
        </p>
        <p>How can I help you today?</p>
      </div>
      <div className="cards">
        {cardsData.map((card, index) => (
          <div
            className="card"
            key={index}
            onClick={() => updateState({ input: card.prompt })}
          >
            <p>{card.prompt}</p>
            <img src={card.icon} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Greet;
