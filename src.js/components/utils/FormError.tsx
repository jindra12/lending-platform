import { Alert } from "antd";
import * as React from "react";
import { UseMutationResult, UseQueryResult } from "react-query";

export interface FormErrorProps {
    query: UseQueryResult | UseMutationResult;
}

export const FormError: React.FunctionComponent<FormErrorProps> = (props) => {
    if (props.query.isError) {
        return <Alert type="error" message="Something went wrong, please try again later!" />;
    }
    return null;
};
