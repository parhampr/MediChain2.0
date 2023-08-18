import "./index.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { store } from "./app/store";
import { initializeThemeMode } from "./features/theme/themeSlice";
import { Provider } from "react-redux";

store.dispatch(initializeThemeMode());
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
