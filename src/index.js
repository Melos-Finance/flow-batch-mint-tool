import Queue from "bull";
import dotenv from "dotenv";

dotenv.config();

let numOfWorker = parseInt(process.env.admin_proposal_keys);
const N = parseInt(process.env.mint_num);

const mintQs = [];

const produce = async () => {
  if (N <= 0 || numOfWorker <= 0) {
    console.error("number of workers is 0 or number of mint tasks is 0");
    return;
  }

  numOfWorker = Math.min(N, numOfWorker);

  for (let i = 0; i < numOfWorker; i++) {
    const q = new Queue("mint#" + i);
    q.on("drained", () => {
      console.log(q.name, "drained");
      q.close();
    });

    q.process(__dirname + "/minter.js");
    //   q.process(handler);
    mintQs.push(q);
  }

  console.log("created", numOfWorker, "queues");

  for (let i = 0; i < N; i++) {
    const nftId = 100000 + i + 1;
    const workerIndex = nftId % numOfWorker;
    const q = mintQs[workerIndex];

    await q.add({
      proposalIndex: workerIndex,
      nftId,
    });
  }

  console.log("dispatched ", N, "jobs");
};

produce();
