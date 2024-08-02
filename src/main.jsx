// import ReactDOM from "react-dom/client";
// import App from "./App.jsx";
// import "./index.css";
// import Context from "./context/AppContext.jsx";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <Context>
//     <App />
//   </Context>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import { AppProvider } from "./context/AppContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
