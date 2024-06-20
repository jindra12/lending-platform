declare var appConfig: {
    bankName: string;
    net: "mainnet" | "devnet";
    platformContract: string;
};

export const getConfig = () => appConfig;