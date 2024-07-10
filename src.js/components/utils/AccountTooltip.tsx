import * as React from "react";
import { Tooltip } from "antd";
import { useBalance } from "../context";

export interface AccountTooltipProps {
    address: string;
}

export const AccountTooltip: React.FunctionComponent<AccountTooltipProps> = (
    props
) => {
    const balance = useBalance(props.address);

    if (typeof balance.data !== "undefined") {
        return (
            <Tooltip
                placement="bottom"
                title={`${props.address}, balance: ${balance.data?.toString() || "0"}`}
                arrow={false}
            >
                {props.address.slice(0, 5)}&hellip;
            </Tooltip>
        );
    }

    return (
        <Tooltip
            placement="bottom"
            title={props.address}
            arrow={false}
        >
            {props.address.slice(0, 5)}&hellip;
        </Tooltip>
    );
};
