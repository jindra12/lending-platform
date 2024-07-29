import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    MoneyCollectFilled,
    MoneyCollectOutlined,
    ArrowUpOutlined,
    UserAddOutlined,
    ApiFilled,
    DollarCircleFilled,
    BankOutlined,
} from "@ant-design/icons";
import { JsonRpcSigner } from "ethers";
import { Menu } from "antd";
import { OwnerGuard } from "./OwnerGuard";

export interface SiderMenuProps {
    account: JsonRpcSigner;
}

export const SiderMenu: React.FunctionComponent<SiderMenuProps> = (props) => {
    const self = props.account.address;
    const navigate = useNavigate();
    const location = useLocation();
    const selectedUrl = location.pathname;

    return (
        <OwnerGuard self={self}>
            {(isOwner) => (
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={selectedUrl ? [selectedUrl] : ["/"]}
                    items={[
                        {
                            key: "/",
                            icon: <UserAddOutlined />,
                            label: "Track your loans",
                        },
                        {
                            key: "/requests",
                            icon: <ApiFilled />,
                            disabled: !isOwner,
                            label: "Loan applications",
                        },
                        {
                            key: "/fee",
                            icon: <DollarCircleFilled />,
                            disabled: !isOwner,
                            label: "Application fee form"
                        },
                        {
                            key: "/request",
                            icon: <ArrowUpOutlined />,
                            label: "My loan application",
                        },
                        {
                            key: "/offers",
                            icon: <MoneyCollectFilled />,
                            label: "Available loans",
                        },
                        {
                            key: "/issue-loan",
                            icon: <MoneyCollectOutlined />,
                            label: "Offer loan",
                        },
                        {
                            key: "/approved",
                            icon: <BankOutlined />,
                            label: "Approved Limit Lookup",
                            disabled: !isOwner,
                        }
                    ].filter((menuItem) => !menuItem.disabled)}
                    onSelect={({ key }) => {
                        navigate(key);
                    }}
                />
            )}
        </OwnerGuard>
    );
};
