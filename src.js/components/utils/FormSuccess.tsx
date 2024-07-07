import { Alert, Modal } from "antd";
import * as React from "react";
import { UseMutationResult, UseQueryResult } from "react-query";

export interface FormSuccessProps {
    query: UseQueryResult | UseMutationResult;
}

export const FormSuccess: React.FunctionComponent<FormSuccessProps> = (
    props
) => {
    const [show, setShow] = React.useState(false);
    React.useEffect(() => {
        if (props.query.isSuccess) {
            setShow(true);
        }
    }, [props.query.isSuccess]);

    return (
        <Modal
            open={show}
            title="Form submission"
            closable
            onCancel={() => {
                setShow(false);
            }}
            footer={null}
        >
            <Alert type="success" message="Submit successful!" />
        </Modal>
    );
};
