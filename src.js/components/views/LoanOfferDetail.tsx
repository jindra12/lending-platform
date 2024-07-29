import * as React from "react";
import { Collapse, Descriptions, Space } from "antd";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { CoinDisplay } from "../utils/CoinDisplay";
import { translateLoanOffer } from "../../utils";
import { AcceptLoan } from "../buttons/AcceptLoan";
import { RemoveLoan } from "../buttons/RemoveLoan";

export interface LoanOfferDetailProps {
    offer: LendingPlatFormStructs.LoanOfferStructOutput;
    self: string;
    onFinish: () => void;
}

export const LoanOfferDetail: React.FunctionComponent<LoanOfferDetailProps> = (props) => {
    const offerObject = React.useMemo(
        () => translateLoanOffer(props.offer),
        [props.offer]
    );

    const currency = offerObject.isEth ? (
        <>Ether (wei)</>
    ) : (
        <CoinDisplay address={offerObject.coin} tooltip />
    );

    return (
        <>
            <Descriptions title="Loan offer info">
                <Descriptions.Item label="Lent amount">
                    {offerObject.loanData.amount}&nbsp;{currency}
                </Descriptions.Item>
                <Descriptions.Item label="To be paid">
                    {offerObject.loanData.toBePaid}&nbsp;{currency}
                </Descriptions.Item>
                <Descriptions.Item label="Single payment">
                    {offerObject.loanData.singlePayment}&nbsp;{currency}
                </Descriptions.Item>
                <Descriptions.Item label="Lender wallet">
                    {offerObject.from}
                </Descriptions.Item>
                <Descriptions.Item label="Loan ID">{offerObject.id}</Descriptions.Item>
                <Descriptions.Item label="Collateral">
                    {offerObject.loanData.collateral.value}&nbsp;
                    {offerObject.loanData.collateral.isCollateralEth ? (
                        <>Ether (wei)</>
                    ) : (
                        <CoinDisplay
                            address={offerObject.loanData.collateral.collateralCoin}
                            balanceOf={props.self}
                            tooltip
                        />
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="actions">
                    <Space>
                        {props.self === offerObject.from ? (
                            <RemoveLoan onFinish={props.onFinish} offer={props.offer} />
                        ) : (
                            <AcceptLoan onFinish={props.onFinish} offer={props.offer} />
                        )}
                    </Space>
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
                                        {offerObject.loanData.interval}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Days until default after last payment">
                                        {offerObject.loanData.defaultLimit}
                                    </Descriptions.Item>
                                </Descriptions>
                            </>
                        ),
                    },
                ]}
            />
        </>
    );
};
