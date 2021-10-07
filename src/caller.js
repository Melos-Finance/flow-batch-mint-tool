/*
 * Copyright Melos Studio
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { mapValuesToCode } from "flow-cadut";
import { authorization } from "./crypto";
import * as fcl from "@onflow/fcl";

const unwrap = (arr, convert) => {
  const type = arr[arr.length - 1];
  return arr.slice(0, -1).map((value) => convert(value, type));
};

const mapArgs = (args) => {
  return args.reduce((acc, arg) => {
    const unwrapped = unwrap(arg, (value, type) => {
      return fcl.arg(value, type);
    });
    acc = [...acc, ...unwrapped];
    return acc;
  }, []);
};

const resolveArguments = (args, code) => {
  if (args.length === 0) {
    return [];
  }

  // We can check first element in array. If it's last value is instance
  // of @onflow/types then we assume that the rest of them are also unprocessed
  const first = args[0];
  if (Array.isArray(first)) {
    const last = first[first.length - 1];
    if (last.asArgument) {
      return mapArgs(args);
    }
  }
  // Otherwise we process them and try to match them against the code
  const result = mapValuesToCode(code, args);

  return result;
};

export const executeTransaction = async (
  code,
  args,
  sender,
  proposalKeyIndex = 0
) => {
  // const blockResponse = await fcl.send([fcl.getBlock(false)]);
  // const block = await fcl.decode(blockResponse);
  // console.log(block);

  const authz = authorization(sender);

  // set repeating transaction code
  const ix = [
    fcl.transaction(code),
    fcl.authorizations([authz]),
    fcl.payer(authz),
    fcl.proposer(authorization(sender, proposalKeyIndex)),
    fcl.limit(999),
    // fcl.ref(block),
  ];

  // add arguments if any
  if (args) {
    ix.push(fcl.args(resolveArguments(args, code)));
  }
  const response = await fcl.send(ix);
  console.log("transaction sent, waiting for confirmation");

  const trans = await fcl.tx(response).onceSealed();
  console.log("transaction sealed");

  return trans;
};

export const executeScript = async (code, args) => {
  const ix = [fcl.script(code)];
  // add arguments if any
  if (args) {
    ix.push(fcl.args(resolveArguments(args, code)));
  }
  const response = await fcl.send(ix);
  return await fcl.decode(response);
};

export const sleep = async (millis) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, millis);
  });
};
