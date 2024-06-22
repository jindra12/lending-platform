import * as React from "react";
import { Button, Modal } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useApproveEarlyRepayment } from "../context";

export interface ApproveEarlyRepaymentProps {
    loan: string;
}

export const ApproveEarlyRepayment: React.FunctionComponent<
    ApproveEarlyRepaymentProps
> = (props) => {
    const approveEarlyRepayment = useApproveEarlyRepayment(props.loan);
    const [isModalOpen, setModalOpen] = React.useState(false);
    return (
        <>
            <Button
                type="primary"
                icon={<CheckCircleFilled />}
                loading={approveEarlyRepayment.isLoading}
                onClick={() => setModalOpen(true)}
            >
                Approve early repayment
            </Button>
            <Modal
                title="Approve early repayment"
                open={isModalOpen}
                onOk={() => {
                    approveEarlyRepayment.mutate();
                    setModalOpen(false);
                }}
                onCancel={() => setModalOpen(false)}
            >
                Are you sure you want to approve early repayment and receive funds now?
            </Modal>
        </>
    );
};
