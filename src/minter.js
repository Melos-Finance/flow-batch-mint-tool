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

import * as fcl from "@onflow/fcl";
import dotenv from "dotenv";
import { executeTransaction, sleep } from "./caller";
import { getTransactionCode } from "./file";

let initialized = false;

let mint = `
transaction {
  prepare(signer: AuthAccount){
  }
  execute{
    log("mock mint")
  }
}`;

const doMint = async ({ proposalIndex, nftId }) => {
  try {
    await init();

    console.log(proposalIndex, nftId);
    console.log(await fcl.config().get("accessNode.api"));

    //const args = [];

    await executeTransaction(
      mint /* transaction code */,
      null /* args */,
      process.env.admin_acct /*sender or signer*/,
      proposalIndex
    );
    console.error(nftId, "minted");
    return Promise.resolve("OK");
  } catch (error) {
    console.error(nftId, error);
    await sleep(5000); // wait for incrementation of the sequence number to take effect
    return Promise.reject("Failed");
  }
};

const init = async () => {
  if (initialized) return;

  dotenv.config();
  fcl.config().put("accessNode.api", process.env.network);
  fcl.config().put("BASE_PATH", "../..");

  /* load your transaction file here */
  // mint = await getTransactionCode({
  //   name: "MusicBlock/mint_nft",
  //   addressMap: {
  //     MusicBlock: process.env.MusicBlock,
  //     NonFungibleToken: process.env.NonFungibleToken,
  //   },
  // });
  // console.log("init'ed", mint);
  initialized = true;
};

const handler = (job) => {
  return doMint(job.data);
};

export default handler;
