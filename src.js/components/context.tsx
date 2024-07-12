import * as React from "react";
import * as ReactDOM from "react-dom/client";
import EncryptRsa from "encrypt-rsa";
import uniqueId from "lodash-es/uniqueId";
import {
    LoanAbi__factory,
    IERC20MetadataAbi,
    LendingPlatformAbi__factory,
    IERC20MetadataAbi__factory,
} from "../contracts";
import { BrowserProvider, JsonRpcSigner, ethers } from "ethers";
import { Throw } from "throw-expression";
import { getConfig } from "../config";
import {
    useQuery as useQueryInternal,
    useInfiniteQuery,
    useMutation,
} from "react-query";
import { LoanIssuance } from "../types";
import { LendingPlatFormStructs } from "../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { dayInSeconds, sanitizeOfferSearch, translateLoan } from "../utils";

const Context = React.createContext<{
    provider: React.MutableRefObject<BrowserProvider>;
    signer: React.MutableRefObject<JsonRpcSigner>;
}>(null!);

const getPayable = (amount: number | bigint) => ({
    value: ethers.parseUnits(amount.toString(), "wei"),
});

const getProvider = () =>
    new BrowserProvider(
        (window as any).ethereum || Throw("Please install metamask")
    );

const useContext = () => React.useContext(Context)!;

const useUnique = (key: string) => React.useMemo(() => uniqueId(key), []);

export const ContextProvider: React.FunctionComponent<
    React.PropsWithChildren
> = (props) => {
    const provider = React.useRef<BrowserProvider>(null!);
    const signer = React.useRef<JsonRpcSigner>(null!);
    return (
        <Context.Provider
            value={{
                provider: provider,
                signer: signer,
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

const useQuery = <TResult extends any>(
    getter: () => TResult | Promise<TResult>,
    ...deps: any[]
) => {
    const key = useUnique("key");
    const query = useQueryInternal(
        key + getter.toString() + deps.map((d) => d?.toString()).join("|"),
        getter,
        {
            enabled: false,
        }
    );

    React.useEffect(() => {
        query.refetch();
    }, deps);

    return query;
};

const useRenewQuery = <TResult extends any>(
    getter: () => TResult | Promise<TResult>,
    ...deps: any[]
) => {
    const key = useUnique("key");
    const query = useQueryInternal(key + getter.toString(), getter, {
        enabled: false,
    });

    React.useEffect(() => {
        query.remove();
        query.refetch();
    }, deps);

    return query;
};

const usePaginationQuery = <TResult extends any>(
    getter: (pageParam: number) => TResult[] | Promise<TResult[]>,
    ...deps: any[]
) => {
    const key = useUnique("key");
    const query = useInfiniteQuery(
        key + getter.toString(),
        ({ pageParam = 1 }) => getter(pageParam),
        {
            enabled: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length > 0 ? allPages.length + 1 : undefined;
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

export const useBalance = (address: string) => {
    const { provider } = useContext();
    return useQuery(() => provider.current.getBalance(address), address);
};

export const useSigner = () => {
    const { signer } = useContext();
    return signer.current || Throw("No signer has been defined");
};

export const useSetSigner = (self: string) => {
    const provider = useProvider();
    const { signer } = useContext();
    return useQuery(async (): Promise<boolean> => {
        signer.current = await provider.getSigner(self);
        return true;
    }, self);
};

export const useLoan = (address: string) => {
    const signer = useSigner();
    return React.useMemo(() => {
        return LoanAbi__factory.connect(address, signer);
    }, [signer, address]);
};

export const useAccounts = () => {
    const provider = useProvider();
    return useQuery(async () => {
        await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        return provider.listAccounts();
    });
};

export const useLendingPlatform = () => {
    const signer = useSigner();
    return React.useMemo(() => {
        return LendingPlatformAbi__factory.connect(
            getConfig().platformContract,
            signer
        );
    }, [signer]);
};

export const useUnsignedLendingPlatform = () => {
    const provider = useProvider();
    return React.useMemo(() => {
        return LendingPlatformAbi__factory.connect(
            getConfig().platformContract,
            provider
        );
    }, [provider]);
};

export const useERC20 = (address: string) => {
    const signer = useSigner();
    return React.useMemo(() => {
        return IERC20MetadataAbi__factory.connect(address, signer);
    }, [address, signer]);
};

export const useGetERC20 = () => {
    const signer = useSigner();
    return useMutation(
        (address: string) =>
            new Promise<IERC20MetadataAbi>((resolve) =>
                resolve(IERC20MetadataAbi__factory.connect(address, signer))
            )
    );
};

export const useCoinName = (address: string) => {
    const coin = useERC20(address);
    return useRenewQuery(() => coin.name(), address);
};

export const useLoanOfferSearch = (
    count: number,
    search: LendingPlatFormStructs.LoanOfferSearchStruct
) => {
    const lendingPlatform = useLendingPlatform();
    return usePaginationQuery(
        async (page): Promise<LendingPlatFormStructs.LoanOfferStructOutput[]> => {
            const results = await lendingPlatform.listLoanOffersBy(
                (page - 1) * count,
                count,
                sanitizeOfferSearch(search)
            );
            return results.filter((output) => output.id.toString() !== "0");
        },
        search
    );
};

export const useIssueLoan = () => {
    const lendingPlatform = useLendingPlatform();
    const getCoin = useGetERC20();
    return useMutation(async (params: LoanIssuance) => {
        switch (params.type) {
            case "EthEth":
                return lendingPlatform.offerLoanEthEth(
                    params.toBePaid,
                    params.interval * dayInSeconds,
                    params.defaultLimit * dayInSeconds,
                    params.singlePayment,
                    params.collateral,
                    getPayable(params.amount)
                );
            case "EthCoin":
                return lendingPlatform.offerLoanEthCoin(
                    params.toBePaid,
                    params.interval * dayInSeconds,
                    params.defaultLimit * dayInSeconds,
                    params.singlePayment,
                    params.collateral,
                    params.collateralCoin,
                    getPayable(params.amount)
                );
            case "CoinEth":
                (await getCoin.mutateAsync(params.coin)).approve(
                    getConfig().platformContract,
                    params.amount
                );
                return lendingPlatform.offerLoanCoinEth(
                    params.amount,
                    params.toBePaid,
                    params.interval * dayInSeconds,
                    params.defaultLimit * dayInSeconds,
                    params.singlePayment,
                    params.collateral,
                    params.coin
                );
            case "CoinCoin":
                (await getCoin.mutateAsync(params.coin)).approve(
                    getConfig().platformContract,
                    params.amount
                );
                return lendingPlatform.offerLoanCoinCoin(
                    params.amount,
                    params.toBePaid,
                    params.interval * dayInSeconds,
                    params.defaultLimit * dayInSeconds,
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
        const loanFee = await lendingPlatform.getLoanFee();
        const encrypted = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result;
                const array = new Uint8Array(arrayBuffer as ArrayBuffer);
                const binaryString = String.fromCharCode.apply(null, array);
                resolve(
                    crypto.encrypt({
                        text: binaryString,
                        privateKey: getConfig().publicKey,
                    })
                );
            };
            reader.readAsArrayBuffer(files[0]);
        });

        return lendingPlatform.setLoanLimitRequest(
            await encrypted,
            getPayable(loanFee)
        );
    });
};

export const useLendingRequests = (count: number) => {
    const lendingPlatform = useLendingPlatform();
    return usePaginationQuery(
        async (
            page
        ): Promise<LendingPlatFormStructs.ActiveRequestStructOutput[]> => {
            const results = await lendingPlatform.listActiveRequests(
                count * (page - 1),
                count
            );
            return results.filter((output) => output.uniqueId.toString() !== "0");
        }
    );
};

export const useLendingRequestFile = (borrower: string) => {
    const lendingPlatform = useLendingPlatform();
    const crypto = new EncryptRsa();
    return useMutation(async (privateKey: string): Promise<void> => {
        const file = await lendingPlatform.getLoanLimitRequest(borrower);
        const decrypted = crypto.decrypt({
            text: file,
            publicKey: privateKey,
        });
        var blob = new Blob([decrypted], { type: "application/pdf" });
        const link = (
            <a
                href={URL.createObjectURL(blob)}
                id="download"
                download={borrower}
                style={{ display: "none" }}
            />
        );
        const wrapper = document.createElement("div");
        document.body.appendChild(wrapper);
        const root = ReactDOM.createRoot(wrapper);
        root.render(link);
        document.getElementById("download")?.click();
        root.unmount();
        document.body.removeChild(wrapper);
    });
};

export type ApproveLendingRequestType = {
    amount: number;
    coin: string | undefined;
    isEth: boolean;
};
export const useApproveLendingRequest = (
    address: string,
    requestId: number | bigint
) => {
    const lendingPlatform = useLendingPlatform();
    return useMutation((params: ApproveLendingRequestType) => {
        return params.coin
            ? lendingPlatform["setLoanLimit(address,uint256,address,uint256)"](
                address,
                params.amount,
                params.coin,
                requestId
            )
            : lendingPlatform["setLoanLimit(address,uint256,uint256)"](
                address,
                params.amount,
                requestId
            );
    });
};

export const useIsOwner = (self: string) => {
    const lendingPlatform = useUnsignedLendingPlatform();
    return useQuery(async () => {
        const owner = await lendingPlatform.getOwner();
        return owner === self;
    }, self);
};

export const useSetLoanFee = () => {
    const lendingPlatform = useLendingPlatform();
    return useMutation((amount: number) => {
        return lendingPlatform.setLoanFee(amount);
    });
};

export const useLoanFee = () => {
    const lendingPlatform = useLendingPlatform();
    return useQuery(() => lendingPlatform.getLoanFee());
};

export const useLoans = (borrower?: string, lender?: string) => {
    const lendingPlatform = useLendingPlatform();
    return useQuery(
        async () => {
            const acceptedLoans = await lendingPlatform.filters[
                "AcceptedLoan(uint256,address,address,address)"
            ](undefined, lender, borrower).getTopicFilter();

            return acceptedLoans
                .filter((topic) => Array.isArray(topic))
                .map((topics: string[]) => ({
                    address: topics[3],
                    lender: topics[1],
                    borrower: topics[2],
                }));
        },
        borrower,
        lender
    );
};

export const useLoanDetail = (address: string) => {
    const loan = useLoan(address);
    const loanDetail = useQuery(async () =>
        translateLoan(await loan.getLoanDetails())
    );

    return loanDetail;
};

export const useRequestEarlyRepayment = (address: string) => {
    const loan = useLoan(address);
    return useMutation(async (amount: number) => {
        return (await loan.getIsEth())
            ? loan.requestEarlyRepaymentEth(getPayable(amount))
            : loan.requestEarlyRepaymentCoin(amount);
    });
};

export const useApproveEarlyRepayment = (address: string) => {
    const loan = useLoan(address);
    return useMutation(() => loan.acceptEarlyRepayment());
};

export const useRejectEarlyRepayment = (address: string) => {
    const loan = useLoan(address);
    return useMutation(() => loan.rejectEarlyRepayment());
};

export const useDefault = (address: string) => {
    const loan = useLoan(address);
    return useMutation(() => loan.defaultOnLoan());
};

export const usePayment = (address: string) => {
    const loan = useLoan(address);
    const getCoin = useGetERC20();
    return useMutation(async () => {
        const isEth = await loan.getIsEth();
        const payment = await loan.getSinglePayment();
        if (isEth) {
            return loan.doPayment(getPayable(payment));
        } else {
            const coin = await getCoin.mutateAsync(await loan.getCoin());
            await coin.approve(address, payment);
            return loan.doPayment();
        }
    });
};

export const useCanDoPayment = (address: string) => {
    const loan = useLoan(address);
    return useQuery(() => loan.canDoPayment(), address);
};

export const useCanDefault = (address: string) => {
    const loan = useLoan(address);
    return useQuery(() => loan.canDefaultOnLoan(), address);
};

export const useCanRequestEarlyRepayment = (address: string) => {
    const loan = useLoan(address);
    return useQuery(() => loan.canRequestEarlyRepayment(), address);
};

export const useCanDoEarlyRepayment = (address: string) => {
    const loan = useLoan(address);
    return useQuery(() => loan.canDoEarlyRepayment(), address);
};

export const useAcceptLoan = (
    offer: LendingPlatFormStructs.LoanOfferStructOutput
) => {
    const lendingPlatform = useLendingPlatform();
    const getCoin = useGetERC20();
    return useMutation(async () => {
        if (offer.loanData.collateral.isCollateralEth) {
            const coin = await getCoin.mutateAsync(
                offer.loanData.collateral.collateralCoin
            );
            coin.approve(
                getConfig().platformContract,
                offer.loanData.collateral.value
            );
            return lendingPlatform.acceptLoan(offer.id);
        } else {
            return lendingPlatform.acceptLoan(
                offer.id,
                getPayable(offer.loanData.collateral.value)
            );
        }
    });
};

export const useRemoveLoan = (loanId: number | bigint) => {
    const lendingPlatform = useLendingPlatform();
    return useMutation(() => lendingPlatform.removeLoan(loanId));
};
