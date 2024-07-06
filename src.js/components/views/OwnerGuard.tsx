import * as React from "react";
import { Alert, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useIsOwner } from "../context";

export interface OwnerGuardProps {
    self: string;
    showError?: boolean;
    children: (isOwner: boolean) => void;
}

export const OwnerGuard: React.FunctionComponent<OwnerGuardProps> = (props) => {
    const isOwner = useIsOwner(props.self);
    if (isOwner.isFetching) {
        return (
            <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48, marginLeft: "10px", }} spin />}
            />
        );
    }

    if (props.showError && (isOwner.isError || isOwner.data === false)) {
        return <Alert message="Could not verify contract ownership" type="error" />;
    }

    if (typeof isOwner.data === "boolean") {
        return <>{props.children(isOwner.data)}</>;
    }

    return <></>;
};
