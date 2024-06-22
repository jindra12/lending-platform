import * as React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

export const AppRouter: React.FunctionComponent = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" />
                <Route path="/loan-detail/:id">
                    <Route path="/early-repayment">
                        <Route path="/issue" />
                        <Route path="/accept" />
                        <Route path="/reject" />
                    </Route>
                    <Route path="/default" />
                    <Route path="/payment" />
                    <Route path="/remove" />
                </Route>
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