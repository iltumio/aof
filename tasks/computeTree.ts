import { constants } from "ethers"
import { solidityKeccak256 } from "ethers/lib/utils"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
import MerkleTree from "merkletreejs"

const addresses = [
  "0xCFDb6Bdb93097f49b004cd08330E4f57e6bc7cCA",
  "0x3Ea40cfAF9fAEd67C6321A42650a2aCB1f3E685B",
  "0xace75Ff068b9E31b75E840Eb8b5Bca4Fde3825fE",
  "0xdB912281270fef851942C6C519982FD1F39A46B3",
  "0xa99e979919f40dcB5A37876484D6FA19a752E18f",
  "0x38ef9D8C9Ca7d90F7B03C4eC7aEc1F5f07f589fD",
  "0x6B76AbB40A1331e3164327F841615585eca4A95D",
  "0xA813CB285c11698Ed1DA73E22eA5773e5Bd4Cb9E",
]

const hashedZeroAddress = solidityKeccak256(["address"], [constants.AddressZero])

export const processLeaves = (numberOfLeaves: number) =>
  addresses
    .slice(0, numberOfLeaves)
    .map((address, i) => (i < numberOfLeaves ? address : constants.AddressZero))

export const hashLeaves = (leaves: string[]) =>
  leaves.map((leaf) => solidityKeccak256(["address"], [leaf]))

export const computeTree = (numberOfLeaves: number) => {
  const leaves = addresses.map((address, i) =>
    i < numberOfLeaves ? solidityKeccak256(["address"], [address]) : hashedZeroAddress
  )

  return new MerkleTree(leaves, (data: Buffer) =>
    solidityKeccak256(["bytes32", "bytes32"], [data.slice(0, 32), data.slice(32)])
  )
}

export const getHashedLeaves = (addresses: string[]) =>
  new Array(16384)
    .fill(hashedZeroAddress)
    .map((el, i) => solidityKeccak256(["address"], [addresses[i]]) || el)

task("computeTree", "Generates a tree")
  .addParam("leavesNumber", "The number of leaves")
  .addOptionalParam("leafIndex")
  .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
    const tree = computeTree(taskArgs.leavesNumber)
    console.log("Root", tree.getHexRoot())

    if (taskArgs.leafIndex) {
      console.log("Leaf index", taskArgs.leafIndex)
      const leaf = tree.getHexLeaves()[taskArgs.leafIndex]
      console.log("Proof", JSON.stringify(tree.getHexProof(leaf)))
      console.log("Leaf", leaf)
      console.log("Address", addresses[taskArgs.leafIndex])
    }
  })

task("genTree", "Generates a tree")
  .addParam("set", "The set to be used")
  .addOptionalParam("leafIndex")
  .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
    // const leaves =
    const tree = computeTree(taskArgs.leavesNumber)
    console.log("Root", tree.getHexRoot())

    if (taskArgs.leafIndex) {
      console.log("Leaf index", taskArgs.leafIndex)
      const leaf = tree.getHexLeaves()[taskArgs.leafIndex]
      console.log("Proof", JSON.stringify(tree.getHexProof(leaf)))
      console.log("Leaf", leaf)
      console.log("Address", addresses[taskArgs.leafIndex])
    }
  })
