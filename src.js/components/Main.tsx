import * as React from "react";
import { Layout, Menu, theme } from "antd";
import { MoneyCollectFilled, MoneyCollectOutlined, UserAddOutlined, ApiFilled } from '@ant-design/icons';
import Sider from "antd/es/layout/Sider";
import { Header, Content, Footer } from "antd/es/layout/layout";
import { useNavigate } from "react-router-dom";
import { getConfig } from "../config";

export const Main: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    
    const navigate = useNavigate();
    
    return (
        <Layout>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
            >
                <div className="demo-logo-vertical" />
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']} items={[
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
                        label: "View requests",
                    },
                    {
                        key: "/issue-loan",
                        icon: <MoneyCollectOutlined />,
                        label: "Issue loan",
                    },
                ]} onSelect={({ key }) => {
                    navigate(key);
                }} />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '24px 16px 0' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {props.children}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Online Ethereum based decentralized loan platform{getConfig().net === "mainnet" ? "" : " (DEVNET only)"}.
                    Authored by: Jan Jindráček. You can contact me at <a href="mailto:jindra12.underdark@gmail.com">jindra12.underdark@gmail.com</a>.
                    Check out my git <a href="https://github.com/jindra12/lending-platform">git repo</a>!.
                </Footer>
            </Layout>
        </Layout>
    );
}