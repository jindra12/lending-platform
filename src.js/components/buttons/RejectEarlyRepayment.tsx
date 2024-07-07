import * as React from "react";
import { Button, Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useRejectEarlyRepayment } from "../context";

export interface RejectEarlyRepaymentProps {
    loan: string;
}

export const RejectEarlyRepayment: React.FunctionComponent<
    RejectEarlyRepaymentProps
> = (props) => {
    const rejectEarlyRepayment = useRejectEarlyRepayment(props.loan);
    const [isModalOpen, setModalOpen] = React.useState(false);
    return (
        <>
            <Button
                type="default"
                icon={<CloseOutlined />}
                loading={rejectEarlyRepayment.isLoading}
                onClick={() => setModalOpen(true)}
            >
                Reject early repayment
            </Button>
            <Modal
                title="Reject early repayment"
                open={isModalOpen}
                onOk={() => {
                    rejectEarlyRepayment.mutate();
                    setModalOpen(false);
                }}
                onCancel={() => setModalOpen(false)}
                onClose={() => setModalOpen(false)}
            >
                Are you sure you want to reject early repayment and keep loan goin?
            </Modal>
        </>
    );
};
