import * as React from "react";
import { BankOutlined, CheckCircleFilled } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import { useRequestEarlyRepayment } from "../context";

export interface RequestEarlyRepaymentProps {
    loan: string;
    currency: React.ReactNode;
}

type RequestEarlyRepaymentType = { amount: number };

export const RequestEarlyRepayment: React.FunctionComponent<RequestEarlyRepaymentProps> = (props) => {
    const [isModalOpen, setModalOpen] = React.useState(false);
    const requestEarlyRepayment = useRequestEarlyRepayment(props.loan);
    const [form] = Form.useForm<RequestEarlyRepaymentType>();

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
                closable
                footer={null}
            >
                <Form<RequestEarlyRepaymentType> onFinish={(values) => requestEarlyRepayment.mutate(values.amount)} form={form}>
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
                                type: "number",
                            },
                        ]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
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