import * as React from "react";
import { useCoinName } from "../context";

export interface CoinDisplayProps {
    address: string;
    balanceOf?: string;
}

export const CoinDisplay: React.FunctionComponent<CoinDisplayProps> = (props) => {
    const coin = useCoinName(props.address, props.balanceOf);
    if (coin.isFetching) {
        return `Loading ${props.address.slice(0, 5)}...`;
    }
    if (coin.isError) {
        return `Error: ${props.address}`;
    }
    if (coin.data) {
        return coin.data;
    }
    return props.address;
};
