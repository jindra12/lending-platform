import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "error-polyfill";
import { ErrorBoundary } from "react-error-boundary";

import { AppRouter } from "./components/AppRouter";
import { ErrorPage } from "./components/views/ErrorPage";
import { WalletError } from "./components/context";

const root = document.querySelector("#root");

ReactDOM.createRoot(root!).render(
    <ErrorBoundary
        FallbackComponent={({ error }) => {
            console.error(error);
            return <ErrorPage isWalletError={error instanceof WalletError} />;
        }}
    >
        <AppRouter />
    </ErrorBoundary>
);
