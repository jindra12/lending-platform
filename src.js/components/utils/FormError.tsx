import { Alert } from "antd";
import * as React from "react";
import { UseMutationResult, UseQueryResult } from "react-query";

export interface FormErrorProps {
    query: UseQueryResult | UseMutationResult;
}

export const FormError: React.FunctionComponent<FormErrorProps> = (props) => {
    if (props.query.isError) {
        const retyped = props.query.error as any;
        const errorMessage = retyped?.info?.error?.data?.message || retyped?.message;
        const displayMessage =
            errorMessage && typeof errorMessage === "string"
                ? errorMessage
                : "Something went wrong, please try again later!";
        return <Alert type="error" message={displayMessage} />;
    }
    return null;
};
