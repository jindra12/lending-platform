import * as React from "react";
import { Button } from "antd";
import { MoneyCollectFilled } from "@ant-design/icons";
import { useOnFinish, usePayment } from "../context";
import { FormSuccess } from "../utils/FormSuccess";
import { FormError } from "../utils/FormError";

export interface PaymentProps {
    loan: string;
    onFinished: () => void;
}

export const Payment: React.FunctionComponent<
    PaymentProps
> = (props) => {
    const payment = usePayment(props.loan);

    useOnFinish(payment, (status) => {
        if (status === "success") {
            props.onFinished();
        }
    });

    return (
        <>
            <FormSuccess query={payment} />
            <FormError query={payment} asModal />
            <Button
                type="primary"
                icon={<MoneyCollectFilled />}
                loading={payment.isLoading}
                onClick={() => payment.mutate({})}
            >
                Pay
            </Button>
        </>
    );
};
