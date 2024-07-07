import { Rule } from "antd/es/form";
import { FormLoanIssuance, LoanDetails, LoanIssuance, LoanOfferStruct } from "./types";
import { LendingPlatFormStructs } from "./contracts/LendingPlatform.sol/LendingPlatformAbi";
import { Loan } from "./contracts/LendingPlatform.sol/LoanAbi";
import { ColProps, RowProps } from "antd";

export const convertLoanIssuanceToApi = (loanIssue: FormLoanIssuance): LoanIssuance => {
    switch (loanIssue.type!) {
        case "EthEth":
            return {
                type: "EthEth",
                amount: loanIssue.amount!,
                collateral: loanIssue.collateral!,
                defaultLimit: loanIssue.defaultLimit!,
                interval: loanIssue.interval!,
                singlePayment: loanIssue.singlePayment!,
                toBePaid: loanIssue.toBePaid!,
            };
        case "EthCoin":
            return {
                type: "EthCoin",
                amount: loanIssue.amount!,
                collateral: loanIssue.collateral!,
                defaultLimit: loanIssue.defaultLimit!,
                interval: loanIssue.interval!,
                singlePayment: loanIssue.singlePayment!,
                toBePaid: loanIssue.toBePaid!,
                collateralCoin: loanIssue.collateralCoin!,
            };
        case "CoinEth":
            return {
                type: "CoinEth",
                amount: loanIssue.amount!,
                collateral: loanIssue.collateral!,
                defaultLimit: loanIssue.defaultLimit!,
                interval: loanIssue.interval!,
                singlePayment: loanIssue.singlePayment!,
                toBePaid: loanIssue.toBePaid!,
                coin: loanIssue.coin!,
            };
        case "CoinCoin":
            return {
                type: "CoinCoin",
                amount: loanIssue.amount!,
                collateral: loanIssue.collateral!,
                defaultLimit: loanIssue.defaultLimit!,
                interval: loanIssue.interval!,
                singlePayment: loanIssue.singlePayment!,
                toBePaid: loanIssue.toBePaid!,
                coin: loanIssue.coin!,
                collateralCoin: loanIssue.collateralCoin!,
            };
    }
};

export const addressValidator: Rule = {
    pattern: /^0x[a-zA-Z-0-9]{40}$/,
    message: "Invalid address",
};

export const numberValidator: Rule = {
    pattern: /^[1-9][0-9]*$/,
    message: "Input a whole number",
};

export const dayInSeconds = 24 * 60 * 60;

export const translateLoanOffer = (offer: LendingPlatFormStructs.LoanOfferStructOutput): LoanOfferStruct => {
    return {
        coin: offer.coin,
        from: offer.from,
        id: offer.id.toString(),
        isEth: offer.isEth,
        loanData: {
            amount: offer.loanData.amount.toString(),
            collateral: {
                collateralCoin: offer.loanData.collateral.collateralCoin,
                isCollateralEth: offer.loanData.collateral.isCollateralEth,
                value: offer.loanData.collateral.value.toString(),
            },
            defaultLimit: `${Math.round(parseFloat(offer.loanData.defaultLimit.toString()) / dayInSeconds)} days`,
            interval: `${Math.round(parseFloat(offer.loanData.interval.toString()) / dayInSeconds)} days`,
            singlePayment: offer.loanData.singlePayment.toString(),
            toBePaid: offer.loanData.toBePaid.toString(),
        }
    };
};

export const translateLoan = (loan: Loan.LoanDetailsStructOutput): LoanDetails => {
    return {
        borrower: loan.borrower,
        coin: loan.coin,
        collateral: loan.collateral.toString(),
        collateralCoin: loan.isCollateralEth ? loan.collateralCoin : "",
        defaultLimit: `${Math.round(parseFloat(loan.defaultLimit.toString()) / dayInSeconds)} days`,
        inDefault: loan.inDefault,
        interval: `${Math.round(parseFloat(loan.interval.toString()) / dayInSeconds)} days`,
        isCollateralEth: loan.isCollateralEth,
        isEth: loan.isEth,
        lastPayment: new Date(parseFloat(loan.lastPayment.toString())).toString(),
        lender: loan.lender,
        paidEarly: loan.paidEarly,
        remaining: loan.remaining.toString(),
        requestPaidEarly: loan.requestPaidEarly,
        requestPaidEarlyAmount: loan.requestPaidEarly ? loan.requestPaidEarlyAmount.toString() : "",
        singlePayment: loan.singlePayment.toString(),
    };
};

export const colProps: ColProps = {
    xs: { flex: "100%" },
    sm: { flex: "100%" },
    md: { flex: "50%" },
    lg: { flex: "50%" },
    xl: { flex: "50%" },
};

export const rowProps: RowProps = {
    gutter: [15, 15],
};