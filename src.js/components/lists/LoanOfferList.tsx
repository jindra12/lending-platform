import * as React from "react";
import { Divider, Spin } from "antd";
import ReactVisibilitySensor from "react-visibility-sensor";
import { LoadingOutlined } from "@ant-design/icons";
import { useLoanSearch } from "../context";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { LoanOfferSearch } from "../forms/LoanOfferSearch";
import { LoanOfferDetail } from "../views/LoanOfferDetail";

export interface LoanOfferListProps {
    self: string;
}

export const LoanOfferList: React.FunctionComponent<LoanOfferListProps> = (props) => {
    const [search, setSearch] = React.useState<LendingPlatFormStructs.LoanOfferSearchStruct>();
    const loans = useLoanSearch(20, search);
    return (
        <div>
            <LoanOfferSearch setSearchParams={setSearch} isFetching={loans.isFetching} />
            {loans.data?.pages.map((page, i) => (
                <React.Fragment key={i}>
                    {page.map((result, i) => (
                        <React.Fragment key={i}>
                            <LoanOfferDetail offer={result} self={props.self} />
                            <Divider />
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
            {loans.hasNextPage && (
                <ReactVisibilitySensor onChange={(isVisible: boolean) => isVisible && loans.fetchNextPage()}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                </ReactVisibilitySensor>
            )}
        </div>
    );
};