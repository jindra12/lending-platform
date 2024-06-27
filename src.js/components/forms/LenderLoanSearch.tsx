import * as React from "react";
import { SearchOutlined } from "@ant-design/icons"
import { Alert, Button, Form, Select, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLoans } from "../context";

export type LenderLoanSearchType = { borrower: string; lender: string; };

export interface LenderLoanSearchProps {
    self: string;
    setLender: (lender: string) => void;
}

export const LenderLoanSearch: React.FunctionComponent<LenderLoanSearchProps> = (props) => {
    const [form] = Form.useForm<LenderLoanSearchType>();

    const loans = useLoans(props.self);

    if (loans.isFetching) {
        return <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    }

    if (loans.isError) {
        return (
            <Alert
                message="Could not fetch your loans"
                type="error"
            />
        );
    }

    if (loans.data) {
        return (
            <Form<LenderLoanSearchType> onFinish={({ lender }) => props.setLender(lender)} form={form}>
                <Form.Item<LenderLoanSearchType>
                    label="Lender"
                    name="lender"
                >
                    <Select options={loans.data.map((data) => ({
                        value: data.lender,
                        
                    }))} loading={!loans.data} />;
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SearchOutlined />}
                        loading={loans.isFetching}
                    >
                        Approve
                    </Button>
                </Form.Item>
            </Form>
        )
    }

    return <></>;
};
