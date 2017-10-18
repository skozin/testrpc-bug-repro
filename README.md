# TestRPC bug repro

### The problem

I have the following Solidity contract:

```
pragma solidity ^0.4.12;

contract Test {
  event Called(address sender, uint data, uint countBefore);

  uint public count;

  function test(uint data) external {
    Called(msg.sender, data, count);
    count++;
  }

}
```

I use `truffle` to call `Test.test` two times in succession, from two different addresses (`addr1` and `addr2`), each time passing different argument:

```js
let contract = await Test.new({from: accounts[0]})

await contract.test(1, {from: accounts[1]})
await contract.test(2, {from: accounts[2]})
```

Then I call it third time, once again from a different address `addr3`, but this time I pass the same argument as in the first call, `1`:

```js
await contract.test(1, {from: accounts[3]})
```

In the beginning of the third call I expect the `count` variable to contain `2`, but, for some reason, it contains `0` instead. After all three calls are made, inspecting `count` variable reveals that it contains `2` instead of the expected `3`.

Also, I noticed that hashes of transactions corresponding to the first and third calls are the same, which is clearly not right.

If I make the third call from `addr1` or from the address that created the contract (`addr0`), things start behaving normally. The same if during the third call I pass some different argument, e.g. `3`.

The bug does not reproduce consistently even when all conditions are met. But it does reproduce every time after TestRPC restart. Then, if you continue running tests without restarting TestRPC, it would reproduce at least in half of the runs (according to my observations).

Everything works correctly when I use geth instead of TestRPC. Also, I tested the same scenario in Remix IDE and the contract behaved as it should. So I suppose this has something to do with TestRPC specifically, or with interplay between Truffle and TestRPC.


### How to reproduce

Run `npm install`, then open two terminals. In the first one, launch TestRPC:

```
./run-testrpc.sh
```

In the second one, run Truffle tests:

```
npm test
```

You'll see the following output:

```
> testrpc-bug-repro@1.0.0 test /path/to/testrpc-bug-repro
> truffle test

Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Test.sol...

accounts: [ '0x6da26a02b4364dcff7cfd58f8a8b9c6ce62a0c61',
  '0xbb2bced367d8c4712baac44616c1e61797f392a3',
  '0xc712deae0ab6abf65285ed42400b127056f3c664',
  '0x80433df99abe278680a20f0bc70bbf243d51c803' ]


  Contract: Test contract

Calling from 0xbb2bced367d8c4712baac44616c1e61797f392a3

Events: [ 'Called(sender: 0xbb2bced367d8c4712baac44616c1e61797f392a3, data: 1, countBefore: 0)' ]
tx 0x0f4643091b4b9621ef7d0e8ab21a0eed36de8bed7e9e6e7efd7dd81a9719f0e8, from 0xbB2Bced367D8C4712BAaC44616C1E61797f392A3
    ✓ 1 (1048ms)

Calling from 0xc712deae0ab6abf65285ed42400b127056f3c664

Events: [ 'Called(sender: 0xc712deae0ab6abf65285ed42400b127056f3c664, data: 2, countBefore: 1)' ]
tx 0x3a988a1455f7ae56e5a519189e898cfe8b3048e9119aba3d736c0d09df8d0318, from 0xc712deaE0aB6abF65285ed42400B127056F3c664
    ✓ 2 (1038ms)

Calling from 0x80433df99abe278680a20f0bc70bbf243d51c803

Events: [ 'Called(sender: 0xbb2bced367d8c4712baac44616c1e61797f392a3, data: 1, countBefore: 0)' ]
tx 0x0f4643091b4b9621ef7d0e8ab21a0eed36de8bed7e9e6e7efd7dd81a9719f0e8, from 0xbB2Bced367D8C4712BAaC44616C1E61797f392A3
    ✓ 3
count: 2
    ✓ check


  4 passing (3s)
```

Notice that, in the beginning of the third method call, it reports that the value of `count` variable is `0` instead of the expected `2`, and that, after the third call, `count` equals `2` instead of the expected `3`.

Also, hash of the third transaction, `0x0f4643091b4b9621ef7d0e8ab21a0eed36de8bed7e9e6e7efd7dd81a9719f0e8`, is the same as hash of the first one, which should not happen.
