import * as React from "react";
import {
    LoanAbi__factory,
    LoanAbi,
    LendingPlatformAbi,
    IERC20MetadataAbi,
    LendingPlatformAbi__factory,
    IERC20MetadataAbi__factory,
} from "../contracts";
import { BrowserProvider } from 'ethers';
import { Throw } from "throw-expression";
import { getConfig } from "../config";
import { useQuery as useQueryInternal, useInfiniteQuery, useMutation } from "react-query";

const Context = React.createContext<{
    loans: Record<string, LoanAbi>;
    lendingPlatform: React.MutableRefObject<LendingPlatformAbi>,
    ercs: Record<string, IERC20MetadataAbi>,
    provider: React.MutableRefObject<BrowserProvider>,
}>(null!);

const getProvider = () => new BrowserProvider((window as any).ethereum || Throw("Please install metamask"));

const useContext = () => React.useContext(Context)!;

export const ContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const loansRef = React.useRef<Record<string, LoanAbi>>({});
    const lendingPlatformRef = React.useRef<LendingPlatformAbi>(null!);
    const ercs = React.useRef<Record<string, IERC20MetadataAbi>>({});
    const provider = React.useRef<BrowserProvider>(null!);
    return (
        <Context.Provider value={{
            ercs: ercs.current,
            lendingPlatform: lendingPlatformRef,
            loans: loansRef.current,
            provider: provider,
        }}>
            {props.children}
        </Context.Provider>
    );
};

const useQuery = <TResult extends object>(getter: () => (TResult | Promise<TResult>), ...deps: any[]) => {
    const query = useQueryInternal(getter.toString(), getter, {
        enabled: false,
    });

    React.useEffect(() => {
        query.refetch();
    }, deps);

    return query;
};

const useRenewQuery = <TResult extends object>(getter: () => (TResult | Promise<TResult>), ...deps: any[]) => {
    const query = useQueryInternal(getter.toString(), getter, {
        enabled: false,
    });

    React.useEffect(() => {
        query.remove();
        query.refetch();
    }, deps);

    return query;
};

const usePaginationQuery = <TResult extends object>(getter: (pageParam: number) => (TResult[] | Promise<TResult[]>), ...deps: any[]) => {
    const query = useInfiniteQuery(getter.toString(), ({ pageParam = 1 }) => getter(pageParam), {
        enabled: false,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length > 0 ? allPages.length + 1 : undefined;
        },
    });

    React.useEffect(() => {
        query.remove();
        query.refetch();
    }, deps);

    return query;
};

export const useProvider = () => {
    const { provider } = useContext();

    return provider.current ||= getProvider();
};

export const useLoan = (address: string) => {
    const { loans } = useContext();
    const provider = useProvider();

    return loans[address] ||= LoanAbi__factory.connect(
        address,
        provider,
    );
};

export const useLendingPlatform = () => {
    const { lendingPlatform } = useContext();
    const provider = useProvider();

    return lendingPlatform.current ||= LendingPlatformAbi__factory.connect(
        getConfig().platformContract,
        provider,
    );
};

export const useERC20 = (address: string) => {
    const { ercs } = useContext();
    const provider = useProvider();

    return ercs[address] ||= IERC20MetadataAbi__factory.connect(
        address,
        provider,
    );
};

export const useLoanSearch = (
    count: number,
    lender: string | undefined,
) => {
    const lendingPlatform = useLendingPlatform();
    return usePaginationQuery((page) => {
        return lender
            ? lendingPlatform.listLoanOffersByLender((page - 1) * count, count, lender)
            : lendingPlatform.listLoanOffers((page - 1) * count, count);
    }, [lender]);
};

export const issueLoan = (type: "EthEth" | "EthCoin" | "CoinEth" | "CoinCoin") => {
    const lendingPlatform = useLendingPlatform();
    return useMutation((toBePaid: number, interval: number, defaultLimit: number, singlepayment: number, collateral: number) => {
        switch (type) {
            case "EthEth":
                return lendingPlatform.offerLoanEthEth(toBePaid, interval, defaultLimit, singlepayment, collateral);
            case "EthCoin":
                return lendingPlatform.offerLoanEthCoin(toBePaid, interval, defaultLimit, singlepayment, collateral, );
            case "CoinEth":
                return lendingPlatform.offerLoanCoinEth();
            case "CoinCoin":
                return lendingPlatform.offerLoanCoinCoin();
        }
    });
};