import * as React from "react";
import { Alert, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useSetSigner } from "../context";

export interface SignerGuardProps {
    self: string;
}

export const SignerGuard: React.FunctionComponent<React.PropsWithChildren<SignerGuardProps>> = (props) => {
    const setSigner = useSetSigner(props.self);
    if (setSigner.isFetching) {
        return (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        );
    }

    if (setSigner.isError) {
        return <Alert message="Could not fetch signer for this wallet" type="error" />;
    }

    if (setSigner.data) {
        return <>{props.children}</>
    }

    return <></>
};