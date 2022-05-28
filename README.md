## Inspiration

Our main passions are classic games (do you also like game cabinets like us?! :P) and modern technologies (Self-Sovereign Identities, blockchain, NFT, etc.). So in this project we tried to bind these two topics together, in order to obtain a sort of vintage NFT game cabinet working with NFTs dropped randomly to a set of users (identified by their addresses). In other words, instead of using coins, you can use NFTs to play with your own character ... if you are lucky enough to win one of them, of course! 😄

## What it does

The whole thing is composed of the following steps:
1. the first one is the participation in the whitelist: if a user wants to try his/her luck, he/she can provide his/her account (his/her Ethereum/Polygon address), or the system administrator can select a set of users that could win the NFTs
2. a Merkle tree of all the users and of all the NFTs to be dropped is computed and this information is provided to a Smart Contract, where the Chainlink VRF is used to randomly extract the winners and to associate them with their prize (or prizes)
3. each user can submit a proof (if it is true, of course) that his/her address is eligible for receiving one or more NFT (in reality, any user can submit to the Smart Contract the information that another address is a winning one): this can be done simply scanning a QR-code and using the "Dropper" web application we have built
4. thanks to the use of Wallet Connect, any user with a valid NFT in his/her wallet can use our game cabinet to play the Attack on Factory game with his/her character
5. everybody is finally happy

## How we built it

We developed the tool to create the Merkle tree, the Smart Contract to perform the random "extraction", the "Dropper" to allow the winners to
 receive their NFT, the game in which the NFT can be used (by means of Wallet Connect) and finally also the physical game cabinet to maximize the fun! 😆

## How to test it

In order to test it, you can try one of the following accounts (we are providing you with the private keys of the wallets, so that you can import and use them): some of them will be lucky and will receive an NFT to play our game, other will just have to "retry another time"! 😛
List of accounts (private keys):
1. 733de1b207b9ca8adb4ba454c4bce44e14ddc653e2433e11bb41157e0dc1593a
2. 75c458326b7d38350b29c56a06f3de0400bb453785d8397992631e231009075f
3. 33489d5390f866381b5c044c3eec6e5ba614f8333aedde7b892eced782964764
4. 7b46a82c77e8e827c327b53b652f27c5a19dde010aa7dc37fb9802a612ae5095
5. 2349b86b6b05fa79de2ca8bace2b93f86ab65867e3941c079c23fa813aedbb0a
6. f6d1c18a7edd7edb7a7a6a98b7cb46d22832906c9300726da2f49aec8034c134
7. eaaf033719b98c7fca74d71160c9b281236bf3cd33486de8826c318a1304cc4d
8. 5796c52a2b3ece896029dd35da068885cbeb314e190f95cf6503fbeec49271d2
9. e2ef7c36eea17854278f9cc88556a37611fdea7166a1ce449f59972c840eb8f8
10. 9f431ef6ba452d5e81e24668975aeba63c8ec9e851251e858036e6390924c7c1

## Challenges we ran into

A lot. Every part of the project required a non-negligible effort both in the development and in the testing phases. Everything has been built with the idea of minimizing the effort for the user, so we focused on a simple and intuitive UX/UI, and we created a flow in which the users just have to perform very simple tasks to reach the final goal.

## Accomplishments that we're proud of

It works. You can really play a cabinet game with your NFT. And this is the first time for us (and for all the guys that tried our projects in the few last days) that we do it.
We are sorry you cannot use our physical game cabinet, but we invite you to come to us and try it, since the feelings you perceive doing it could be really amazing. You can really feel the connection between the old-style gaming mood and the most modern and advanced technologies, not only in that gaming field.

## What we learned

Again, a lot. We had to use different programming languages, different testing frameworks, and different technologies (both software and hardware). Anyway, probably the most valuable lesson we have learned is that if you really want to achieve something, and if you have a good team, you can do that. And this is amazing for us!

## What's next for Attack On Factory

We still have to finalize and improve some parts of the flow. The setup of the whitelist and of the Merkle tree could be automated a little bit more, and some information and parameters that are right now hardcoded could be made modifiable. More games (even multiplayer ones) could be developed to better exploit the technologies we have developed (NFT and physical game cabinet), and each one of them could reward the users with gift and prizes (we would say still in the form of NFTS!). We are strongly committed to improving our work and we believe we can reach our final goal, even if it will require a lot of effort and dedication.

## Polygon mumbai

Drop contract: 0x3c3667BAE81e40B6c233480A919966D67D3074A4
NFT contract: 0xFbDC5789676c631CEb68Fd234461b12Cf19138Fe

## How to run tests
`yarn test`

