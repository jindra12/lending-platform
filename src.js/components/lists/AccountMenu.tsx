import * as React from "react";
import { Alert, Menu, Spin, Tooltip } from "antd";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { LoadingOutlined } from "@ant-design/icons";
import { JsonRpcSigner } from "ethers";

import { useAccounts } from "../context";

export interface AccountMenuProps {
    selected?: JsonRpcSigner;
    setSelected: (value: JsonRpcSigner) => void;
}

export const AccountMenu: React.FunctionComponent<AccountMenuProps> = (props) => {
    const accounts = useAccounts();

    React.useEffect(() => {
        if (!props.selected && accounts.data) {
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
        const items = accounts.data.map(
            (signer): ItemType<MenuItemType> => ({
                label: (
                    <Tooltip placement="bottom" title={signer.address} arrow={false}>
                        {signer.address.slice(0, 5)}&hellip;
                    </Tooltip>
                ),
                key: signer.address,
            })
        );
        return (
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={[accounts.data[0].address]}
                selectedKeys={props.selected?.address ? [props.selected?.address] : undefined}
                onSelect={(info) => {
                    const selected = accounts.data.find(acc => acc.address === info.key);
                    if (selected) {
                        props.setSelected(selected)
                    }
                }}
                items={items}
                style={{ flex: 1, minWidth: 0 }}
            />
        );
    }

    return <></>;
};
