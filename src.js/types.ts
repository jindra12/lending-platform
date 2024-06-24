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

interface LoanDataCollateral {
    value: string;
    isCollateralEth: boolean;
    collateralCoin: string;
}

interface LoanOfferData {
    amount: string;
    toBePaid: string;
    interval: string;
    singlePayment: string;
    defaultLimit: string;
    collateral: LoanDataCollateral;
}

export interface LoanOfferStruct {
    coin: string;
    loanData: LoanOfferData;
    from: string;
    id: string;
    isEth: boolean;
}

export interface LoanDetails {
    lender: string;
    borrower: string;
    remaining: string;
    singlePayment: string;
    interval: string;
    defaultLimit: string;
    lastPayment: string;
    collateral: string;
    isCollateralEth: boolean;
    collateralCoin: string;
    coin: string;
    isEth: boolean;
    inDefault: boolean;
    paidEarly: boolean;
    requestPaidEarly: boolean;
    requestPaidEarlyAmount: string;
}