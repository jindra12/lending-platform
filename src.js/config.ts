declare var appConfig: {
    bankName: string;
    net: "mainnet" | "devnet";
    platformContract: string;
    publicKey: string;
};

export const getConfig = () => appConfig;