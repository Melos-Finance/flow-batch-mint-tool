#! /bin/bash
# ./augument_proposal_key.sh <num>
flow transactions send ./cadence/augment_proposal_key.cdc $1 --network emulator --signer emulator-account

