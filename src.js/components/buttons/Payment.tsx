import * as React from "react";
import { Button } from "antd";
import { MoneyCollectFilled } from "@ant-design/icons";
import { usePayment } from "../context";

export interface PaymentProps {
    loan: string;
}

export const Payment: React.FunctionComponent<
    PaymentProps
> = (props) => {
    const payment = usePayment(props.loan);
    return (
        <>
            <Button
                type="primary"
                icon={<MoneyCollectFilled />}
                loading={payment.isLoading}
                onClick={() => payment.mutate()}
            >
                Pay
            </Button>
        </>
    );
};
