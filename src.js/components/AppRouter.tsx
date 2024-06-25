import * as React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

export const AppRouter: React.FunctionComponent = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" />
                <Route path="/limit">
                    <Route path="/request" />
                    <Route path="/requests" />
                    <Route path="/issue/:borrower" />
                </Route>
                <Route path="/search" />
                <Route path="/issue-loan" />
            </Routes>
        </HashRouter>
    );
};