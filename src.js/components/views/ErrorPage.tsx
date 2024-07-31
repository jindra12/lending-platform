import * as React from "react";
import { Button, Flex, Layout, Menu, theme } from "antd";
import { Header, Content, Footer } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import { getConfig } from "../../config";

export interface ErrorPageProps {
    isWalletError: boolean;
}

export const ErrorPage: React.FunctionComponent<ErrorPageProps> = (props) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout>
            <Header style={{ display: "flex", alignItems: "center" }}>
                <div className="logo" aria-label={getConfig().bankName} />
            </Header>
            <Content style={{ padding: "0 48px" }}>
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
                    <Title>Oops! Something went wrong</Title>
                    <Paragraph>
                        We apologize for the inconvenience, something went wrong on our end.
                        Please try again later, and thank you for your understanding.
                    </Paragraph>
                    {props.isWalletError && (
                        <>
                            <Paragraph>
                                To test the app, please download MetaMask and install Ephemery.
                                MetaMask is a secure browser extension for managing Ethereum
                                wallets and interacting with decentralized applications.
                                Ephemery is a test chain for Ethereum, allowing you to safely
                                test without using real ETH. If you encounter any phishing
                                alerts, you can dismiss them, as this app only operates on the
                                test chain. The resources can be found at the links below.
                            </Paragraph>
                            <Flex gap="small" wrap>
                                <Button type="primary" href="https://metamask.io/">
                                    Metamask
                                </Button>
                                <Button
                                    type="primary"
                                    href="https://github.com/ephemery-testnet/ephemery-resources"
                                >
                                    Ephemery
                                </Button>
                            </Flex>
                        </>
                    )}
                </div>
            </Content>
            <Footer style={{ textAlign: "center" }}>
                We apologize for the inconvenience. For assistance, please contact us at
                jindra12.underdark@gmail.com.
            </Footer>
        </Layout>
    );
};
