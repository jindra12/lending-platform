declare var appConfig: {
    ownerPubKey: string;
    bankName: string;
    net: "mainnet" | "devnet";
    platformContract: string;
    provider: string;
};

export const getConfig = () => appConfig;