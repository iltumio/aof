import { ethers, network, run } from "hardhat"
import { networkConfig } from "./helper-hardhat-config"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber, constants } from "ethers"
import { solidityKeccak256 } from "ethers/lib/utils"
import { MerkleTree } from "merkletreejs"
import { LinkToken, LinkToken__factory } from "./typechain"

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

export const autoFundCheck = async (
  contractAddr: string,
  networkName: string,
  linkTokenAddress: string,
  additionalMessage: string
) => {
  const chainId: number | undefined = network.config.chainId

  console.log("Checking to see if contract can be auto-funded with LINK:")

  if (!chainId) return
  const amount: BigNumber = networkConfig[chainId].fundAmount

  const accounts: SignerWithAddress[] = await ethers.getSigners()
  const signer: SignerWithAddress = accounts[0]

  const linkTokenContract: LinkToken = LinkToken__factory.connect(linkTokenAddress, signer)

  const balance: BigNumber = await linkTokenContract.balanceOf(signer.address)
  const contractBalance: BigNumber = await linkTokenContract.balanceOf(contractAddr)

  if (balance > amount && amount > constants.Zero && contractBalance < amount) {
    //user has enough LINK to auto-fund and the contract isn't already funded
    return true
  } else {
    //user doesn't have enough LINK, print a warning
    console.warn(
      `Account doesn't have enough LINK to fund contracts, or you're deploying to a network where auto funding isnt' done by default\n`,
      `Please obtain LINK via the faucet at https://faucets.chain.link/, then run the following command to fund contract with LINK:\n`,
      `yarn hardhat fund-link --contract ${contractAddr} --network ${networkName} ${additionalMessage}`
    )

    return false
  }
}

export const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.log(e)
    }
  }
}

const hashedZeroAddress = solidityKeccak256(["address"], [ethers.constants.AddressZero])

export const processLeaves = (numberOfLeaves: number) =>
  addresses
    .slice(0, numberOfLeaves)
    .map((address, i) => (i < numberOfLeaves ? address : ethers.constants.AddressZero))

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

export const calcTree = (addresses: string[]) =>
  new Array(16384).fill(hashedZeroAddress).map((el, i) => addresses[i] || el)
