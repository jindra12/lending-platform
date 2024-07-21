import * as React from "react";
import { Button, Divider, Form } from "antd";
import { InboxOutlined, CheckCircleFilled } from "@ant-design/icons";
import { useOnSuccess, useRequestLendingLimit } from "../context";
import Dragger from "antd/es/upload/Dragger";
import { FormError } from "../utils/FormError";
import { FormSuccess } from "../utils/FormSuccess";

type RequestLendingLimitType = {
    files: File[];
};

export const RequestLendingLimit: React.FunctionComponent = () => {
    const requestLendingLimit = useRequestLendingLimit();
    const [form] = Form.useForm<RequestLendingLimitType>();

    useOnSuccess(form, requestLendingLimit);

    return (
        <Form<RequestLendingLimitType>
            scrollToFirstError
            form={form}
            onFinish={({ files }) => {
                requestLendingLimit.mutate(files);
            }}
        >
            <FormError query={requestLendingLimit} />
            <FormSuccess query={requestLendingLimit} />
            <Form.Item<RequestLendingLimitType>
                name="files"
                rules={[
                    { required: true, message: "Upload file request for loan limit" },
                ]}
            >
                <Dragger name="files" multiple={false}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                        Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                        Upload a single PDF file with information about yourself and the
                        loan limit request
                    </p>
                </Dragger>
            </Form.Item>
            <Divider />
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckCircleFilled />}
                    loading={requestLendingLimit.isLoading}
                >
                    Approve
                </Button>
            </Form.Item>
        </Form>
    );
};
