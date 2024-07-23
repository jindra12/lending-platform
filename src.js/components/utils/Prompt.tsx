import * as React from "react";
import { Modal, Input, Divider, Button, Form } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

export interface PromptProps {
    title: string;
    label: string;
    required: string;
    placeholder: string;
    submit: string;
    onFilled: (value: string) => void;
    children: (init: () => void) => React.ReactNode;
}

type PromptType = { text: string };

export const Prompt: React.FunctionComponent<PromptProps> = (props) => {
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [form] = Form.useForm<PromptType>();

    const close = React.useCallback(() => {
        setModalOpen(false);
    }, []);

    return (
        <>
            <Modal
                title={props.title}
                open={isModalOpen}
                onClose={close}
                onCancel={close}
                closable
                footer={null}
            >
                <Form<PromptType>
                    scrollToFirstError
                    onFinish={(values) => {
                        props.onFilled(values.text);
                        setModalOpen(false);
                    }}
                    form={form}
                >
                    <Form.Item<PromptType>
                        label={props.label}
                        name="text"
                        rules={[
                            {
                                required: true,
                                message: props.required,
                            },
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
                        >
                            {props.submit}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            {props.children(
                () => setModalOpen(true)
            )}
        </>
    );
};
