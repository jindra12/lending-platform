import * as React from "react";
import { useCoinName } from "../context";

export interface CoinDisplayProps {
    address: string;
}

export const CoinDisplay: React.FunctionComponent<CoinDisplayProps> = (props) => {
    const coin = useCoinName(props.address);
    if (coin.isFetching) {
        return "Loading coin name...";
    }
    if (coin.isError) {
        return "Coin not found";
    }
    if (coin.data) {
        return "Coin data";
    }
    return "Provide address for coin";
};
