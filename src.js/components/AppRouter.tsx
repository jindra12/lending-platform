import * as React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { LoanLimitRequestList } from "./lists/LoanLimitRequestList";
import { LoanOfferList } from "./lists/LoanOfferList";
import { IssueLoan } from "./forms/IssueLoan";
import { Layout } from "./Layout";
import { LoanSearch } from "./forms/LoanSearch";
import { ContextProvider } from "./context";


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
            <ContextProvider>
                <HashRouter>
                    <Layout>
                        {(account) => (
                            <Routes>
                                <Route
                                    path="/"
                                    Component={() => (
                                        <LoanSearch self={account.address} />
                                    )}
                                />
                                <Route
                                    path="/requests"
                                    Component={() => (
                                        <LoanLimitRequestList />
                                    )}
                                />
                                <Route
                                    path="/offers"
                                    Component={() => (
                                        <LoanOfferList self={account.address} />
                                    )}
                                />
                                <Route
                                    path="/issue-loan"
                                    Component={() => (
                                        <IssueLoan />
                                    )}
                                />
                            </Routes>
                        )}
                    </Layout>
                </HashRouter>
            </ContextProvider>
        </QueryClientProvider>
    );
};
