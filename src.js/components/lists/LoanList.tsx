import * as React from "react";
import { Alert, Divider, Pagination, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLoans } from "../context";
import { LoanDetail } from "../views/LoanDetail";

export interface LoanListProps {
    borrower?: string;
    lender?: string;
    self: string;
}

export const LoanList: React.FunctionComponent<LoanListProps> = (props) => {
    const loans = useLoans(props.borrower, props.lender);
    const [page, setPage] = React.useState(1);
    const [size, setSize] = React.useState(10);

    if (loans.isFetching) {
        return (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        );
    }

    if (loans.isError) {
        return <Alert message="Could not fetch your loans" type="error" />;
    }

    if (loans.data) {
        if (loans.data.length === 0) {
            return (
                <Alert type="info" message="No loans found" />
            );
        }
        return (
            <>
                {loans.data.slice((page - 1) * size, page * size).map((loan, i) => {
                    return (
                        <React.Fragment key={i}>
                            <LoanDetail address={loan.loan} self={props.self} onFinished={() => {
                                loans.remove();
                                loans.refetch();
                                setPage(1);
                            }} />
                            <Divider />
                        </React.Fragment>
                    );
                })}
                <Pagination
                    showSizeChanger
                    onShowSizeChange={(_, size) => {
                        setPage(1);
                        setSize(size);
                    }}
                    onChange={(page) => {
                        setPage(page);
                    }}
                    defaultCurrent={page}
                    total={loans.data.length}
                />
            </>
        );
    }

    return <></>;
};
