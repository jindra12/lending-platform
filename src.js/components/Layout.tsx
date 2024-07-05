import * as React from "react";
import { Layout as LibraryLayout, Menu, theme } from "antd";
import {
    MoneyCollectFilled,
    MoneyCollectOutlined,
    UserAddOutlined,
    ApiFilled,
} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import { Header, Content, Footer } from "antd/es/layout/layout";
import { useNavigate, useLocation } from "react-router-dom";
import { getConfig } from "../config";
import { AccountMenu } from "./lists/AccountMenu";
import { JsonRpcSigner } from "ethers";

export interface LayoutProps {
    children: (account: JsonRpcSigner) => React.ReactNode;
}

export const Layout: React.FunctionComponent<LayoutProps> = (
    props
) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const navigate = useNavigate();
    const { hash } = useLocation();

    const selectedUrl = hash.split("#")[1];
    const [account, setAccount] = React.useState<JsonRpcSigner>();

    return (
        <LibraryLayout>
            <Header style={{ display: "flex", alignItems: "center" }}>
                <div className="logo" aria-label={getConfig().bankName} />
                <AccountMenu setSelected={setAccount} selected={account} />
            </Header>
            <LibraryLayout>
                <Sider breakpoint="lg" collapsedWidth="40px">
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={["/"]}
                        selectedKeys={selectedUrl ? [selectedUrl] : undefined}
                        items={[
                            {
                                key: "/",
                                icon: <UserAddOutlined />,
                                label: "View loans",
                            },
                            {
                                key: "/limit/request",
                                icon: <MoneyCollectFilled />,
                                label: "Change loan limit",
                            },
                            {
                                key: "/limit/requests",
                                icon: <ApiFilled />,
                                label: "View loan limit requests",
                            },
                            {
                                key: "/issue-loan",
                                icon: <MoneyCollectOutlined />,
                                label: "Issue loan",
                            },
                        ]}
                        onSelect={({ key }) => {
                            navigate(key);
                        }}
                    />
                </Sider>
                <LibraryLayout>
                    <Content style={{ margin: "24px 16px 0" }}>
                        <div
                            style={{
                                padding: 24,
                                minHeight: 360,
                                maxWidth: 1200,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                                margin: "0 auto",
                            }}
                        >
                            {account && props.children(account)}
                        </div>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>
                        Online Ethereum based decentralized loan platform
                        {getConfig().net === "mainnet" ? "" : " (DEVNET only)"}. Authored
                        by: Jan Jindráček. You can contact me at{" "}
                        <a href="mailto:jindra12.underdark@gmail.com">
                            jindra12.underdark@gmail.com
                        </a>
                        . Check out my git{" "}
                        <a href="https://github.com/jindra12/lending-platform">git repo</a>
                        !.
                    </Footer>
                </LibraryLayout>
            </LibraryLayout>
        </LibraryLayout>
    );
};
