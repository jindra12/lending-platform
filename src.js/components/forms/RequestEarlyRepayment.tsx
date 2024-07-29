import * as React from "react";
import { BankOutlined, CheckCircleFilled } from "@ant-design/icons";
import { Button, Divider, Form, Input, Modal } from "antd";
import { useOnFinish, useRequestEarlyRepayment } from "../context";
import { numberValidator } from "../../utils";
import { FormError } from "../utils/FormError";
import { FormSuccess } from "../utils/FormSuccess";

export interface RequestEarlyRepaymentProps {
    loan: string;
    currency: React.ReactNode;
    onFinished: () => void;
}

type RequestEarlyRepaymentType = { amount: number };

export const RequestEarlyRepayment: React.FunctionComponent<RequestEarlyRepaymentProps> = (props) => {
    const [isModalOpen, setModalOpen] = React.useState(false);
    const requestEarlyRepayment = useRequestEarlyRepayment(props.loan);
    const [form] = Form.useForm<RequestEarlyRepaymentType>();

    React.useEffect(() => {
        setModalOpen(false);
    }, [requestEarlyRepayment.isSuccess]);

    useOnFinish(requestEarlyRepayment, (status) => {
        if (status === "success") {
            props.onFinished();
        }
    });
    
    return (
        <>
            <Button
                type="primary"
                danger
                icon={<BankOutlined />}
                loading={requestEarlyRepayment.isLoading}
                onClick={() => setModalOpen(true)}
            >
                Request early repayment
            </Button>
            <Modal
                title="Request early repayment"
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                onCancel={() => setModalOpen(false)}
                closable
                footer={null}
            >
                <Form<RequestEarlyRepaymentType> scrollToFirstError onFinish={(values) => {
                    requestEarlyRepayment.mutate(values.amount);
                    setModalOpen(false);
                }} form={form}>
                    <FormError query={requestEarlyRepayment} />
                    <FormSuccess query={requestEarlyRepayment} />
                    <Form.Item<RequestEarlyRepaymentType>
                        label={(
                            <>
                                Requesting amount {props.currency}
                            </>
                        )}
                        name="amount"
                        rules={[
                            {
                                required: true,
                                message: "No requesting amount specified",
                            },
                            numberValidator
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Divider />
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<CheckCircleFilled />}
                            loading={requestEarlyRepayment.isLoading}
                        >
                            Request early repayment
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
};