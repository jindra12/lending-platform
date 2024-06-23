import * as React from "react";
import { Flex, Form, Input, Radio, Space } from "antd";
import { useIssueLoan } from "../context";
import { FormLoanIssuance } from "../../types";
import { addressValidator, convertLoanIssuanceToApi } from "../../utils";
import { CoinDisplay } from "../utils/CoinDisplay";

export const IssueLoan: React.FunctionComponent = () => {
    const approve = useIssueLoan();
    const [form] = Form.useForm<FormLoanIssuance>();
    const type: FormLoanIssuance["type"] = form.getFieldValue("type");
    const coin: FormLoanIssuance["coin"] = form.getFieldValue("coin");

    return (
        <Form<FormLoanIssuance> form={form} onFinish={(values) => approve.mutate(convertLoanIssuanceToApi(values))}>
            <Form.Item<FormLoanIssuance> label="Loan type" name="type">
                <Flex vertical gap="middle">
                    <Radio.Group defaultValue="EthEth" buttonStyle="solid">
                        <Radio.Button value="EthEth">Lend Ether with Ether collateral</Radio.Button>
                        <Radio.Button value="EthCoin">Lend Ether with ERC20 collateral</Radio.Button>
                        <Radio.Button value="CoinEth">Lend ERC20 with Ether collateral</Radio.Button>
                        <Radio.Button value="CoinCoin">Lend ERC20 with another ERC20 as collateral</Radio.Button>
                    </Radio.Group>
                </Flex>
            </Form.Item>
            <Space.Compact>
                <Form.Item<FormLoanIssuance>
                    name="coin"
                    label="Currency"
                    hidden={type === "EthEth" || type === "CoinEth"}
                    noStyle
                    help={coin ? <CoinDisplay address={coin} /> : undefined}
                    rules={[{ required: true, message: "Set ERC20 coin address" }, addressValidator]}
                >
                    <Input />
                </Form.Item>
                <Form.Item<FormLoanIssuance>
                    name="collateralCoin"
                    label="Currency of collateral"
                    hidden={type === "EthEth" || type === "EthCoin"}
                    noStyle
                    help={coin ? <CoinDisplay address={coin} /> : undefined}
                    rules={[{ required: true, message: "Set ERC20 coin address" }, addressValidator]}
                >
                    <Input />
                </Form.Item>
            </Space.Compact>
            <Space.Compact>
                <Form.Item<FormLoanIssuance>
                    label="Lend amount"
                    name="amount"
                    help="Will be taken out of your account when submitted"
                    noStyle
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
                <Form.Item<FormLoanIssuance>
                    label="Final amount to be paid back"
                    name="toBePaid"
                    help="Borrower will pay this amount to lender"
                    noStyle
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
            </Space.Compact>
            <Space.Compact>
                <Form.Item<FormLoanIssuance>
                    label="Payment interval"
                    name="interval"
                    noStyle
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
                <Form.Item<FormLoanIssuance>
                    label="Number of days after loan can default"
                    name="defaultLimit"
                    noStyle
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
            </Space.Compact>
            <Space.Compact>
                <Form.Item<FormLoanIssuance>
                    label="Single loan payment"
                    name="singlePayment"
                    noStyle
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
                <Form.Item<FormLoanIssuance>
                    label="Loan collateral"
                    name="collateral"
                    noStyle
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
            </Space.Compact>
        </Form>
    );
};
