import * as React from "react";
import { CheckCircleFilled, DownloadOutlined } from "@ant-design/icons";
import { Button, Checkbox, Divider, Form, Input, Space, message } from "antd";
import prompt from 'antd-prompt';
import {
	ApproveLendingRequestType,
	useApproveLendingRequest,
	useLendingRequestFile,
} from "../context";
import { CoinDisplay } from "../utils/CoinDisplay";
import { addressValidator, numberValidator } from "../../utils";

export interface ApproveLendingRequestProps {
	borrower: string;
	uniqueId: number | bigint;
}

export const ApproveLendingRequest: React.FunctionComponent<
	ApproveLendingRequestProps
> = (props) => {
	const approve = useApproveLendingRequest(props.borrower, props.uniqueId);
	const download = useLendingRequestFile(props.borrower);
	const [form] = Form.useForm<ApproveLendingRequestType>();
	const isEth: boolean = Form.useWatch("isEth", form);
	const coin = Form.useWatch("coin", form);

    const onDownload = React.useCallback(async () => {
        try {
            const privateKey = await prompt({
                title: "Required for file download",
                placeholder: "Bank private key",
                rules: [
                    {
                        required: true,
                        message: "Enter your private key"
                    }
                ],
            });
			message.loading("Starting file download");
			if (!privateKey) {
				throw "No private key";
			}
			await download.mutateAsync(privateKey);
        } catch (e) {
            message.error("Please enter your private key");
        }
    }, [download]);

	return (
		<Form<ApproveLendingRequestType> onFinish={approve.mutate} form={form}>
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
			<Divider />
			<Form.Item>
				<Space>
					<Button type="primary" icon={<DownloadOutlined />} onClick={onDownload}>
						View documentation
					</Button>
					<Button
						type="primary"
						htmlType="submit"
						icon={<CheckCircleFilled />}
						loading={approve.isLoading}
					>
						Approve
					</Button>
				</Space>
			</Form.Item>
		</Form>
	);
};
