import * as React from "react";
import { Alert, Button, Col, Form, Input, Row, Spin } from "antd";
import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
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
        return <Alert message="Application fee error" type="error" />;
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
            <Title>Application fee form</Title>
            <FormError query={setLoanFee} />
            <FormSuccess query={setLoanFee} />
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<LoanFeeType>
                        name="amount"
                        label="Application fee in Ether/wei"
                        initialValue={loanFee.data?.toString()}
                        rules={[
                            {
                                required: true,
                                message: "Set application fee in wei",
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
                            Set application fee
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};
