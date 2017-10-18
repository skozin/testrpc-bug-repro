# TestRPC bug repro

### The problem

I have the following Solidity contract:

```
pragma solidity ^0.4.12;

contract Test {
  mapping(bytes32 => bool) private dataFlags;

  function test(bytes32 data) external {
    dataFlags[data] = true;
  }
}
```

I use `truffle` to call `Test.test` two times in succession, from two different addresses (`addr1` and `addr2`), each time passing different argument (`data1` and `data2`). Then I call it third time, once again from a different address `addr3`, but this time I pass the same argument as in the first call (`data1`):

```js
let contract = await Test.new({from: accounts[0]})
await contract.test(data[0], {from: accounts[1]})
await contract.test(data[1], {from: accounts[2]})
await contract.test(data[0], {from: accounts[3]})
```

In the beginning of the third call I expect the mapping to contain the following:

```
data1 => true
data2 => true
```

But, for some reason, it contains the following instead:

```
data1 => false
data2 => false
```

Also, I noticed that hashes of the first and third transactions are the same, which is clearly not right.

If I make the third call from `addr1` or from the address that created the contract (`addr0`), things start behaving normally. The same if during the third call I pass some different data (not `data1` or `data2`).

Also, the bug does not reproduce consistently even when all conditions are met. But it does reproduce every time after TestRPC restart. Then, if you continue running tests without restarting TestRPC, it would reproduce at least in half of the runs (according to my observations).

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

Events: [ 'Called(sender: 0xbb2bced367d8c4712baac44616c1e61797f392a3, data: 0x8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d)',
  'PrintMap(key: 0x8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d, val: false)',
  'PrintMap(key: 0xaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaa, val: false)' ]
tx 0x4d9098cf298d67a96fd82c73d98d475a55b6506c4984e2341b0ab75066dae6a5, from 0xbB2Bced367D8C4712BAaC44616C1E61797f392A3
    ✓ 1 (1054ms)

Calling from 0xc712deae0ab6abf65285ed42400b127056f3c664

Events: [ 'Called(sender: 0xc712deae0ab6abf65285ed42400b127056f3c664, data: 0xaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaa)',
  'PrintMap(key: 0x8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d, val: true)',
  'PrintMap(key: 0xaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaa, val: false)' ]
tx 0xb472c5a4f255aebb1aabc069cf60e2f552ef1f61f3077454aaaa1c3ff3d09706, from 0xc712deaE0aB6abF65285ed42400B127056F3c664
    ✓ 2 (1032ms)

Calling from 0x80433df99abe278680a20f0bc70bbf243d51c803

Events: [ 'Called(sender: 0xbb2bced367d8c4712baac44616c1e61797f392a3, data: 0x8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d)',
  'PrintMap(key: 0x8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d, val: false)',
  'PrintMap(key: 0xaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaa, val: false)' ]
tx 0x4d9098cf298d67a96fd82c73d98d475a55b6506c4984e2341b0ab75066dae6a5, from 0xbB2Bced367D8C4712BAaC44616C1E61797f392A3
    ✓ 3 (1030ms)


  3 passing (5s)
```

Notice that, in the beginning of the third method call, the map is the following:

```
0x8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d: false
0xaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaa: false
```

Which should not happen, because two previous calls should have set it to this:

```
0x8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d: true
0xaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaa: true
```

Also, hash of the third transaction is `0x4d9098cf298d67a96fd82c73d98d475a55b6506c4984e2341b0ab75066dae6a5`, the same as hash of the first one, which should not happen.
