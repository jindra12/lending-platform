import * as React from "react";
import { Form, Input } from "antd";
import { LendingPlatFormStructs } from "../../contracts/LendingPlatform.sol/LendingPlatformAbi";
import { addressValidator } from "../../utils";

export interface LoanSearchProps {
    setSearchParams: (search: LendingPlatFormStructs.LoanOfferSearchStruct) => void;
}

export const LoanSearch: React.FunctionComponent<LoanSearchProps> = (props) => {
    const [form] = Form.useForm<LendingPlatFormStructs.LoanOfferSearchStruct>();
    return (
        <Form<LendingPlatFormStructs.LoanOfferSearchStruct> onFinish={props.setSearchParams} form={form}>
            <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct> name="from" label="Lender wallet" rules={[addressValidator]}>
                <Input />
            </Form.Item>
            <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct> name={["amount", 0]} label="Minimum borrow amount" rules={[{ type: "number", message: "Set minimum amount as number" }]}>
                <Input type="number" />
            </Form.Item>
            <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct> name={["amount", 1]} label="Maximum borrow amount" rules={[{ type: "number", message: "Set maximum amount as number" }]}>
                <Input type="number" />
            </Form.Item>
            <Form.Item<LendingPlatFormStructs.LoanOfferSearchStruct> name="coins" label="ERC20 coins selection">
                
            </Form.Item>
        </Form>
    );
};
