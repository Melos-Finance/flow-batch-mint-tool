# FLOW batch mint tool

Tool that runs on terminal to achieve concurrent batch mint FLOW NFT based on multiple proposal key and queue.

## Prerequisit

1. flow-cli
2. redis server, serves as backend of the Bull queue. On MacOS, install and start from brew.

```
brew install redis
brew services start redis
```

## Try it out

1. intialized project

```
yarn
```

2. run shell script to add proposal keys to your account

```
./augment_proposal_key.sh <n>
```

3. run example

```
flow emulator -v --transaction-expiry 600

yarn mint
```

## Mint your own NFT

modify the <code> minter.js </code> to add your own mint logic.
