import * as React from "react";
import { CheckCircleFilled } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import {
	ApproveLendingRequestType,
	useApproveLendingRequest,
} from "../context";
import { CoinDisplay } from "../utils/CoinDisplay";
import { addressValidator } from "../../utils";

export interface ApproveLendingRequestProps {
	borrower: string;
	uniqueId: number | bigint;
}

export const ApproveLendingRequest: React.FunctionComponent<
	ApproveLendingRequestProps
> = (props) => {
	const approve = useApproveLendingRequest(props.borrower, props.uniqueId);
	const [form] = Form.useForm<ApproveLendingRequestType>();
	const isEth: boolean = form.getFieldValue("isEth");
	const coin: string = form.getFieldValue("coin");

	return (
		<Form<ApproveLendingRequestType> onFinish={approve.mutate} form={form}>
			<Form.Item<ApproveLendingRequestType>
				label="Approved amount"
				name="amount"
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
			<Form.Item<ApproveLendingRequestType>
				name="isEth"
				label="Eth limit"
				rules={[{ required: true }]}
			>
				<Checkbox defaultChecked />
			</Form.Item>
			<Form.Item<ApproveLendingRequestType>
				name="coin"
				label="Currency"
				hidden={!isEth}
				help={coin ? <CoinDisplay address={coin} /> : undefined}
				rules={[{ required: true, message: "Set ERC20 coin address" }, addressValidator]}
			>
				<Input />
			</Form.Item>
			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button
					type="primary"
					htmlType="submit"
					icon={<CheckCircleFilled />}
					loading={approve.isLoading}
				>
					Approve
				</Button>
			</Form.Item>
		</Form>
	);
};
