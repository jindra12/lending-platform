import * as React from "react";
import { Button, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useOnFinish, useRemoveLoan } from "../context";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { FormSuccess } from "../utils/FormSuccess";
import { FormError } from "../utils/FormError";

export interface RemoveLoanProps {
    offer: LendingPlatFormStructs.LoanOfferStructOutput;
}

export const RemoveLoan: React.FunctionComponent<
    RemoveLoanProps
> = (props) => {
    const removeLoan = useRemoveLoan(props.offer.id);
    const [isModalOpen, setModalOpen] = React.useState(false);

    useOnFinish(removeLoan, () => setModalOpen(false));

    return (
        <>
            <FormSuccess query={removeLoan} />
            <FormError query={removeLoan} asModal />
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
                }}
                okButtonProps={{ loading: removeLoan.isLoading }}
                onCancel={() => setModalOpen(false)}
                onClose={() => setModalOpen(false)}
            >
                Are you sure you want to remove this loan?
            </Modal>
        </>
    );
};
