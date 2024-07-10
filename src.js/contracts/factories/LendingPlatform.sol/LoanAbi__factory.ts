/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  LoanAbi,
  LoanAbiInterface,
} from "../../LendingPlatform.sol/LoanAbi";

const _abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "lender",
        type: "address",
        internalType: "address",
      },
      {
        name: "borrower",
        type: "address",
        internalType: "address",
      },
      {
        name: "remaining",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "singlePayment",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "interval",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "defaultLimit",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "lastPayment",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "acceptEarlyRepayment",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "canDefaultOnLoan",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "canDoEarlyRepayment",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "canDoPayment",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "canRequestEarlyRepayment",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "defaultOnLoan",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "doPayment",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "finalize",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getBorrower",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCoin",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IERC20Metadata",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCollateral",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCollateralCoin",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IERC20Metadata",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCollateralEth",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDefaultLimit",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInterval",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getIsDefault",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getIsEth",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLastPayment",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLender",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLoanDetails",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Loan.LoanDetails",
        components: [
          {
            name: "lender",
            type: "address",
            internalType: "address",
          },
          {
            name: "borrower",
            type: "address",
            internalType: "address",
          },
          {
            name: "remaining",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "singlePayment",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "interval",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "defaultLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lastPayment",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "collateral",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "isCollateralEth",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "collateralCoin",
            type: "address",
            internalType: "contract IERC20Metadata",
          },
          {
            name: "coin",
            type: "address",
            internalType: "contract IERC20Metadata",
          },
          {
            name: "isEth",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "inDefault",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "paidEarly",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "requestPaidEarly",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "requestPaidEarlyAmount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPaidEarly",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRemaining",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRequestPaidEarly",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRequestPaidEarlyAmount",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSinglePayment",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rejectEarlyRepayment",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestEarlyRepaymentCoin",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestEarlyRepaymentEth",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setCoin",
    inputs: [
      {
        name: "coin",
        type: "address",
        internalType: "contract IERC20Metadata",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setCoinCollateral",
    inputs: [
      {
        name: "coin",
        type: "address",
        internalType: "contract IERC20Metadata",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setEthCollateral",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setIsEth",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AcceptEarlyRepayment",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DefaultOnLoan",
    inputs: [
      {
        name: "timestamp",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "collateral",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DidPayment",
    inputs: [
      {
        name: "timestamp",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "remaining",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FullyPaid",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "RejectEarlyRepayment",
    inputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "RequestEarlyRepayment",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

export class LoanAbi__factory {
  static readonly abi = _abi;
  static createInterface(): LoanAbiInterface {
    return new Interface(_abi) as LoanAbiInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): LoanAbi {
    return new Contract(address, _abi, runner) as unknown as LoanAbi;
  }
}
