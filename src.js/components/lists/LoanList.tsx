import * as React from "react";
import { Alert, Divider, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLoans } from "../context";
import { LoanDetail } from "../views/LoanDetail";

export interface LoanListProps {
    self: string;
}

export const LoanList: React.FunctionComponent<LoanListProps> = (props) => {
    const [search, setSearch] = React.useState<{
        borrower?: string;
        lender?: string;
    }>({
        borrower: props.self,
    });

    const loans = useLoans(search.borrower);

    if (loans.isFetching) {
        return <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    }

    if (loans.isError) {
        return (
            <Alert
                message="Could not fetch your loans"
                type="error"
            />
        );
    }

    if (loans.data) {
        return loans.data.map((loan, i) => {
            return (
                <React.Fragment key={i}>
                    <LoanDetail address={loan.address} self={props.self} />
                    <Divider />
                </React.Fragment>
            )
        })
    }

    return <></>;
};
