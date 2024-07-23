import * as React from "react";
import {
    Button,
    Col,
    Form,
    Input,
    Radio,
    Row,
    Space,
} from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { useIssueLoan, useOnSuccess } from "../context";
import { FormLoanIssuance } from "../../types";
import {
    addressValidator,
    colProps,
    convertLoanIssuanceToApi,
    numberValidator,
    rowProps,
} from "../../utils";
import { CoinDisplay } from "../utils/CoinDisplay";
import FormItem from "antd/es/form/FormItem";
import { FormError } from "../utils/FormError";
import { FormSuccess } from "../utils/FormSuccess";

export interface IssueLoanProps {
    self: string;
}

export const IssueLoan: React.FunctionComponent<IssueLoanProps> = (props) => {
    const issue = useIssueLoan();
    const [form] = Form.useForm<FormLoanIssuance>();
    const type: FormLoanIssuance["type"] = Form.useWatch("type", form);
    const coin: FormLoanIssuance["coin"] = Form.useWatch("coin", form);
    const collateralCoin: FormLoanIssuance["collateralCoin"] = Form.useWatch("collateralCoin", form);

    useOnSuccess(form, issue);

    return (
        <Form<FormLoanIssuance>
            form={form}
            onFinish={(values) => {
                const converted = convertLoanIssuanceToApi(values);
                issue.mutate(converted);
            }}
            layout="horizontal"
            scrollToFirstError
        >
            <Title>Issue loan</Title>
            <FormSuccess query={issue} />
            <FormError query={issue} />
            <Form.Item<FormLoanIssuance> label="Loan type" name="type" initialValue="EthEth">
                <Radio.Group
                    value={type}
                    onChange={(e) => form.setFieldValue("type", e.target.value)}
                >
                    <Space direction="vertical">
                        <Radio value="EthEth">
                            Ether/wei with Ether/wei collateral
                        </Radio>
                        <Radio value="EthCoin">
                            Ether/wei with ERC20 collateral
                        </Radio>
                        <Radio value="CoinEth">
                            ERC20 with Ether/wei collateral
                        </Radio>
                        <Radio value="CoinCoin">
                            ERC20 with ERC20 collateral
                        </Radio>
                    </Space>
                </Radio.Group>
            </Form.Item>
            <Row {...rowProps}>
                {(type === "CoinEth" || type === "CoinCoin") && (
                    <Col {...colProps}>
                        <Form.Item<FormLoanIssuance>
                            name="coin"
                            label="Currency"
                            layout="vertical"
                            extra={coin ? <CoinDisplay address={coin} balanceOf={props.self} /> : undefined}
                            rules={[
                                { required: true, message: "Set ERC20 coin address" },
                                addressValidator,
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                )}
                {(type === "EthCoin" || type === "CoinCoin") && (
                    <Col {...colProps}>
                        <Form.Item<FormLoanIssuance>
                            name="collateralCoin"
                            layout="vertical"
                            label="Currency of collateral"
                            extra={collateralCoin ? <CoinDisplay address={collateralCoin} /> : undefined}
                            rules={[
                                { required: true, message: "Set ERC20 coin address" },
                                addressValidator,
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                )}
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        label="Lend amount"
                        name="amount"
                        layout="vertical"
                        extra="Will be taken out of your account when submitted"
                        rules={[
                            {
                                required: true,
                                message: "No loanable amount specified",
                            },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        label="Final amount to be paid back"
                        name="toBePaid"
                        layout="vertical"
                        extra="Borrower will pay this amount to lender"
                        rules={[
                            {
                                required: true,
                                message: "Specify final amount",
                            },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        label="Payment interval in days"
                        name="interval"
                        layout="vertical"
                        rules={[
                            {
                                required: true,
                                message: "No interval specified",
                            },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        label="Number of days after loan can default"
                        name="defaultLimit"
                        layout="vertical"
                        rules={[
                            {
                                required: true,
                                message: "No default limit specified",
                            },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        label="Single loan payment"
                        name="singlePayment"
                        layout="vertical"
                        rules={[
                            {
                                required: true,
                                message: "No single payment specified",
                            },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        label="Loan collateral"
                        name="collateral"
                        layout="vertical"
                        rules={[
                            {
                                required: true,
                                message: "No collateral specified",
                            },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <FormItem>
                <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckCircleFilled />}
                    loading={issue.isLoading}
                >
                    Approve
                </Button>
            </FormItem>
        </Form>
    );
};
