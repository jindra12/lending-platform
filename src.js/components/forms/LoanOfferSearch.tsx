import * as React from "react";
import { Button, Checkbox, Collapse, Form, Input, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { addressValidator } from "../../utils";
import { CoinHint } from "../utils/CoinHint";

export interface LoanSearchProps {
    setSearchParams: (
        search: LendingPlatFormStructs.LoanOfferSearchStruct
    ) => void;
    isFetching?: boolean;
}

export const LoanOfferSearch: React.FunctionComponent<LoanSearchProps> = (props) => {
    const [form] = Form.useForm<LendingPlatFormStructs.LoanOfferSearchStruct>();
    return (
        <Form<LendingPlatFormStructs.LoanOfferSearchStruct>
            onFinish={props.setSearchParams}
            form={form}
        >
            <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                name="from"
                label="Lender wallet"
                rules={[addressValidator]}
            >
                <Input />
            </Form.Item>
            <Space.Compact>
                <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                    name={["amount", 0]}
                    label="Minimum borrow amount"
                    noStyle
                    rules={[{ type: "number", message: "Set minimum amount as number" }]}
                >
                    <Input type="number" />
                </Form.Item>
                <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                    name={["amount", 1]}
                    label="Maximum borrow amount"
                    rules={[{ type: "number", message: "Set maximum amount as number" }]}
                    noStyle
                >
                    <Input type="number" />
                </Form.Item>
            </Space.Compact>
            <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                name="includeEth"
                label="Eth loan"
                rules={[{ required: true }]}
            >
                <Checkbox defaultChecked />
            </Form.Item>
            <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                name="includeCollateralEth"
                label="Eth collateral loan"
                rules={[{ required: true }]}
            >
                <Checkbox defaultChecked />
            </Form.Item>
            <Form.List name="coins">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space
                                key={key}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                            >
                                <Form.Item
                                    {...restField}
                                    name={name}
                                    label="ER20 address"
                                    help={<CoinHint form={form} name={["coins", name]} />}
                                    rules={[{ required: true, message: "Missing coin address" }, addressValidator]}
                                >
                                    <Input placeholder="ERC20 coin address" />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} />
                            </Space>
                        ))}
                        <Form.Item>
                            <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                            >
                                Add another coin address to search
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <Form.List name="collateralCoins">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space
                                key={key}
                                style={{ display: "flex", marginBottom: 8 }}
                                align="baseline"
                            >
                                <Form.Item
                                    {...restField}
                                    name={name}
                                    label="ER20 collateral address"
                                    help={<CoinHint form={form} name={["coins", name]} />}
                                    rules={[{ required: true, message: "Missing coin address" }, addressValidator]}
                                >
                                    <Input placeholder="ERC20 coin address" />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} />
                            </Space>
                        ))}
                        <Form.Item>
                            <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                            >
                                Add another coin address to search as collateral
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <Space.Compact>
                <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                    name={["toBePaid", 0]}
                    label="Minimum to be paid in total"
                    noStyle
                    rules={[{ type: "number", message: "Set minimum total as number" }]}
                >
                    <Input type="number" />
                </Form.Item>
                <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                    name={["toBePaid", 1]}
                    label="Maximum to be paid in total"
                    rules={[{ type: "number", message: "Set maximum total as number" }]}
                    noStyle
                >
                    <Input type="number" />
                </Form.Item>
            </Space.Compact>
            <Space.Compact>
                <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                    name={["singlePayment", 0]}
                    label="Minimum single payment"
                    noStyle
                    rules={[{ type: "number", message: "Set single payment as number" }]}
                >
                    <Input type="number" />
                </Form.Item>
                <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                    name={["singlePayment", 1]}
                    label="Maximum single payment"
                    rules={[{ type: "number", message: "Set single payment as number" }]}
                    noStyle
                >
                    <Input type="number" />
                </Form.Item>
            </Space.Compact>
            <Space.Compact>
                <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                    name={["collateral", 0]}
                    label="Minimum loan collateral"
                    noStyle
                    rules={[{ type: "number", message: "Set loan collateral as number" }]}
                >
                    <Input type="number" />
                </Form.Item>
                <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                    name={["collateral", 1]}
                    label="Maximum loan collateral"
                    rules={[{ type: "number", message: "Set loan collateral as number" }]}
                    noStyle
                >
                    <Input type="number" />
                </Form.Item>
            </Space.Compact>
            <Collapse
                collapsible="header"
                items={[
                    {
                        key: "Details",
                        children: (
                            <>
                                <Space.Compact>
                                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                        name={["interval", 0]}
                                        label="Minimum payment interval (in days)"
                                        noStyle
                                        rules={[{ type: "number", message: "Set interval as number" }]}
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                        name={["interval", 1]}
                                        label="Maximum payment interval (in days)"
                                        rules={[{ type: "number", message: "Set interval as number" }]}
                                        noStyle
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                </Space.Compact>
                                <Space.Compact>
                                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                        name={["defaultLimit", 0]}
                                        label="Minimum default time until default after last payment (in days)"
                                        noStyle
                                        rules={[{ type: "number", message: "Set default limit as number" }]}
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                        name={["defaultLimit", 1]}
                                        label="Maximum default time until default after last payment (in days)"
                                        rules={[{ type: "number", message: "Set default limit as number" }]}
                                        noStyle
                                    >
                                        <Input type="number" />
                                    </Form.Item>
                                </Space.Compact>
                            </>
                        )
                    }
                ]}
            />
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    loading={props.isFetching}
                >
                    Search
                </Button>
            </Form.Item>
        </Form>
    );
};
