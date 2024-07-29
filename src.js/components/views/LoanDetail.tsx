import * as React from "react";
import { Alert, Col, Descriptions, Row, Spin, Tooltip } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import {
    useCanDefault,
    useCanDoEarlyRepayment,
    useCanDoPayment,
    useCanRequestEarlyRepayment,
    useLoanDetail,
} from "../context";
import { ApproveEarlyRepayment } from "../buttons/ApproveEarlyRepayment";
import { Payment } from "../buttons/Payment";
import { Default } from "../buttons/Default";
import { RejectEarlyRepayment } from "../buttons/RejectEarlyRepayment";
import { RequestEarlyRepayment } from "../forms/RequestEarlyRepayment";
import { CoinDisplay } from "../utils/CoinDisplay";
import { Guard } from "./Guard";
import { colProps, rowProps, smallColProps } from "../../utils";

export interface LoanDetailProps {
    address: string;
    self: string;
    onFinished: () => void;
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
            <Descriptions
                title={`Loan: ${props.address}`}
                column={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 2 }}
            >
                {props.self !== detail.data.borrower && (
                    <Descriptions.Item label="Borrower address">
                        <Tooltip placement="top" title={detail.data.borrower} arrow={false}>
                            {detail.data.borrower.slice(0, 5)}&hellip;
                        </Tooltip>
                    </Descriptions.Item>
                )}
                {props.self !== detail.data.lender && (
                    <Descriptions.Item label="Lender address">
                        <Tooltip placement="top" title={detail.data.lender} arrow={false}>
                            {detail.data.lender.slice(0, 5)}&hellip;
                        </Tooltip>
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
                                        Requesting early repayment{" "}
                                        {detail.data.requestPaidEarlyAmount} {currency}
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
                <Descriptions.Item label="Payment intervals">
                    {detail.data.interval}
                </Descriptions.Item>
                <Descriptions.Item label="Last payment date">
                    {detail.data.lastPayment}
                </Descriptions.Item>
                <Descriptions.Item label="Defaults after">
                    {detail.data.defaultLimit}
                </Descriptions.Item>
                <Descriptions.Item label="Collateral">
                    {detail.data.collateral} {collateralCurrency}
                </Descriptions.Item>
                {props.self === detail.data.borrower && (
                    <Row {...rowProps}>
                        <Guard address={props.address} hook={useCanDoPayment}>
                            <Col {...smallColProps}>
                                <Payment loan={props.address} onFinished={props.onFinished} />
                            </Col>
                        </Guard>
                        <Guard
                            address={props.address}
                            hook={useCanRequestEarlyRepayment}
                        >
                            <Col {...smallColProps}>
                                <RequestEarlyRepayment
                                    loan={props.address}
                                    currency={currency}
                                    onFinished={props.onFinished}
                                />
                            </Col>
                        </Guard>
                        </Row>
                )}
                {props.self === detail.data.lender && (
                    <Row {...rowProps}>
                        <Guard address={props.address} hook={useCanDoEarlyRepayment}>
                            <Col {...colProps}>
                                <ApproveEarlyRepayment loan={props.address} onFinished={props.onFinished} />
                            </Col>
                            <Col {...colProps}>
                                <RejectEarlyRepayment loan={props.address} onFinished={props.onFinished} />
                            </Col>
                        </Guard>
                        <Guard address={props.address} hook={useCanDefault}>
                            <Col {...colProps}>
                                <Default loan={props.address} onFinished={props.onFinished} />
                            </Col>
                        </Guard>
                    </Row>
                )}
            </Descriptions>
        );
    }

    return <></>;
};
