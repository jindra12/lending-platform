import * as React from "react";
import { Alert, Collapse, Descriptions, Space, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLoanDetail } from "../context";
import { ApproveEarlyRepayment } from "../buttons/ApproveEarlyRepayment";
import { Payment } from "../buttons/Payment";
import { Default } from "../buttons/Default";
import { RejectEarlyRepayment } from "../buttons/RejectEarlyRepayment";
import { RequestEarlyRepayment } from "../forms/RequestEarlyRepayment";
import { CoinDisplay } from "../utils/CoinDisplay";

export interface LoanDetailProps {
    address: string;
    self: string;
}

export const LoanDetail: React.FunctionComponent<LoanDetailProps> = (props) => {
    const detail = useLoanDetail(props.address);

    if (detail.isFetching) {
        return (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        );
    }

    if (detail.isError) {
        return <Alert message="Could not fetch loan detail" type="error" />;
    }

    if (detail.data) {
        const currency = detail.data.isEth ? (
            <>Ether (wei)</>
        ) : (
            <CoinDisplay address={detail.data.coin} />
        );
    
        const collateralCurrency = detail.data.isCollateralEth ? (
            <>Ether (wei)</>
        ) : (
            <CoinDisplay address={detail.data.collateralCoin} />
        );

        return (
            <>
                <Descriptions title={`Loan: ${props.address}`}>
                    {props.self !== detail.data.borrower && (
                        <Descriptions.Item label="Borrower address">
                            {detail.data.borrower}
                        </Descriptions.Item>
                    )}
                    {props.self !== detail.data.lender && (
                        <Descriptions.Item label="Lender address">
                            {detail.data.lender}
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Loan state">
                        <strong>
                            {(() => {
                                if (detail.data.inDefault) {
                                    return "Defaulted";
                                }
                                if (detail.data.paidEarly) {
                                    return "Paid early";
                                }
                                if (detail.data.remaining !== "0") {
                                    return "In progress";
                                }
                                if (detail.data.requestPaidEarly) {
                                    return (
                                        <>
                                            Requesting early repayment {detail.data.requestPaidEarlyAmount} {currency}
                                        </>
                                    );
                                }
                                return "Paid off";
                            })()}
                        </strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Owed">
                        {detail.data.remaining}
                    </Descriptions.Item>
                    <Descriptions.Item label="Single payment">
                        {detail.data.singlePayment}
                    </Descriptions.Item>
                </Descriptions>
                <Collapse
                    collapsible="header"
                    items={[
                        {
                            key: "details",
                            label: "Loan details",
                            children: (
                                <>
                                    <Descriptions>
                                        <Descriptions.Item label="Payment intervals">
                                            {detail.data.interval}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Last payment date">
                                            {detail.data.lastPayment}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Days until default after last payment">
                                            {detail.data.defaultLimit}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Collateral">
                                            {detail.data.collateral} {collateralCurrency}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </>
                            ),
                        },
                    ]}
                />
                <Collapse
                    collapsible="header"
                    defaultActiveKey="actions"
                    items={[
                        {
                            key: "actions",
                            label: "Loan actions",
                            children: (
                                <Space>
                                    {props.self === detail.data.borrower && (
                                        <>
                                            <Payment loan={props.address} />
                                            <RequestEarlyRepayment loan={props.address} currency={currency} />
                                        </>  
                                    )}
                                    {props.self === detail.data.lender && (
                                        <>
                                            {detail.data.requestPaidEarly && (
                                                <>
                                                    <ApproveEarlyRepayment loan={props.address} />
                                                    <RejectEarlyRepayment loan={props.address} />
                                                </>
                                            )}
                                            <Default loan={props.address} />
                                        </>  
                                    )}
                                </Space>
                            ),
                        },
                    ]}
                />
            </>
        );
    }

    return <></>;
};
