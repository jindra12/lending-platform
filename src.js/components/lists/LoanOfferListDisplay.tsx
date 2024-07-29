import * as React from "react";
import { Divider, Spin } from "antd";
import ReactVisibilitySensor from "react-visibility-sensor";
import { LoadingOutlined } from "@ant-design/icons";
import { useLoanOfferSearch } from "../context";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { LoanOfferDetail } from "../views/LoanOfferDetail";
import { FormError } from "../utils/FormError";

export interface LoanOfferListDisplayProps {
    self: string;
    search: LendingPlatFormStructs.LoanOfferSearchStruct;
}

export const LoanOfferListDisplay: React.FunctionComponent<
    LoanOfferListDisplayProps
> = (props) => {
    const loans = useLoanOfferSearch(20, props.search);
    const onFinish = React.useCallback(() => {
        loans.remove();
        loans.refetch();
    }, [loans]);

    return (
        <div>
            {loans.data?.pages.map((page, i) => (
                <React.Fragment key={i}>
                    {page.map((result, j) => (
                        <React.Fragment key={j}>
                            <LoanOfferDetail onFinish={onFinish} offer={result} self={props.self} />
                            <Divider />
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
            <FormError query={loans} />
            {loans.hasNextPage && (
                <ReactVisibilitySensor
                    onChange={(isVisible: boolean) =>
                        isVisible && loans.fetchNextPage()
                    }
                >
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                    />
                </ReactVisibilitySensor>
            )}
        </div>
    );
};
