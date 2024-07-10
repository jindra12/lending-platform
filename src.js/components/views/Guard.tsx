import * as React from "react";
import { UseQueryResult } from "react-query";
import { Alert, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export interface GuardProps {
    hook: (address: string) => UseQueryResult<boolean>;
    address: string;
}

export const Guard: React.FunctionComponent<React.PropsWithChildren<GuardProps>> = (props) => {
    const result = props.hook(props.address);
    if (result.isFetching) {
        return (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        );
    }

    if (result.isError) {
        return <Alert message="Could not fetch signer for this wallet" type="error" />;
    }

    if (result.data) {
        return <>{props.children}</>
    }

    return <></>;
};