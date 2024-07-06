import * as React from "react";
import { Layout as LibraryLayout, theme } from "antd";

import Sider from "antd/es/layout/Sider";
import { Header, Content, Footer } from "antd/es/layout/layout";
import { getConfig } from "../config";
import { AccountMenu } from "./lists/AccountMenu";
import { JsonRpcSigner } from "ethers";
import { SiderMenu } from "./views/SiderMenu";

export interface LayoutProps {
    children: (account: JsonRpcSigner) => React.ReactNode;
}

export const Layout: React.FunctionComponent<LayoutProps> = (
    props
) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [account, setAccount] = React.useState<JsonRpcSigner>();

    return (
        <LibraryLayout>
            <Header style={{ display: "flex", alignItems: "center" }}>
                <div className="logo" aria-label={getConfig().bankName} />
                <AccountMenu setSelected={setAccount} selected={account} />
            </Header>
            <LibraryLayout>
                <Sider breakpoint="lg" collapsedWidth="40px">
                    {account && <SiderMenu account={account} />}
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
