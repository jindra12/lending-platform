import * as React from "react";
import { Button } from "antd";
import { MoneyCollectFilled } from "@ant-design/icons";
import { usePayment } from "../context";
import { FormSuccess } from "../utils/FormSuccess";
import { FormError } from "../utils/FormError";

export interface PaymentProps {
    loan: string;
}

export const Payment: React.FunctionComponent<
    PaymentProps
> = (props) => {
    const payment = usePayment(props.loan);
    return (
        <>
            <FormSuccess query={payment} />
            <FormError query={payment} asModal />
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
