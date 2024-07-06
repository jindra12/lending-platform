import * as React from "react";
import {
    Button,
    Col,
    Flex,
    Form,
    Input,
    Radio,
    Row,
    Space,
} from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useIssueLoan } from "../context";
import { FormLoanIssuance } from "../../types";
import {
    addressValidator,
    colProps,
    convertLoanIssuanceToApi,
    rowProps,
} from "../../utils";
import { CoinDisplay } from "../utils/CoinDisplay";
import FormItem from "antd/es/form/FormItem";

export const IssueLoan: React.FunctionComponent = () => {
    const issue = useIssueLoan();
    const [form] = Form.useForm<FormLoanIssuance>();
    const type: FormLoanIssuance["type"] = Form.useWatch("type", form) || "EthEth";
    const coin: FormLoanIssuance["coin"] = Form.useWatch("coin", form);

    return (
        <Form<FormLoanIssuance>
            form={form}
            onFinish={(values) => issue.mutate(convertLoanIssuanceToApi(values))}
            layout="horizontal"
        >
            <Form.Item<FormLoanIssuance> label="Loan type" name="type">
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
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        name="coin"
                        label="Currency"
                        layout="vertical"
                        hidden={type === "EthEth" || type === "CoinEth"}
                        help={coin ? <CoinDisplay address={coin} /> : undefined}
                        rules={[
                            { required: true, message: "Set ERC20 coin address" },
                            addressValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        name="collateralCoin"
                        layout="vertical"
                        label="Currency of collateral"
                        hidden={type === "EthEth" || type === "EthCoin"}
                        help={coin ? <CoinDisplay address={coin} /> : undefined}
                        rules={[
                            { required: true, message: "Set ERC20 coin address" },
                            addressValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        label="Lend amount"
                        name="amount"
                        layout="vertical"
                        help="Will be taken out of your account when submitted"
                        rules={[
                            {
                                required: true,
                                message: "No loanable amount specified",
                                type: "number",
                            },
                        ]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        label="Final amount to be paid back"
                        name="toBePaid"
                        layout="vertical"
                        help="Borrower will pay this amount to lender"
                        rules={[
                            {
                                required: true,
                                message: "Specify final amount",
                                type: "number",
                            },
                        ]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Col>
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<FormLoanIssuance>
                        label="Payment interval"
                        name="interval"
                        layout="vertical"
                        rules={[
                            {
                                required: true,
                                message: "No interval specified",
                                type: "number",
                            },
                        ]}
                    >
                        <Input type="number" />
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
                                type: "number",
                            },
                        ]}
                    >
                        <Input type="number" />
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
                                type: "number",
                            },
                        ]}
                    >
                        <Input type="number" />
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
                                type: "number",
                            },
                        ]}
                    >
                        <Input type="number" />
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
