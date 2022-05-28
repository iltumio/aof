// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AttackOnFactoryNFT is Ownable, ERC721, ERC721Enumerable {
  using Counters for Counters.Counter;

  string metadataURI;
  string contractMetadataURI;

  event PermanentURI(string _value, uint256 indexed _id);

  Counters.Counter private currentTokenId;

  constructor(
    string memory name_,
    string memory symbol_,
    string memory metadataURI_,
    uint256 reservedTokens_
  ) ERC721(name_, symbol_) {
    metadataURI = metadataURI_;
    for (uint256 i = 0; i < reservedTokens_; i++) {
      mint(owner());
    }
  }

  /**
   * @dev Get contract baseURI
   */
  function _baseURI() internal pure override returns (string memory) {
    return "ipfs://";
  }

  /**
   * @dev Get metadata uri of a specific token
   * @param tokenId id of the token
   */
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
    string memory baseURI = _baseURI();
    return
      bytes(baseURI).length > 0
        ? string(abi.encodePacked(baseURI, metadataURI, "/", Strings.toString(tokenId), ".json"))
        : "";
  }

  function contractURI() public view returns (string memory) {
    return contractMetadataURI;
  }

  /**
   * @dev Mint a new token
   */
  function mint(address to_) public payable {
    currentTokenId.increment();
    _safeMint(to_, currentTokenId.current(), "");
    payable(owner()).transfer(msg.value);
    emit PermanentURI(tokenURI(currentTokenId.current()), currentTokenId.current());
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721Enumerable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
