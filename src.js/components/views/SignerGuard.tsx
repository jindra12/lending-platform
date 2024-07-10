import * as React from "react";
import { useSetSigner } from "../context";
import { Guard } from "./Guard";

export interface SignerGuardProps {
    self: string;
}

export const SignerGuard: React.FunctionComponent<React.PropsWithChildren<SignerGuardProps>> = (props) => {
    return <Guard address={props.self} hook={useSetSigner}>{props.children}</Guard>
};