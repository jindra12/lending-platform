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

    const [borrower, setBorrower] = React.useState<string>(props.self);
    const [lender, setLender] = React.useState<string>();

    const type: SubjectType = Form.useWatch("type", form) || "borrower";

    const loans = useLoans(
        type === "borrower" ? props.self : undefined,
        type === "borrower" ? undefined : props.self
    );

    return (
        <div>
            {loans.isError && (
                <Alert message="Could not fetch loans" type="error" />
            )}
            <Form<LoanSearchType>
                onFinish={(values) => {
                    if (values.type === "borrower") {
                        setBorrower(props.self);
                        setLender(values.subject);
                    } else {
                        setBorrower(values.subject);
                        setLender(props.self);
                    }
                }}
                scrollToFirstError
                form={form}
            >
                <Form.Item<LoanSearchType>
                    label="Subject type"
                    name="type"
                    layout="vertical"
                    initialValue="borrower"
                >
                    <Radio.Group
                        onChange={(e: RadioChangeEvent) =>
                            form.setFieldValue("type", e.target.value)
                        }
                        value={type}
                        disabled={loans.isFetching}
                    >
                        <Radio value="borrower">Search lenders</Radio>
                        <Radio value="lender">Search borrowers</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item<LoanSearchType>
                    label={type === "borrower" ? "Lender" : "Borrower"}
                    name="subject"
                    layout="vertical"
                >
                    <Select
                        options={loans.data?.map((data) => ({
                            value: data[type],
                            label: data[type],
                        })) || []}
                        loading={loans.isFetching}
                        disabled={!loans.data?.length}
                        allowClear
                    />
                </Form.Item>
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
                borrower={borrower}
                lender={lender}
            />
        </div>
    );
};
