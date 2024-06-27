import * as React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { LoanLimitRequestList } from "./lists/LoanLimitRequestList";
import { LoanOfferList } from "./lists/LoanOfferList";
import { IssueLoan } from "./forms/IssueLoan";
import { Layout } from "./Layout";
import { LoanSearch } from "./forms/LoanSearch";

export interface AppRouterProps {
    self: string;
}

export const AppRouter: React.FunctionComponent<AppRouterProps> = (props) => {
    return (
        <QueryClientProvider
            client={
                new QueryClient({
                    defaultOptions: {
                        queries: {
                            retry: 3,
                            retryDelay: 1000,
                        },
                        mutations: {
                            retry: 0,
                        },
                    },
                })
            }
        >
            <HashRouter>
                <Routes>
                    <Route
                        path="/"
                        Component={() => (
                            <Layout>
                                <LoanSearch self={props.self} />
                            </Layout>
                        )}
                    />
                    <Route
                        path="/requests"
                        Component={() => (
                            <Layout>
                                <LoanLimitRequestList />
                            </Layout>
                        )}
                    />
                    <Route
                        path="/offers"
                        Component={() => (
                            <Layout>
                                <LoanOfferList self={props.self} />
                            </Layout>
                        )}
                    />
                    <Route
                        path="/issue-loan"
                        Component={() => (
                            <Layout>
                                <IssueLoan />
                            </Layout>
                        )}
                    />
                </Routes>
            </HashRouter>
        </QueryClientProvider>
    );
};
