import * as React from "react";
import { Button, Divider, Form } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import MDEditor from "@uiw/react-md-editor";
import Paragraph from "antd/es/typography/Paragraph";
import { useOnSuccess, useRequestLendingLimit } from "../context";
import { FormError } from "../utils/FormError";
import { FormSuccess } from "../utils/FormSuccess";

type RequestLendingLimitType = {
    markdown: string;
};

export const RequestLendingLimit: React.FunctionComponent = () => {
    const requestLendingLimit = useRequestLendingLimit();
    const [form] = Form.useForm<RequestLendingLimitType>();
    const markdown: string = Form.useWatch("markdown", form);

    useOnSuccess(form, requestLendingLimit);

    return (
        <Form<RequestLendingLimitType>
            scrollToFirstError
            form={form}
            onFinish={({ markdown }) => {
                requestLendingLimit.mutate(markdown);
            }}
            layout="vertical"
        >
            <Title>Loan application</Title>
            <Paragraph>
                Submit your personal information here to apply for a loan.
                Include your desired lending limit and a detailed list of your assets.
                This helps us determine the best loan options for you.
            </Paragraph>
            <FormError query={requestLendingLimit} />
            <FormSuccess query={requestLendingLimit} />
            <Form.Item<RequestLendingLimitType>
                name="markdown"
                rules={[
                    { required: true, message: "Write your loan application" },
                    { max: 5000, message: "Application cannot be longer than 5000 characters" },
                ]}
                valuePropName="value"
                label="Loan application details"
            >
                <MDEditor data-color-mode="light" />
            </Form.Item>
            <Divider />
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckCircleFilled />}
                    loading={requestLendingLimit.isLoading}
                >
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};
