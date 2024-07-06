import MetaMocks from "metamocks";

interface ExtendedWindow extends Window {
    mock: (
        defaultChainId: number,
        testPrivateKeys: string[],
        url: string,
        index: number,
    ) => void;
    ethereum: MetaMocks;
}

const win = window as any as ExtendedWindow;

win.mock = (defaultChainId, testPrivateKeys, rpcUrl, index) => {
    const testPrivateKey = testPrivateKeys[index];
    const metamocks = new MetaMocks(testPrivateKey, defaultChainId, rpcUrl);
    win.ethereum = metamocks;
};