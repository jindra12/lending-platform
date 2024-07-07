import * as React from "react";
import { Button, Modal } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useAcceptLoan } from "../context";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";

export interface AcceptLoanProps {
    offer: LendingPlatFormStructs.LoanOfferStructOutput;
}

export const AcceptLoan: React.FunctionComponent<
    AcceptLoanProps
> = (props) => {
    const acceptLoan = useAcceptLoan(props.offer);
    const [isModalOpen, setModalOpen] = React.useState(false);
    return (
        <>
            <Button
                type="primary"
                danger
                icon={<BankOutlined />}
                loading={acceptLoan.isLoading}
                onClick={() => setModalOpen(true)}
            >
                Accept loan
            </Button>
            <Modal
                title="Accept loan"
                open={isModalOpen}
                onOk={() => {
                    acceptLoan.mutate();
                    setModalOpen(false);
                }}
                onCancel={() => setModalOpen(false)}
                onClose={() => setModalOpen(false)}
            >
                Are you sure you want to take out this loan?
            </Modal>
        </>
    );
};
