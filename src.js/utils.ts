import { Rule } from "antd/es/form";
import { FormLoanIssuance, LoanIssuance } from "./types";

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
    pattern: /0x[a-zA-Z-0-9]{40}/,
    message: "Invalid address",
};
