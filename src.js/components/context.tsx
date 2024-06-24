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
import { LendingPlatFormStructs } from "../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { dayInSeconds, translateLoan } from "../utils";

const Context = React.createContext<{
    loans: Record<string, LoanAbi>;
    lendingPlatform: React.MutableRefObject<LendingPlatformAbi>;
    ercs: Record<string, IERC20MetadataAbi>;
    provider: React.MutableRefObject<BrowserProvider>;
}>(null!);

const getPayable = (amount: number | bigint) => ({
    value: ethers.parseUnits(amount.toString(), "wei"),
});

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

const useQuery = <TResult extends any>(
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

const useRenewQuery = <TResult extends any>(
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

const usePaginationQuery = <TResult extends any>(
    getter: (pageParam: number) => TResult[] | Promise<TResult[]>,
    ...deps: any[]
) => {
    const query = useInfiniteQuery(
        getter.toString(),
        ({ pageParam = 1 }) => getter(pageParam),
        {
            enabled: false,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length > 0
                    ? allPages.length + 1
                    : undefined;
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

export const useGetERC20 = () => {
    const { ercs } = useContext();
    const provider = useProvider();
    return useMutation(
        (address: string) =>
            new Promise<IERC20MetadataAbi>((resolve) =>
                resolve(
                    (ercs[address] ||= IERC20MetadataAbi__factory.connect(
                        address,
                        provider
                    ))
                )
            )
    );
};

export const useCoinName = (address: string) => {
    const coin = useERC20(address);
    return useRenewQuery(() => coin.name(), address);
};

export const useLoanSearch = (
    count: number,
    search?: LendingPlatFormStructs.LoanOfferSearchStruct
) => {
    const lendingPlatform = useLendingPlatform();
    return usePaginationQuery(
        (page) => {
            return search
                ? lendingPlatform.listLoanOffersBy((page - 1) * count, count, search)
                : lendingPlatform.listLoanOffers((page - 1) * count, count);
        },
        [search]
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
                (await getCoin.mutateAsync(params.coin)).approve(getConfig().platformContract, params.amount);
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
                (await getCoin.mutateAsync(params.coin)).approve(getConfig().platformContract, params.amount);
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

export const useLendingRequests = () => {
    const lendingPlatform = useLendingPlatform();
    return usePaginationQuery(async (page) => {
        const query = await lendingPlatform.filters["RequestLoanLimit(address,uint256)"](undefined, page).getTopicFilter();
        return query.map((event: string[]) => ({ borrower: event[0] }));
    });
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

export type ApproveLendingRequestType = { amount: number; coin: string | undefined, isEth: boolean };
export const useApproveLendingRequest = (address: string) => {
    const lendingPlatform = useLendingPlatform();
    return useMutation(
        (params: ApproveLendingRequestType) => {
            return params.coin
                ? lendingPlatform["setLoanLimit(address,uint256,address)"](
                    address,
                    params.amount,
                    params.coin
                )
                : lendingPlatform["setLoanLimit(address,uint256)"](
                    address,
                    params.amount
                );
        }
    );
};

export const useLoans = (borrower: string, lender?: string) => {
    const lendingPlatform = useLendingPlatform();
    return useQuery(async () => {
        const acceptedLoans = await lendingPlatform.filters[
            "AcceptedLoan(uint256,address,address,address)"
        ](undefined, lender, borrower).getTopicFilter();
        return acceptedLoans.map((topics: string[]) => ({
            address: topics[3],
        }));
    });
};

export const useLoanDetail = (address: string) => {
    const loan = useLoan(address);
    const loanDetail = useQuery(async () => translateLoan(await loan.getLoanDetails()));

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

export const useAcceptLoan = (offer: LendingPlatFormStructs.LoanOfferStructOutput) => {
    const lendingPlatform = useLendingPlatform();
    const getCoin = useGetERC20();
    return useMutation(async () => {
        if (offer.loanData.collateral.isCollateralEth) {
            const coin = await getCoin.mutateAsync(offer.loanData.collateral.collateralCoin);
            coin.approve(getConfig().platformContract, offer.loanData.collateral.value);
            return lendingPlatform.acceptLoan(offer.id);
        } else {
            return lendingPlatform.acceptLoan(offer.id, getPayable(offer.loanData.collateral.value));
        }
    });
};

export const useRemoveLoan = (loanId: number | bigint) => {
    const lendingPlatform = useLendingPlatform();
    return useMutation(() => lendingPlatform.removeLoan(loanId));
};

