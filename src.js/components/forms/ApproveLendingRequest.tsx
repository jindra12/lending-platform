import * as React from "react";
import { CheckCircleFilled, DownloadOutlined, CloseCircleOutlined } from "@ant-design/icons";
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
	useRejectLendingRequest,
} from "../context";
import { CoinDisplay } from "../utils/CoinDisplay";
import {
	addressValidator,
	colProps,
	numberOrZeroValidator,
	rowProps,
	smallColProps,
} from "../../utils";
import { FormError } from "../utils/FormError";
import { FormSuccess } from "../utils/FormSuccess";
import { Prompt } from "../utils/Prompt";

export interface ApproveLendingRequestProps {
	borrower: string;
	uniqueId: number | bigint;
	onFinished: () => void;
}

export const ApproveLendingRequest: React.FunctionComponent<
	ApproveLendingRequestProps
> = (props) => {
	const approve = useApproveLendingRequest(props.borrower, props.uniqueId);
	const reject = useRejectLendingRequest(props.borrower, props.uniqueId);
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

	useOnSuccess(form, approve, props.onFinished);
	useOnSuccess(form, reject, props.onFinished);

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
				<FormError query={reject} />
				<FormError query={approve} />
				<FormSuccess query={reject} />
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
								numberOrZeroValidator,
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
				<Divider />
				<Form.Item>
					<Row {...rowProps}>
						<Col {...smallColProps}>
							<Button
								type="primary"
								htmlType="submit"
								icon={<CheckCircleFilled />}
								loading={approve.isLoading}
								disabled={reject.isLoading}
							>
								Approve
							</Button>
						</Col>
						<Col {...smallColProps}>
							<Button
								type="primary"
								htmlType="button"
								danger
								onClick={() => reject.mutate({})}
								icon={<CloseCircleOutlined />}
								loading={reject.isLoading}
								disabled={approve.isLoading}
							>
								Reject
							</Button>
						</Col>
					</Row>
				</Form.Item>
			</Form>
		</Card>
	);
};
