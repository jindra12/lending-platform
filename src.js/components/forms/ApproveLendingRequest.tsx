import * as React from "react";
import { CheckCircleFilled } from "@ant-design/icons";
import { Button, Checkbox, Collapse, Form, Input } from "antd";
import {
	ApproveLendingRequestType,
	useApproveLendingRequest,
} from "../context";
import { CoinDisplay } from "../utils/CoinDisplay";
import { addressValidator } from "../../utils";

export interface ApproveLendingRequestProps {
	borrower: string;
}

export const ApproveLendingRequest: React.FunctionComponent<
	ApproveLendingRequestProps
> = (props) => {
	const approve = useApproveLendingRequest(props.borrower);
	const [form] = Form.useForm<ApproveLendingRequestType>();
	const coin = form.getFieldValue("coin");
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
			<Collapse
				collapsible="header"
				defaultActiveKey={["eth"]}
				items={[
					{
						key: "eth",
						label: "Assign a loan limit for ETH loans",
						children: (
							<Form.Item<ApproveLendingRequestType>
								name="isEth"
								label="Use eth loan"
								rules={[{ required: true }]}
							>
								<Checkbox defaultChecked />
							</Form.Item>
						),
					},
					{
						key: "coin",
						label: "Assign a loan limit for ERC20 loans",
						children: (
							<Form.Item<ApproveLendingRequestType>
								name="coin"
								label="Currency"
								help={coin ? <CoinDisplay address={coin} /> : undefined}
								rules={[{ required: true, message: "Set ERC20 coin address" }, addressValidator]}
							>
								<Input />
							</Form.Item>
						),
					},
				]}
			/>
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
