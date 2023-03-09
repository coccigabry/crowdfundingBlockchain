// SPDX-License-Identifier: MIT

// PRAGMA
pragma solidity ^0.8.8;

// IMPORTS
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// ERROR CODES
error FundMe__NotOwner();

// INTERFACES, LIBRARIES, CONTRACTS
/**
 * @title A contract for crowd funding
 * @author CocciGabry
 * @notice This contract is to demo a sample funding contract
 * @dev It implements price feeds as our library
 */
contract FundMe {
  // Type declarations
  using PriceConverter for uint256;

  // State variables
  mapping(address => uint256) private s_addressToAmountFunded;
  address[] private s_funders;
  address private immutable i_owner;
  uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
  AggregatorV3Interface private s_priceFeed;

  // Modifiers
  modifier onlyOwner() {
    if (msg.sender != i_owner) revert FundMe__NotOwner();
    _;
  }

  // Functions - order:

  //// constructor
  constructor(address s_priceFeedAddress) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
  }

  //// receive
  receive() external payable {
    fund();
  }

  //// fallback
  fallback() external payable {
    fund();
  }

  //// external
  //// public
  //// internal
  //// private

  /**
   * @notice This function funds this contract
   * @dev It implements price feeds as our library
   */
  function fund() public payable {
    s_addressToAmountFunded[msg.sender] += msg.value;
    s_funders.push(msg.sender);
  }

  function withdraw() public payable onlyOwner {
    for (
      uint256 funderIndex = 0;
      funderIndex < s_funders.length;
      funderIndex++
    ) {
      address funder = s_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    (bool success, ) = payable(msg.sender).call{value: address(this).balance}(
      ""
    );
    require(success, "Transfer failed");
  }

  function cheaperWithdraw() public payable onlyOwner {
    address[] memory funders = s_funders;
    for (uint256 funderIdx = 0; funderIdx < funders.length; funderIdx++) {
      address funder = funders[funderIdx];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    (bool success, ) = i_owner.call{value: address(this).balance}("");
    require(success, "Transfer failed");
  }

  //// view / pure
  function getOwner() public view returns (address) {
    return i_owner;
  }

  function getFunder(uint256 index) public view returns (address) {
    return s_funders[index];
  }

  function getAddressToAmountFunded(
    address funder
  ) public view returns (uint256) {
    return s_addressToAmountFunded[funder];
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}
