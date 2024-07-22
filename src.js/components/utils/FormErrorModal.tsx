import * as React from "react";
import { Modal, Alert } from "antd";

export interface FormErrorModalProps {
    message: string;
}

export const FormErrorModal: React.FunctionComponent<FormErrorModalProps> = (props) => {
    const [show, setShow] = React.useState(true);

    return (
        <Modal
            open={show}
            title="Form error"
            closable
            onCancel={() => {
                setShow(false);
            }}
            footer={null}
        >
            <Alert type="error" message={props.message} />
        </Modal>
    );
};