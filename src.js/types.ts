export type LoanIssuanceEthEth = {
    type: "EthEth";
    amount: number;
    toBePaid: number;
    interval: number;
    defaultLimit: number;
    singlePayment: number;
    collateral: number;
};

export type LoanIssuanceEthCoin = {
    type: "EthCoin";
    amount: number;
    toBePaid: number;
    interval: number;
    defaultLimit: number;
    singlePayment: number;
    collateral: number;
    collateralCoin: string;
};

export type LoanIssuanceCoinEth = {
    type: "CoinEth";
    amount: number;
    toBePaid: number;
    interval: number;
    defaultLimit: number;
    singlePayment: number;
    collateral: number;
    coin: string;
};

export type LoanIssuanceCoinCoin = {
    type: "CoinCoin";
    amount: number;
    toBePaid: number;
    interval: number;
    defaultLimit: number;
    singlePayment: number;
    collateral: number;
    coin: string;
    collateralCoin: string;
};

export type LoanIssuance =
    | LoanIssuanceEthEth
    | LoanIssuanceEthCoin
    | LoanIssuanceCoinEth
    | LoanIssuanceCoinCoin;

export type FormLoanIssuance = Partial<
    Omit<LoanIssuanceEthEth, "type"> &
    Omit<LoanIssuanceEthCoin, "type"> &
    Omit<LoanIssuanceCoinEth, "type"> &
    Omit<LoanIssuanceCoinCoin, "type"> & {
        type?: "EthEth" | "EthCoin" | "CoinEth" | "CoinCoin";
    }
>;
