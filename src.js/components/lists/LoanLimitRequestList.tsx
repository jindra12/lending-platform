import * as React from "react";
import { Collapse, Divider, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import ReactVisibilitySensor from "react-visibility-sensor";
import { useLendingRequests } from "../context";
import { ApproveLendingRequest } from "../forms/ApproveLendingRequest";

export const LoanLimitRequestList: React.FunctionComponent = () => {
    const requests = useLendingRequests(20);
    return (
        <div>
            {requests.data?.pages.map((page, i) => (
                <React.Fragment key={i}>
                    {page.map((result, i) => (
                        <React.Fragment key={i}>
                            <Collapse
                                collapsible="header"
                                items={[
                                    {
                                        key: "Request for loan limit",
                                        children: (
                                            <ApproveLendingRequest borrower={result.borrower} uniqueId={result.uniqueId} />
                                        )
                                    }
                                ]}
                            />
                            <Divider />
                        </React.Fragment>
                    ))}
                </React.Fragment>
            ))}
            {requests.hasNextPage && (
                <ReactVisibilitySensor onChange={(isVisible: boolean) => isVisible && requests.fetchNextPage()}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                </ReactVisibilitySensor>
            )}
        </div>
    );
};