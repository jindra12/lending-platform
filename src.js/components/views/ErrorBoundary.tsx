import * as React from "react";

import { ErrorPage } from "./ErrorPage";

export class ErrorBoundary extends React.Component<React.PropsWithChildren> {
    constructor(props: React.PropsWithChildren) {
        super(props);
    }

    static getDerivedStateFromError(error: Error) {
        return error;
    }

    componentDidCatch(error: any) {
        this.setState(error);
    }

    render() {
        if (this.state) {
            return <ErrorPage isWalletError={false} />
        }

        return this.props.children;
    }
}