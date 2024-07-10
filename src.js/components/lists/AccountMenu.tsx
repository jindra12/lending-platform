import * as React from "react";
import { Alert, Menu, Spin } from "antd";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { LoadingOutlined } from "@ant-design/icons";
import { JsonRpcSigner } from "ethers";

import { useAccounts } from "../context";
import { AccountTooltip } from "../utils/AccountTooltip";

export interface AccountMenuProps {
    selected?: JsonRpcSigner;
    setSelected: (value: JsonRpcSigner) => void;
}

export const AccountMenu: React.FunctionComponent<AccountMenuProps> = (
    props
) => {
    const accounts = useAccounts();

    React.useEffect(() => {
        if (!props.selected && accounts.data?.length) {
            props.setSelected(accounts.data[0]);
        }
    }, [accounts.data]);

    if (accounts.isFetching) {
        return <Spin indicator={<LoadingOutlined spin />} size="small" />;
    }

    if (accounts.isError) {
        return <Alert message="Cannot load account list" type="error" showIcon />;
    }

    if (accounts.data) {
        if (accounts.data.length === 0) {
            return <Alert type="error" message="No accounts found" />;
        }
        const items = accounts.data.map(
            (signer): ItemType<MenuItemType> => ({
                label: (
                    <AccountTooltip address={signer.address} />
                ),
                key: signer.address,
            })
        );
        return (
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={[accounts.data[0].address]}
                selectedKeys={
                    props.selected?.address ? [props.selected?.address] : undefined
                }
                onSelect={(info) => {
                    const selected = accounts.data.find(
                        (acc) => acc.address === info.key
                    );
                    if (selected) {
                        props.setSelected(selected);
                    }
                }}
                items={items}
                style={{ flex: 1, minWidth: 0 }}
            />
        );
    }

    return <></>;
};
