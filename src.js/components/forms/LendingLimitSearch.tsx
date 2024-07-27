import * as React from "react";
import {
    Button,
    Col,
    Descriptions,
    Divider,
    Form,
    Input,
    Row,
    Spin,
} from "antd";
import Title from "antd/es/typography/Title";
import { LoadingOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import { addressValidator, colProps, rowProps } from "../../utils";
import { CoinHint } from "../utils/CoinHint";
import { useLendingLimit } from "../context";
import { CoinDisplay } from "../utils/CoinDisplay";
import { FormError } from "../utils/FormError";
import { OwnerGuard } from "../views/OwnerGuard";

export interface LendingLimitSearchProps {
    self: string;
}

export interface LendingLimitType {
    borrower: string;
    coin?: string;
}

export const LendingLimitSearch: React.FunctionComponent<
    LendingLimitSearchProps
> = (props) => {
    const [form] = Form.useForm<LendingLimitType>();
    const [search, setSearch] = React.useState<LendingLimitType>();
    const limits = useLendingLimit();

    React.useEffect(() => {
        if (search) {
            limits.reset();
            limits.mutate(search);
        }
    }, [search]);

    return (
        <OwnerGuard self={props.self} showError>
            {() => (
                <>
                    <Form<LendingLimitType>
                        onFinish={setSearch}
                        form={form}
                        scrollToFirstError
                    >
                        <FormError query={limits} />
                        <Title>Search limit approvals</Title>
                        <Row {...rowProps}>
                            <Col {...colProps}>
                                <Form.Item<LendingLimitType>
                                    name="borrower"
                                    label="Borrower wallet"
                                    rules={[
                                        addressValidator,
                                        { required: true, message: "Set borrower address" },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col {...colProps}>
                                <Form.Item<LendingLimitType>
                                    name="coin"
                                    label="Coin address"
                                    extra={<CoinHint form={form} name="coin" defaultText="Search Ether/wei limit when empty" />}
                                    rules={[addressValidator]}
                                >
                                    <Input placeholder="ERC20 coin address" />
                                </Form.Item>
                            </Col>
                        </Row>
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
                    {limits.isLoading ? (
                        <Spin
                            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                        />
                    ) : limits.data !== undefined ? (
                        <Descriptions title="Found lending limit">
                            <Descriptions.Item label={search?.borrower}>
                                {limits.data.toString()}&nbsp;
                                {search?.coin ? (
                                    <CoinDisplay address={search.coin} tooltip />
                                ) : "Ether/wei"}
                            </Descriptions.Item>
                        </Descriptions>
                    ) : null}
                </>
            )}
        </OwnerGuard>
    );
};
