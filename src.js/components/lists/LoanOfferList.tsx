import * as React from "react";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { LoanOfferSearch } from "../forms/LoanOfferSearch";
import { LoanOfferListDisplay } from "./LoanOfferListDisplay";

export interface LoanOfferListProps {
    self: string;
}

export const LoanOfferList: React.FunctionComponent<LoanOfferListProps> = (props) => {
    const [search, setSearch] = React.useState<LendingPlatFormStructs.LoanOfferSearchStruct>();
    return (
        <div>
            <LoanOfferSearch setSearchParams={setSearch} />
            {search && (
                <LoanOfferListDisplay search={search} self={props.self} />
            )}
        </div>
    );
};