import * as React from "react";
import { Tooltip } from "antd";
import { useCoinName } from "../context";

export interface CoinDisplayProps {
    address: string;
    balanceOf?: string;
    tooltip?: boolean;
}

export const CoinDisplay: React.FunctionComponent<CoinDisplayProps> = (
    props
) => {
    const coin = useCoinName(props.address, props.balanceOf);
    if (coin.isFetching) {
        return `Loading ${props.address.slice(0, 5)}...`;
    }
    if (coin.isError) {
        return `Error: ${props.address}`;
    }
    if (coin.data) {
        if (props.tooltip) {
            return (
                <Tooltip placement="top" title={props.address} arrow={false}>
                    {coin.data}
                </Tooltip>
            );
        } else {
            return coin.data;
        }
    }
    return props.address;
};
