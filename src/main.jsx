import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"; // Ensure styles are applied

const container = document.getElementById("root");

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("❌ Root element not found! Make sure your HTML has a <div id='root'></div>.");
}
