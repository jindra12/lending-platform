import * as React from "react";
import {
    Button,
    Checkbox,
    Col,
    Collapse,
    Divider,
    Form,
    Input,
    Row,
    Space,
} from "antd";
import {
    MinusCircleOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import {
    addressValidator,
    colProps,
    numberValidator,
    rowProps,
} from "../../utils";
import { CoinHint } from "../utils/CoinHint";

export interface LoanSearchProps {
    setSearchParams: (
        search: LendingPlatFormStructs.LoanOfferSearchStruct
    ) => void;
}

export const LoanOfferSearch: React.FunctionComponent<LoanSearchProps> = (
    props
) => {
    const [form] = Form.useForm<LendingPlatFormStructs.LoanOfferSearchStruct>();
    return (
        <Form<LendingPlatFormStructs.LoanOfferSearchStruct>
            onFinish={props.setSearchParams}
            form={form}
            scrollToFirstError
        >
            <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                name="from"
                label="Lender wallet"
                rules={[addressValidator]}
            >
                <Input />
            </Form.Item>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["amount", "min"]}
                        label="Minimum lent amount"
                        rules={[
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["amount", "max"]}
                        label="Maximum lent amount"
                        rules={[
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name="includeEth"
                        label="Eth loan"
                        valuePropName="checked"
                    >
                        <Checkbox defaultChecked />
                    </Form.Item>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name="includeCollateralEth"
                        label="Eth collateral loan"
                        valuePropName="checked"
                    >
                        <Checkbox defaultChecked />
                    </Form.Item>
                </Col>
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
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
                                            extra={<CoinHint form={form} name={["coins", name]} />}
                                            rules={[
                                                { required: true, message: "Missing coin address" },
                                                addressValidator,
                                            ]}
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
                </Col>
                <Col {...colProps}>
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
                                            extra={<CoinHint form={form} name={["coins", name]} />}
                                            rules={[
                                                { required: true, message: "Missing coin address" },
                                                addressValidator,
                                            ]}
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
                </Col>
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["toBePaid", "min"]}
                        label="Minimum to be paid in total"
                        rules={[
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["toBePaid", "max"]}
                        label="Maximum to be paid in total"
                        rules={[
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["singlePayment", "min"]}
                        label="Minimum single payment"
                        rules={[
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>

                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["singlePayment", "max"]}
                        label="Maximum single payment"
                        rules={[
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row {...rowProps}>
                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["collateral", "min"]}
                        label="Minimum loan collateral"
                        rules={[
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>

                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["collateral", "max"]}
                        label="Maximum loan collateral"
                        rules={[
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Collapse
                collapsible="header"
                items={[
                    {
                        key: "Details",
                        label: "Details",
                        children: (
                            <>
                                <Row {...rowProps}>
                                    <Col {...colProps}>
                                        <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                            name={["interval", "min"]}
                                            label="Minimum payment interval (in days)"
                                            rules={[
                                                numberValidator,
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>

                                    <Col {...colProps}>
                                        <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                            name={["interval", "max"]}
                                            label="Maximum payment interval (in days)"
                                            rules={[
                                                numberValidator,
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row {...rowProps}>
                                    <Col {...colProps}>
                                        <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                            name={["defaultLimit", "min"]}
                                            label="Minimum default time until default after last payment (in days)"
                                            rules={[
                                                numberValidator,
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>

                                    <Col {...colProps}>
                                        <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                            name={["defaultLimit", "max"]}
                                            label="Maximum default time until default after last payment (in days)"
                                            rules={[
                                                numberValidator,
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        ),
                    },
                ]}
            />
            <Divider />
            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                >
                    Search
                </Button>
            </Form.Item>
        </Form>
    );
};
