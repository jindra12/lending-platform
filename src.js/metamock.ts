import MetaMocks from "metamocks";

interface ExtendedWindow extends Window {
    mock: (
        defaultChainId: number,
        testPrivateKey: string,
        url: string,
    ) => void;
    ethereum: MetaMocks;
}

const win = window as any as ExtendedWindow;

win.mock = (defaultChainId, testPrivateKey, rpcUrl) => {
    const metamocks = new MetaMocks(testPrivateKey, defaultChainId, rpcUrl);
    win.ethereum = metamocks;
};