import { expect } from "chai"
import { BigNumber } from "ethers"
import { network, deployments, ethers } from "hardhat"
import { computeTree, processLeaves } from "../../helper-functions"
import { developmentChains } from "../../helper-hardhat-config"
import { Giveaway, VRFCoordinatorV2Mock, AttackOnFactoryNFT } from "../../typechain"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Giveaway Unit Tests", async function () {
      let giveawayContract: Giveaway
      let aof: AttackOnFactoryNFT
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock

      beforeEach(async () => {
        await deployments.fixture(["mocks", "vrf"])
        giveawayContract = await ethers.getContract("Giveaway")
        aof = await ethers.getContract("AttackOnFactoryNFT")
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
      })

      it("Should be deployed", async () => {
        expect(await giveawayContract._deployed()).not.to.be.null
        expect(await aof._deployed()).not.to.be.null
      })

      it("Should be possible to send all the tokens to the contract", async () => {
        const [account0] = await ethers.getSigners()
        await aof.setApprovalForAll(giveawayContract.address, true)

        expect(await aof.isApprovedForAll(account0.address, giveawayContract.address)).to.be.true

        const limit = await aof.totalSupply()

        const tokenIds = Array.from({ length: limit.toNumber() }).map((_, i) => i + 1)

        await giveawayContract.addNFT(aof.address, tokenIds)

        for (let tokenId of tokenIds) {
          expect(await aof.ownerOf(tokenId)).to.be.equal(
            giveawayContract.address,
            "Not owned by the contract"
          )
        }
      })

      it("Should be possible to setup the drop", async () => {
        await transferAllTokens(aof, giveawayContract)

        expect(await giveawayContract.dropSet()).to.be.false

        await setupDrop(giveawayContract)

        expect(await giveawayContract.dropSet()).to.be.true
      })

      it("Should successfully fire event on callback", async function () {
        await transferAllTokens(aof, giveawayContract)

        await setupDrop(giveawayContract)

        const { firstRandomNumber, secondRandomNumber } = await fulfillRandomWords(
          giveawayContract,
          vrfCoordinatorV2Mock
        )

        expect(firstRandomNumber).to.be.gt(0, "Invalid randomness")
        expect(secondRandomNumber).to.be.gt(0, "Invalid randomness")
      })

      it("Should be able to claim the first drop", async function () {
        await transferAllTokens(aof, giveawayContract)

        const {
          maxFirst,
          maxSecond,
          maxThird,
          firstTree,
          secondTree,
          thirdTree,
          numberOfPrizesFirst,
          numberOfPrizesSecond,
          numberOfPrizesThird,
        } = await setupDrop(giveawayContract)

        const { firstRandomNumber, secondRandomNumber } = await fulfillRandomWords(
          giveawayContract,
          vrfCoordinatorV2Mock
        )

        const firstStartLeaf = secondRandomNumber.mod(maxFirst).toNumber()
        const secondStartLeaf = secondRandomNumber.mod(maxSecond).toNumber()
        const thirdStartLeaf = secondRandomNumber.mod(maxThird).toNumber()
        const NFTStart = firstRandomNumber
          .mod(numberOfPrizesFirst + numberOfPrizesSecond + numberOfPrizesThird)
          .toNumber()

        const firstPPLeaves = processLeaves(maxFirst)
        const firstTreeLeaves = firstTree.getHexLeaves()
        for (let i = 0; i < firstPPLeaves.length; i++) {
          const proof = firstTree.getHexProof(firstTreeLeaves[i])

          const ind = adjustLeafIndex(i, firstStartLeaf, maxFirst)

          const indToClaim = adjustNFTIndex(
            ind,
            firstRandomNumber
              .mod(numberOfPrizesFirst + numberOfPrizesSecond + numberOfPrizesThird)
              .toNumber(),
            numberOfPrizesFirst + numberOfPrizesSecond + numberOfPrizesThird
          )

          console.log(
            `Trying to claim ${indToClaim} for ${i}. Start Leaf: ${firstStartLeaf} NFT Start: ${NFTStart} Adjusted index: ${ind} Number of prizes: ${numberOfPrizesFirst}`
          )

          await giveawayContract.claimNFT(0, proof, firstTreeLeaves[i], i, firstPPLeaves[i])

          if (indToClaim < 10) {
            const token = await giveawayContract.nftToDrop(indToClaim)
            const owner = await aof.ownerOf(token.tokenId)
            expect(owner).to.be.equal(firstPPLeaves[i], "Wrong owner")
          }
        }

        console.log("After first", (await aof.balanceOf(giveawayContract.address)).toNumber())

        const secondPPLeaves = processLeaves(maxSecond)
        const secondTreeLeaves = secondTree.getHexLeaves()

        const secondResults = await Promise.allSettled(
          secondPPLeaves.map(async (leaf: string, i: number) => {
            const proof = secondTree.getHexProof(secondTreeLeaves[i])

            const ind = adjustLeafIndex(i, secondRandomNumber.mod(maxSecond).toNumber(), maxSecond)

            const indToClaim = adjustNFTIndex(
              ind + numberOfPrizesFirst,
              firstRandomNumber
                .mod(numberOfPrizesFirst + numberOfPrizesSecond + numberOfPrizesThird)
                .toNumber(),
              numberOfPrizesFirst + numberOfPrizesSecond + numberOfPrizesThird
            )

            console.log(
              `Trying to claim ${indToClaim} for ${i}. Start Leaf: ${secondStartLeaf} NFT Start: ${NFTStart} Adjusted index: ${ind} Number of prizes: ${numberOfPrizesSecond}`
            )

            await giveawayContract.claimNFT(1, proof, secondTreeLeaves[i], i, leaf)

            let owner
            if (indToClaim < 10) {
              const token = await giveawayContract.nftToDrop(indToClaim)
              owner = await aof.ownerOf(token.tokenId)
            }

            return { owner, expectedOwner: secondPPLeaves[i] }
          })
        )

        console.log("After second", (await aof.balanceOf(giveawayContract.address)).toNumber())

        secondResults.forEach((result: any) => {
          if (result.status !== "fulfilled") return

          expect(result.value.owner).to.be.equal(result.value.expectedOwner, "Wrong owner")
        })

        const thirdPPLeaves = processLeaves(maxThird)
        const thirdTreeLeaves = thirdTree.getHexLeaves()

        const thirdResults = await Promise.allSettled(
          thirdPPLeaves.map(async (leaf: string, i: number) => {
            const proof = thirdTree.getHexProof(thirdTreeLeaves[i])
            const ind = adjustLeafIndex(i, secondRandomNumber.mod(maxThird).toNumber(), maxThird)

            const indToClaim = adjustNFTIndex(
              ind + numberOfPrizesFirst + numberOfPrizesSecond,
              firstRandomNumber
                .mod(numberOfPrizesFirst + numberOfPrizesSecond + numberOfPrizesThird)
                .toNumber(),
              numberOfPrizesFirst + numberOfPrizesSecond + numberOfPrizesThird
            )

            console.log(
              `Trying to claim ${indToClaim} for ${i}. Start Leaf: ${thirdStartLeaf} NFT Start: ${NFTStart} Adjusted index: ${ind} Number of prizes: ${numberOfPrizesThird}`
            )

            await giveawayContract.claimNFT(2, proof, thirdTreeLeaves[i], i, leaf)

            let owner
            if (indToClaim < 10) {
              const token = await giveawayContract.nftToDrop(indToClaim)
              owner = await aof.ownerOf(token.tokenId)
            }

            return { owner, expectedOwner: thirdPPLeaves[i] }
          })
        )

        thirdResults.forEach((result: any) => {
          if (result.status !== "fulfilled") return

          expect(result.value.owner).to.be.equal(result.value.expectedOwner, "Wrong owner")
        })

        console.log("Remaining tokens", (await aof.balanceOf(giveawayContract.address)).toNumber())
      })
    })

async function setupDrop(giveawayContract: Giveaway) {
  const maxFirst = 5
  const maxSecond = 5
  const maxThird = 5

  const numberOfPrizesFirst = 10
  const numberOfPrizesSecond = 10
  const numberOfPrizesThird = 10

  const firstTree = computeTree(maxFirst)
  const secondTree = computeTree(maxSecond)
  const thirdTree = computeTree(maxThird)

  await giveawayContract.setupDrop(
    [firstTree.getHexRoot(), secondTree.getHexRoot(), thirdTree.getHexRoot()],
    [maxFirst, maxSecond, maxThird],
    [numberOfPrizesFirst, numberOfPrizesSecond, numberOfPrizesThird]
  )

  return {
    maxFirst,
    maxSecond,
    maxThird,
    firstTree,
    secondTree,
    thirdTree,
    numberOfPrizesFirst,
    numberOfPrizesSecond,
    numberOfPrizesThird,
  }
}

async function transferAllTokens(nftExp: AttackOnFactoryNFT, giveawayContract: Giveaway) {
  await nftExp.setApprovalForAll(giveawayContract.address, true)
  const limit = await nftExp.totalSupply()
  const tokenIds = Array.from({ length: limit.toNumber() }).map((_, i) => i + 1)
  await giveawayContract.addNFT(nftExp.address, tokenIds)
  return true
}

async function fulfillRandomWords(
  giveawayContract: Giveaway,
  vrfCoordinatorV2Mock: VRFCoordinatorV2Mock
) {
  const requestId: BigNumber = await giveawayContract.s_requestId()
  await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, giveawayContract.address)

  const firstRandomNumber: BigNumber = await giveawayContract.s_randomWords(0)
  const secondRandomNumber: BigNumber = await giveawayContract.s_randomWords(1)

  return {
    firstRandomNumber,
    secondRandomNumber,
  }
}

function adjustLeafIndex(index: number, startIndex: number, participants: number) {
  const difference = index - startIndex
  const remaining = participants - startIndex

  if (difference >= 0) {
    return difference
  } else {
    return remaining + index
  }
}

function adjustNFTIndex(index: number, startIndex: number, dropLength: number) {
  if (startIndex + index >= dropLength) {
    return (startIndex + index) % dropLength
  }

  return startIndex + index
}
