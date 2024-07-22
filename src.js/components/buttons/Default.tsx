import * as React from "react";
import { Button, Modal } from "antd";
import { WarningFilled } from "@ant-design/icons";
import { useDefault, useOnFinish } from "../context";
import { FormSuccess } from "../utils/FormSuccess";
import { FormError } from "../utils/FormError";

export interface DefaultProps {
    loan: string;
}

export const Default: React.FunctionComponent<
    DefaultProps
> = (props) => {
    const setDefault = useDefault(props.loan);
    const [isModalOpen, setModalOpen] = React.useState(false);

    useOnFinish(setDefault, () => setModalOpen(false));

    return (
        <>
            <FormSuccess query={setDefault} />
            <FormError query={setDefault} asModal />
            <Button
                type="primary"
                danger
                icon={<WarningFilled />}
                loading={setDefault.isLoading}
                onClick={() => setModalOpen(true)}
            >
                Default loan
            </Button>
            <Modal
                title="Default loan"
                open={isModalOpen}
                onOk={async () => {
                    setDefault.mutate();
                }}
                okButtonProps={{ loading: setDefault.isLoading }}
                onCancel={() => setModalOpen(false)}
                onClose={() => setModalOpen(false)}
            >
                Are you sure you want the borrower to default on the loan and get the loan collateral?
            </Modal>
        </>
    );
};
