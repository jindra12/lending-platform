import * as React from "react";
import { FormInstance } from "antd";

import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { CoinDisplay } from "./CoinDisplay";

export interface CoinHintProps {
    name: string | (string | number)[];
    form: FormInstance<LendingPlatFormStructs.LoanOfferSearchStruct>
}

export const CoinHint: React.FunctionComponent<CoinHintProps> = (props) => {
    const address: string = props.form.getFieldValue(props.name);
    return address ? <CoinDisplay address={address} /> : undefined;
};
