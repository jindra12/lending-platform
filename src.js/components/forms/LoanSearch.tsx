import * as React from "react";
import { SearchOutlined } from "@ant-design/icons";
import {
    Alert,
    Button,
    Col,
    Divider,
    Form,
    Radio,
    RadioChangeEvent,
    Row,
    Select,
} from "antd";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import { useLoans } from "../context";
import { LoanList } from "../lists/LoanList";
import { colProps, rowProps } from "../../utils";

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
            {loans.isError && <Alert message="Could not fetch loans" type="error" />}
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
                <Title>Track your loans</Title>
                <Paragraph>
                    Welcome to our decentralized lending platform!
                    Here, you can easily track your borrowed and lent amounts, view transaction history, and manage your loans—all in one place.
                    Enjoy seamless access to your financial data with complete privacy and security.
                </Paragraph>
                <Row {...rowProps}>
                    <Col {...colProps}>
                        <Form.Item<LoanSearchType>
                            label="Search by lender or borrower"
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
                    </Col>
                    <Col {...colProps}>
                        <Form.Item<LoanSearchType>
                            label={type === "borrower" ? "Lender" : "Borrower"}
                            name="subject"
                            layout="vertical"
                        >
                            <Select
                                options={
                                    loans.data?.map((data) => ({
                                        value: data[type === "borrower" ? "from" : "to"],
                                        label: data[type === "borrower" ? "from" : "to"],
                                    })) || []
                                }
                                loading={loans.isFetching}
                                disabled={!loans.data?.length}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row>
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
            <LoanList self={props.self} borrower={borrower} lender={lender} />
        </div>
    );
};
