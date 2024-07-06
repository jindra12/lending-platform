import * as React from "react";
import { Alert, Divider, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import ReactVisibilitySensor from "react-visibility-sensor";
import { useLendingRequests } from "../context";
import { ApproveLendingRequest } from "../forms/ApproveLendingRequest";
import { ChangeLoanFee } from "../forms/ChangeLoanFee";
import { OwnerGuard } from "../views/OwnerGuard";

export interface LoanLimitRequestListProps {
    self: string;
}

export const LoanLimitRequestList: React.FunctionComponent<
    LoanLimitRequestListProps
> = (props) => {
    const requests = useLendingRequests(20);
    return (
        <OwnerGuard self={props.self} showError>
            {() => (
                <>
                    <ChangeLoanFee />
                    <Divider />
                    <div>
                        {requests.data?.pages.length === 1 &&
                            requests.data.pages[0].length === 0 && (
                                <Alert
                                    type="info"
                                    message="No requests for increasing loan limit found"
                                />
                            )}
                        {requests.data?.pages.map((page, i) => (
                            <React.Fragment key={i}>
                                {page.map((result, i) => (
                                    <React.Fragment key={i}>
                                        <ApproveLendingRequest
                                            borrower={result.borrower}
                                            uniqueId={result.uniqueId}
                                        />
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                        {requests.hasNextPage && (
                            <ReactVisibilitySensor
                                onChange={(isVisible: boolean) =>
                                    isVisible && requests.fetchNextPage()
                                }
                            >
                                <Spin
                                    indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                                />
                            </ReactVisibilitySensor>
                        )}
                    </div>
                </>
            )}
        </OwnerGuard>
    );
};
