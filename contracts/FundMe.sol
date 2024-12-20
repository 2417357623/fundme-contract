
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    mapping (address =>uint256) public fundersToAmount;
    uint256 MINIMUM_VALUE = 1 * 10 ** 18;
    AggregatorV3Interface internal dataFeed;

    uint256 constant TARGET = 100 * 10 ** 18;
    
    address public owner;

    address erc20Addr;

    //告诉通证合约是否完成了资金募集。
    bool public getFundSuccess = false; 

    constructor(){
        // sepolia testnet
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        owner = msg.sender;
    }

    function fund() external payable {
        require(convertETHToUsd(msg.value) >= MINIMUM_VALUE, "send more ETH" );
        fundersToAmount[msg.sender] = msg.value;
    }
    
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertETHToUsd(uint256 ethAmount) internal view returns(uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        //因为chainlink精度是10*8所以，除法之后得到的usd
        return ethAmount * ethPrice/(10**8);
    }
    //合约的拥有者可以取回募集的资金
    function getFund() external  {
        require(convertETHToUsd(address(this).balance) >= TARGET,"Target is not reached");
        require(msg.sender == owner,"the function can only be called by owner");
        //solidity三个转账方式
        payable (msg.sender).transfer(address(this).balance);
        fundersToAmount[msg.sender] = 0;
        //第二种
        //         bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "Send failed");
        getFundSuccess = true;
        //第三种是call
    }

    //用户可以取回自己的coin
    function refund() external {
        require(convertETHToUsd(address(this).balance) < TARGET,"Target is reached");
        uint256 amount = fundersToAmount[msg.sender];
        require(amount != 0 , "there is no fund for you");
        bool success;
        (success, ) = payable(msg.sender).call{value:amount}("");
        require(success,"transfer tx failed");
        fundersToAmount[msg.sender] = 0;
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender == owner,"the function can only be called by owner");
        owner = newOwner;
    }

    //限定只有erc20可以调用这个合约的这两个方法，来设置合约的余额。
    function setErc20Addr(address _erc20Addr) public {
        require(msg.sender == owner,"the function can only be called by owner");
        erc20Addr = _erc20Addr;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr,"you do not have permission to call");
        fundersToAmount[funder] = amountToUpdate;
    }
    
}