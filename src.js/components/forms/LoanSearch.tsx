import * as React from "react";
import { SearchOutlined } from "@ant-design/icons";
import {
    Alert,
    Button,
    Divider,
    Form,
    Radio,
    RadioChangeEvent,
    Select,
    Space,
    Spin,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLoans } from "../context";
import { LoanList } from "../lists/LoanList";

export type SubjectType = "borrower" | "lender";
export type LoanSearchType = { subject: string; type: SubjectType };

export interface LoanSearchProps {
    self: string;
}

export const LoanSearch: React.FunctionComponent<LoanSearchProps> = (props) => {
    const [form] = Form.useForm<LoanSearchType>();

    const [search, setSearch] = React.useState<{
        borrower?: string;
        lender?: string;
    }>({
        borrower: props.self,
    });

    const type: SubjectType = Form.useWatch("type", form) || "borrower";

    const loans = useLoans(
        type === "borrower" ? props.self : undefined,
        type === "borrower" ? undefined : props.self
    );

    if (loans.isFetching) {
        return (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        );
    }

    if (loans.isError) {
        return <Alert message="Could not fetch loans" type="error" />;
    }

    if (loans.data) {
        return (
            <div>
                <Form<LoanSearchType>
                    onFinish={(values) => {
                        if (values.type === "borrower") {
                            setSearch({
                                borrower: props.self,
                                lender: values.subject,
                            });
                        } else {
                            setSearch({
                                borrower: values.subject,
                                lender: props.self,
                            });
                        }
                    }}
                    scrollToFirstError
                    form={form}
                >
                    <Form.Item<LoanSearchType>
                        label="Subject type"
                        name="subject"
                        layout="vertical"
                        initialValue="borrower"
                    >
                        <Radio.Group
                            onChange={(e: RadioChangeEvent) =>
                                form.setFieldValue("type", e.target.value)
                            }
                            value={type}
                        >
                            <Radio value="borrower">Search lenders</Radio>
                            <Radio value="lender">Search borrowers</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {loans.data.length > 0 && (
                        <Form.Item<LoanSearchType>
                            label={type === "borrower" ? "Lender" : "Borrower"}
                            name="subject"
                            layout="vertical"
                        >
                            <Select
                                options={loans.data.map((data) => ({
                                    value: data[type],
                                    label: data[type],
                                }))}
                                loading={loans.isFetching}
                                allowClear
                            />
                        </Form.Item>
                    )}
                    <Divider />
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SearchOutlined />}
                            loading={loans.isFetching}
                        >
                            Search
                        </Button>
                    </Form.Item>
                </Form>
                <LoanList
                    self={props.self}
                    borrower={search.borrower}
                    lender={search.lender}
                />
            </div>
        );
    }

    return <></>;
};
