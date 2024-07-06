import * as React from "react";
import { Button, Col, Form, Input, Row } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useLoanFee } from "../context";
import { colProps, numberValidator, rowProps } from "../../utils";

type LoanFeeType = { amount: number };

export const ChangeLoanFee: React.FunctionComponent = () => {
    const loanFee = useLoanFee();
    const [form] = Form.useForm<LoanFeeType>();
    return (
        <Form<LoanFeeType>
            form={form}
            onFinish={({ amount }) => loanFee.mutate(amount)}
        >
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<LoanFeeType>
                        name="amount"
                        label="Loan approval fee in wei"
                        rules={[
                            {
                                required: true,
                                message: "Set loan fee in wei",
                                type: "number",
                            },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<CheckCircleFilled />}
                            loading={loanFee.isLoading}
                        >
                            Set fee for loan approval
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};
