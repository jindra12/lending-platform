import * as React from "react";
import { Button, Modal } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useAcceptLoan, useOnFinish } from "../context";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { FormSuccess } from "../utils/FormSuccess";
import { FormError } from "../utils/FormError";

export interface AcceptLoanProps {
    offer: LendingPlatFormStructs.LoanOfferStructOutput;
}

export const AcceptLoan: React.FunctionComponent<
    AcceptLoanProps
> = (props) => {
    const acceptLoan = useAcceptLoan(props.offer);
    const [isModalOpen, setModalOpen] = React.useState(false);

    useOnFinish(acceptLoan, () => setModalOpen(false));

    return (
        <>
            <FormSuccess query={acceptLoan} />
            <FormError query={acceptLoan} asModal />
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
                    acceptLoan.mutate({});
                }}
                okButtonProps={{ loading: acceptLoan.isLoading }}
                onCancel={() => setModalOpen(false)}
                onClose={() => setModalOpen(false)}
            >
                Are you sure you want to take out this loan?
            </Modal>
        </>
    );
};
