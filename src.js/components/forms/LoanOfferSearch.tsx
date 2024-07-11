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
    isFetching?: boolean;
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
                        name={["amount", 0]}
                        label="Minimum borrow amount"
                        rules={[
                            { required: true, message: "Set minimum amount" },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["amount", 1]}
                        label="Maximum borrow amount"
                        rules={[
                            { required: true, message: "Set maximum amount" },
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
                        name={["toBePaid", 0]}
                        label="Minimum to be paid in total"
                        rules={[
                            { type: "number", message: "Set minimum total as number" },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["toBePaid", 1]}
                        label="Maximum to be paid in total"
                        rules={[
                            { type: "number", message: "Set maximum total as number" },
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
                        name={["singlePayment", 0]}
                        label="Minimum single payment"
                        rules={[
                            { type: "number", message: "Set single payment as number" },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>

                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["singlePayment", 1]}
                        label="Maximum single payment"
                        rules={[
                            { type: "number", message: "Set single payment as number" },
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
                        name={["collateral", 0]}
                        label="Minimum loan collateral"
                        rules={[
                            { type: "number", message: "Set loan collateral as number" },
                            numberValidator,
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Col>

                <Col {...colProps}>
                    <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                        name={["collateral", 1]}
                        label="Maximum loan collateral"
                        rules={[
                            { type: "number", message: "Set loan collateral as number" },
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
                                            name={["interval", 0]}
                                            label="Minimum payment interval (in days)"
                                            rules={[
                                                { type: "number", message: "Set interval as number" },
                                                numberValidator,
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>

                                    <Col {...colProps}>
                                        <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                            name={["interval", 1]}
                                            label="Maximum payment interval (in days)"
                                            rules={[
                                                { type: "number", message: "Set interval as number" },
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
                                            name={["defaultLimit", 0]}
                                            label="Minimum default time until default after last payment (in days)"
                                            rules={[
                                                {
                                                    type: "number",
                                                    message: "Set default limit as number",
                                                },
                                                numberValidator,
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>

                                    <Col {...colProps}>
                                        <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct>
                                            name={["defaultLimit", 1]}
                                            label="Maximum default time until default after last payment (in days)"
                                            rules={[
                                                {
                                                    type: "number",
                                                    message: "Set default limit as number",
                                                },
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
                    loading={props.isFetching}
                >
                    Search
                </Button>
            </Form.Item>
        </Form>
    );
};
