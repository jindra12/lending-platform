import * as React from "react";
import { Alert, Button, Col, Form, Input, Row, Spin } from "antd";
import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { useLoanFee, useSetLoanFee } from "../context";
import { colProps, numberValidator, rowProps } from "../../utils";
import { FormError } from "../utils/FormError";
import { FormSuccess } from "../utils/FormSuccess";

type LoanFeeType = { amount: number };

export const ChangeLoanFee: React.FunctionComponent = () => {
    const setLoanFee = useSetLoanFee();
    const loanFee = useLoanFee();
    const [form] = Form.useForm<LoanFeeType>();
    
    if (loanFee.isFetching) {
        return (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        );
    }

    if (loanFee.isError) {
        return <Alert message="Could not fetch loan detail" type="error" />;
    }

    return (
        <Form<LoanFeeType>
            form={form}
            onFinish={async ({ amount }) => {
                await setLoanFee.mutateAsync(amount);
                form.resetFields();
                loanFee.remove();
                loanFee.refetch();
            }}
            scrollToFirstError
        >
            <FormError query={setLoanFee} />
            <FormSuccess query={setLoanFee} />
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<LoanFeeType>
                        name="amount"
                        label="Loan approval fee in wei"
                        initialValue={loanFee.data?.toString()}
                        rules={[
                            {
                                required: true,
                                message: "Set loan fee in wei",
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
                            loading={setLoanFee.isLoading}
                        >
                            Set fee for loan approval
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};
