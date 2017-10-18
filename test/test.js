const Test = artifacts.require('./Test.sol')

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))


contract('Test contract', function(accounts) {

  console.log('\naccounts:', accounts)

  const data = [
    '0x8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d8badf00d',
    '0xaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaabbaaaa',
    '0x1230001230001230001230001230001230001230001230001230001230001230',
  ]

  let contract

  before(async () => {
    contract = await Test.new({from: accounts[0]})
  })

  it(`1`, async () => {
    console.info(`\nCalling from ${accounts[1]}\n`)
    await assertTxSucceeds(contract.test(data[0], {from: accounts[1]}))
  })

  it(`2`, async () => {
    console.info(`\nCalling from ${accounts[2]}\n`)
    await assertTxSucceeds(contract.test(data[1], {from: accounts[2]}))
  })

  it(`3`, async () => {
    console.info(`\nCalling from ${accounts[3]}\n`)
    await assertTxSucceeds(contract.test(data[0], {from: accounts[3]}))
  })

})


async function assertTxSucceeds(txResultPromise) {
  const txResult = await txResultPromise
  printEvents(txResult)
  const succeeded = await checkTransactionSuccessful(txResult)
  if (!succeeded) {
    assert(false, 'transaction was expected to succeed but failed')
  }
}


async function checkTransactionSuccessful(txResult) {
  const {receipt} = txResult
  if (receipt.status !== undefined) {
    // Since Byzantium fork
    return receipt.status === '0x1' || receipt.status === 1
  }
  // Before Byzantium fork (current version of TestRPC)
  const tx = await web3.eth.getTransaction(txResult.tx)
  console.info(`tx ${tx.hash}, from ${tx.from}`)
  return receipt.cumulativeGasUsed < tx.gas
}


function printEvents(txResult) {
  console.info('Events:', txResult.logs
    .map(log => {
      if (!log.event) return null
      const argsDesc = Object.keys(log.args)
        .map(argName => `${argName}: ${log.args[argName]}`)
        .join(', ')
      return `${log.event}(${argsDesc})`
    })
    .filter(x => !!x)
  )
}
