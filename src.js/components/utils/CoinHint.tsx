import * as React from "react";
import { Form, FormInstance } from "antd";

import { CoinDisplay } from "./CoinDisplay";

export interface CoinHintProps {
    name: string | (string | number)[];
    form: FormInstance;
    balanceOf?: string;
    defaultText?: string;
}

export const CoinHint: React.FunctionComponent<CoinHintProps> = (props) => {
    const address: string = Form.useWatch(props.name, props.form);
    return address ? <CoinDisplay address={address} balanceOf={props.balanceOf} /> : <>{props.defaultText}</>;
};
