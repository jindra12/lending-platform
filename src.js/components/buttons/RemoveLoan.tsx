import * as React from "react";
import { Button, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useRemoveLoan } from "../context";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";

export interface RemoveLoanProps {
    offer: LendingPlatFormStructs.LoanOfferStructOutput;
}

export const RemoveLoan: React.FunctionComponent<
    RemoveLoanProps
> = (props) => {
    const removeLoan = useRemoveLoan(props.offer.id);
    const [isModalOpen, setModalOpen] = React.useState(false);
    return (
        <>
            <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                loading={removeLoan.isLoading}
                onClick={() => setModalOpen(true)}
            >
                Remove loan
            </Button>
            <Modal
                title="Remove loan"
                open={isModalOpen}
                onOk={() => {
                    removeLoan.mutate();
                    setModalOpen(false);
                }}
                onCancel={() => setModalOpen(false)}
                onClose={() => setModalOpen(false)}
            >
                Are you sure you want to remove this loan?
            </Modal>
        </>
    );
};
