import * as React from "react";
import { useLendingRequests } from "../context";

export interface LoanLimitRequestListProps {

}

export const LoanLimitRequestList: React.FunctionComponent<LoanLimitRequestListProps> = (props) => {
    const requests = useLendingRequests(20);
    return (

    );
};