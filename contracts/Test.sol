pragma solidity ^0.4.12;

contract Test {
  event Called(address sender, uint data, uint countBefore);

  uint public count;

  function test(uint data) external {
    Called(msg.sender, data, count);
    count++;
  }

}
