pragma solidity ^0.4.12;

contract Test {
  event Called(address sender, bytes32 data);
  event PrintMap(bytes32 key, bool val);

  mapping(bytes32 => bool) private dataFlags;

  function test(bytes32 data) external {
    Called(msg.sender, data);

    bytes32 data1 = 0x8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d;
    bytes32 data2 = 0xaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaa;

    PrintMap(data1, dataFlags[data1]);
    PrintMap(data2, dataFlags[data2]);

    dataFlags[data] = true;
  }

}
