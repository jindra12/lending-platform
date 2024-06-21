import * as React from "react";
import * as ReactDOM from "react-dom/client";
import EncryptRsa from "encrypt-rsa";
import {
    LoanAbi__factory,
    LoanAbi,
    LendingPlatformAbi,
    IERC20MetadataAbi,
    LendingPlatformAbi__factory,
    IERC20MetadataAbi__factory,
} from "../contracts";
import { BrowserProvider, ethers } from "ethers";
import { Throw } from "throw-expression";
import { getConfig } from "../config";
import {
    useQuery as useQueryInternal,
    useInfiniteQuery,
    useMutation,
} from "react-query";
import { LoanIssuance } from "../types";

const Context = React.createContext<{
    loans: Record<string, LoanAbi>;
    lendingPlatform: React.MutableRefObject<LendingPlatformAbi>;
    ercs: Record<string, IERC20MetadataAbi>;
    provider: React.MutableRefObject<BrowserProvider>;
}>(null!);

const getProvider = () =>
    new BrowserProvider(
        (window as any).ethereum || Throw("Please install metamask")
    );

const useContext = () => React.useContext(Context)!;

export const ContextProvider: React.FunctionComponent<
    React.PropsWithChildren
> = (props) => {
    const loansRef = React.useRef<Record<string, LoanAbi>>({});
    const lendingPlatformRef = React.useRef<LendingPlatformAbi>(null!);
    const ercs = React.useRef<Record<string, IERC20MetadataAbi>>({});
    const provider = React.useRef<BrowserProvider>(null!);
    return (
        <Context.Provider
            value={{
                ercs: ercs.current,
                lendingPlatform: lendingPlatformRef,
                loans: loansRef.current,
                provider: provider,
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

const useQuery = <TResult extends object>(
    getter: () => TResult | Promise<TResult>,
    ...deps: any[]
) => {
    const query = useQueryInternal(getter.toString(), getter, {
        enabled: false,
    });

    React.useEffect(() => {
        query.refetch();
    }, deps);

    return query;
};

const useRenewQuery = <TResult extends object>(
    getter: () => TResult | Promise<TResult>,
    ...deps: any[]
) => {
    const query = useQueryInternal(getter.toString(), getter, {
        enabled: false,
    });

    React.useEffect(() => {
        query.remove();
        query.refetch();
    }, deps);

    return query;
};

const usePaginationQuery = <TResult extends object>(
    getter: (pageParam: number) => TResult[] | Promise<TResult[]>,
    ignoreEmpty: boolean,
    ...deps: any[]
) => {
    const query = useInfiniteQuery(
        getter.toString(),
        ({ pageParam = 1 }) => getter(pageParam),
        {
            enabled: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length > 0 || ignoreEmpty ? allPages.length + 1 : undefined;
            },
        }
    );

    React.useEffect(() => {
        query.remove();
        query.refetch();
    }, deps);

    return query;
};

export const useProvider = () => {
    const { provider } = useContext();

    return (provider.current ||= getProvider());
};

export const useLoan = (address: string) => {
    const { loans } = useContext();
    const provider = useProvider();

    return (loans[address] ||= LoanAbi__factory.connect(address, provider));
};

export const useLendingPlatform = () => {
    const { lendingPlatform } = useContext();
    const provider = useProvider();

    return (lendingPlatform.current ||= LendingPlatformAbi__factory.connect(
        getConfig().platformContract,
        provider
    ));
};

export const useERC20 = (address: string) => {
    const { ercs } = useContext();
    const provider = useProvider();

    return (ercs[address] ||= IERC20MetadataAbi__factory.connect(
        address,
        provider
    ));
};

export const useLoanSearch = (count: number, lender: string | undefined) => {
    const lendingPlatform = useLendingPlatform();
    return usePaginationQuery(
        (page) => {
            return lender
                ? lendingPlatform.listLoanOffersByLender(
                    (page - 1) * count,
                    count,
                    lender
                )
                : lendingPlatform.listLoanOffers((page - 1) * count, count);
        },
        false,
        [lender]
    );
};

export const useIssueLoan = () => {
    const lendingPlatform = useLendingPlatform();
    return useMutation((params: LoanIssuance) => {
        switch (params.type) {
            case "EthEth":
                return lendingPlatform.offerLoanEthEth(
                    params.toBePaid,
                    params.interval,
                    params.defaultLimit,
                    params.singlePayment,
                    params.collateral
                );
            case "EthCoin":
                return lendingPlatform.offerLoanEthCoin(
                    params.toBePaid,
                    params.interval,
                    params.defaultLimit,
                    params.singlePayment,
                    params.collateral,
                    params.collateralCoin
                );
            case "CoinEth":
                return lendingPlatform.offerLoanCoinEth(
                    params.amount,
                    params.toBePaid,
                    params.interval,
                    params.defaultLimit,
                    params.singlePayment,
                    params.collateral,
                    params.coin
                );
            case "CoinCoin":
                return lendingPlatform.offerLoanCoinCoin(
                    params.amount,
                    params.toBePaid,
                    params.interval,
                    params.defaultLimit,
                    params.singlePayment,
                    params.collateral,
                    params.coin,
                    params.collateralCoin
                );
        }
    });
};

export const useRequestLendingLimit = () => {
    const lendingPlatform = useLendingPlatform();
    const crypto = new EncryptRsa();
    return useMutation(async (files: File[]) => {
        const encrypted = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result;
                const array = new Uint8Array(arrayBuffer as ArrayBuffer);
                const binaryString = String.fromCharCode.apply(null, array);
                resolve(crypto.encrypt({
                    text: binaryString,
                    privateKey: getConfig().publicKey,
                }));
            };
            reader.readAsArrayBuffer(files[0]);
        });

        return lendingPlatform.setLoanLimitRequest(await encrypted);
    });
};

export const useLendingRequests = () => {
    const lendingPlatform = useLendingPlatform();
    const provider = useProvider();
    return usePaginationQuery(async (page) => {
        const latestBlock = await provider.getBlockNumber();
        const query = await lendingPlatform.queryFilter(lendingPlatform.getEvent("RequestLoanLimit"), latestBlock - (page * 1000), latestBlock);
        return query.map(({ topics }) => ({ borrower: topics[0] }));
    }, true);
};

export const useLendingRequestFile = (privateKey: string) => {
    const lendingPlatform = useLendingPlatform();
    const crypto = new EncryptRsa();
    return useMutation(async (borrower: string) => {
        const file = await lendingPlatform.getLoanLimitRequest(borrower);
        const decrypted = crypto.decrypt({
            text: file,
            publicKey: privateKey,
        });
        var blob = new Blob([decrypted], { type: "application/pdf" });
        const link = <a href={URL.createObjectURL(blob)} id="download" download={borrower} style={{ display: "none" }} />;
        const wrapper = document.createElement("div");
        document.body.appendChild(wrapper);
        const root = ReactDOM.createRoot(wrapper);
        root.render(link);
        document.getElementById("download")?.click();
        root.unmount();
        document.body.removeChild(wrapper);
    });
};

export const useApproveLendingRequest = () => {
    const lendingPlatform = useLendingPlatform();
    return useMutation((params: { address: string, amount: number, coin: string | undefined }) => {
        return params.coin ? lendingPlatform["setLoanLimit(address,uint256,address)"](
            params.address,
            params.amount,
            params.coin,
        ) : lendingPlatform["setLoanLimit(address,uint256)"](
            params.address,
            params.amount,
        );
    });
};

export const useLoans = (borrower: string, lender?: string) => {
    const lendingPlatform = useLendingPlatform();
    return useQuery(async () => {
        const acceptedLoans = await lendingPlatform.filters["AcceptedLoan(uint256,address,address,address)"](undefined, lender, borrower).getTopicFilter();
        return acceptedLoans.map((topics: string[]) => ({
            address: topics[3],
        }));
    });
};
