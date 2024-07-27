import * as React from "react";
import { Button, Divider, Form } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import MDEditor from "@uiw/react-md-editor";
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
            <Title>Lending request form</Title>
            <FormError query={requestLendingLimit} />
            <FormSuccess query={requestLendingLimit} />
            <Form.Item<RequestLendingLimitType>
                name="markdown"
                rules={[
                    { required: true, message: "Write your lending limit request" },
                    { max: 5000, message: "Request cannot be longer than 5000 characters" },
                ]}
                valuePropName="value"
                label="Loan request details"
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
