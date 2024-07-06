import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    MoneyCollectFilled,
    MoneyCollectOutlined,
    UserAddOutlined,
    ApiFilled,
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
                            label: "View loans",
                        },
                        {
                            key: "/requests",
                            icon: <ApiFilled />,
                            disabled: !isOwner,
                            label: "View loan limit requests",
                        },
                        {
                            key: "/offers",
                            icon: <MoneyCollectFilled />,
                            label: "Loan offers",
                        },
                        {
                            key: "/issue-loan",
                            icon: <MoneyCollectOutlined />,
                            label: "Issue loan",
                        },
                    ].filter((menuItem) => !menuItem.disabled)}
                    onSelect={({ key }) => {
                        navigate(key);
                    }}
                />
            )}
        </OwnerGuard>
    );
};
