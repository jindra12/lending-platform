import * as React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { LoanList } from "./lists/LoanList";
import { LoanLimitRequestList } from "./lists/LoanLimitRequestList";
import { LoanOfferList } from "./lists/LoanOfferList";
import { IssueLoan } from "./forms/IssueLoan";
import { QueryClient, QueryClientProvider } from "react-query";
import { Layout } from "./Layout";

export const AppRouter: React.FunctionComponent = () => {
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
                                <LoanList />
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
                                <LoanOfferList />
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
