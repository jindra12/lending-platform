import * as React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Layout } from "./Layout";
import { ContextProvider } from "./context";
import { RequestLendingLimit } from "./forms/RequestLendingLimit";

const LoanSearch = React.lazy(async () => ({
    default: (
        await import(/* webpackChunkName: "LoanSearch" */ "./forms/LoanSearch")
    ).LoanSearch,
}));
const LoanLimitRequestList = React.lazy(async () => ({
    default: (
        await import(
      /* webpackChunkName: "LoanLimitRequestList" */ "./lists/LoanLimitRequestList"
        )
    ).LoanLimitRequestList,
}));
const LoanOfferList = React.lazy(async () => ({
    default: (
        await import(
      /* webpackChunkName: "LoanOfferList" */ "./lists/LoanOfferList"
        )
    ).LoanOfferList,
}));
const IssueLoan = React.lazy(async () => ({
    default: (
        await import(/* webpackChunkName: "IssueLoan" */ "./forms/IssueLoan")
    ).IssueLoan,
}));

export const AppRouter: React.FunctionComponent = () => {
    const spin = <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />;
    const suspense = (component: React.ReactNode) => (
        <React.Suspense fallback={spin}>
            {component}
        </React.Suspense>
    );

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
                                    Component={() => suspense(<LoanSearch self={account.address} />)}
                                />
                                <Route
                                    path="/requests"
                                    Component={() => suspense(<LoanLimitRequestList self={account.address} />)}
                                />
                                <Route
                                    path="/request"
                                    Component={() => suspense(<RequestLendingLimit />)}
                                />
                                <Route
                                    path="/offers"
                                    Component={() => suspense(<LoanOfferList self={account.address} />)}
                                />
                                <Route path="/issue-loan" Component={() => suspense(<IssueLoan self={account.address} />)} />
                            </Routes>
                        )}
                    </Layout>
                </HashRouter>
            </ContextProvider>
        </QueryClientProvider>
    );
};
