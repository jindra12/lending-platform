import * as React from "react";
import { CheckCircleFilled } from '@ant-design/icons';
import { useApproveLendingRequest } from "../context";
import { Button } from "antd";

export interface ApproveLendingRequestProps {
    borrower: string;
}

export const ApproveLendingRequest: React.FunctionComponent<ApproveLendingRequestProps> = (props) => {
    const approve = useApproveLendingRequest();
    return (
        <Button
          type="primary"
          icon={<CheckCircleFilled />}
          loading={approve.isLoading}
          onClick={() => approve.mutate(props.borrower)}
        >
          Click me!
        </Button>
    );
};
