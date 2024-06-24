import * as React from "react";
import { Descriptions, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UseQueryResult } from "react-query";

export interface MiniLoaderProps<T extends any> {
    children: (data: T) => React.ReactNode;
    query: UseQueryResult<T>;
    label: React.ReactNode;
}

export const MiniLoader = <T extends any>(props: MiniLoaderProps<T>) => {
    return (
        <Descriptions.Item label={props.label}>
            {(() => {
                if (props.query.isError) {
                    return "Failed to load";
                }
                if (props.query.isFetching) {
                    return <Spin indicator={<LoadingOutlined spin />} size="small" />
                }
                if (props.query.data) {
                    return <>{props.children(props.query.data)}</>
                }
                return "No data";
            })()}
        </Descriptions.Item>
    );
};
