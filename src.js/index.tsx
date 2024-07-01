import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { AppRouter } from "./components/AppRouter";

const root = document.querySelector("#root");

ReactDOM.createRoot(root!).render(<AppRouter />);