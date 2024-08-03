import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "error-polyfill";

import { AppRouter } from "./components/AppRouter";
import { ErrorBoundary } from "./components/views/ErrorBoundary";
import { ErrorPage } from "./components/views/ErrorPage";

const root = document.querySelector("#root");

if ((window as any).ethereum) {
    ReactDOM.createRoot(root!).render(
        <ErrorBoundary>
            <AppRouter />
        </ErrorBoundary>
    );
} else {
    ReactDOM.createRoot(root!).render(
        <ErrorPage isWalletError />
    );
}
