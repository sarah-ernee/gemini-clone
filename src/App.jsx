import Main from "./components/Main/Main.jsx";
import Sidebar from "./components/Sidebar/Sidebar";
import "./styles/AppContext.css";

const App = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <Main />
    </div>
  );
};

export default App;
