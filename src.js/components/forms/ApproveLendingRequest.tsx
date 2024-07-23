import * as React from "react";
import { CheckCircleFilled, DownloadOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Checkbox,
	Col,
	Divider,
	Form,
	Input,
	Row,
	message,
} from "antd";
import {
	ApproveLendingRequestType,
	useApproveLendingRequest,
	useLendingRequestFile,
	useOnSuccess,
} from "../context";
import { CoinDisplay } from "../utils/CoinDisplay";
import {
	addressValidator,
	colProps,
	numberValidator,
	rowProps,
} from "../../utils";
import { FormError } from "../utils/FormError";
import { FormSuccess } from "../utils/FormSuccess";
import { Prompt } from "../utils/Prompt";

export interface ApproveLendingRequestProps {
	borrower: string;
	uniqueId: number | bigint;
	even: boolean;
}

export const ApproveLendingRequest: React.FunctionComponent<
	ApproveLendingRequestProps
> = (props) => {
	const approve = useApproveLendingRequest(props.borrower, props.uniqueId);
	const download = useLendingRequestFile(props.borrower);
	const [form] = Form.useForm<ApproveLendingRequestType>();
	const isEth: boolean = Form.useWatch("isEth", form);
	const coin = Form.useWatch("coin", form);

	const onDownload = React.useCallback(
		async (privateKey: string) => {
			try {
				message.loading("Starting file download");
				if (!privateKey) {
					message.error("No private key specified");
				} else {
					await download.mutateAsync(privateKey);
				}
			} catch (e) {
				message.error("Please enter your private key");
			}
		},
		[download]
	);

	useOnSuccess(form, approve);

	return (
		<Card
			title={`Applicant: ${props.borrower}`}
			style={{ backgroundColor: "rgb(240, 242, 245)" }}
		>
			<Form<ApproveLendingRequestType>
				onFinish={(values) => {
					approve.mutate(values);
				}}
				form={form}
				scrollToFirstError
				layout="vertical"
			>
				<FormError query={approve} />
				<FormSuccess query={approve} />
				<Row {...rowProps}>
					<Col {...colProps}>
						<Form.Item<ApproveLendingRequestType>
							label="Approved amount"
							name="amount"
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
				</Row>
				<Row {...rowProps}>
					<Col {...colProps}>
						<Form.Item<ApproveLendingRequestType>
							name="isEth"
							label="Eth limit"
							valuePropName="checked"
							initialValue
						>
							<Checkbox defaultChecked />
						</Form.Item>
					</Col>
					{!isEth && (
						<Col {...colProps}>
							<Form.Item<ApproveLendingRequestType>
								name="coin"
								label="Currency"
								extra={coin ? <CoinDisplay address={coin} /> : undefined}
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
				<Divider />
				<Form.Item>
					<Row {...rowProps}>
						<Col {...colProps}>
							<Prompt
								title="Bank RSA private key"
								placeholder="Bank private key"
								required="Enter your private key"
								label="Bank private key"
								submit="Submit"
								onFilled={onDownload}
							>
								{(init) => (
									<Button
										type="primary"
										icon={<DownloadOutlined />}
										onClick={init}
									>
										Application
									</Button>
								)}
							</Prompt>
						</Col>
					</Row>
					<Row {...rowProps}>
						<Col {...colProps}>
							<Button
								type="primary"
								htmlType="submit"
								icon={<CheckCircleFilled />}
								loading={approve.isLoading}
							>
								Approve
							</Button>
						</Col>
					</Row>
				</Form.Item>
			</Form>
		</Card>
	);
};
