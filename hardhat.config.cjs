require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config() //为了可以使用.env里定义的变量

//Hardhat failed to send contract verification request and returned ECONNRESET 如何通过代理解决 Etherscan 验证失败的问题？
//https://github.com/smartcontractkit/full-blockchain-solidity-course-js/discussions/2247
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);

//提取.env存储的值
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_KEY = process.env.API_KEY;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork:"hardhat",//hardhat提供的默认的本地网络
  solidity: "0.8.28",
  networks:{
    sepolia:{
      //url是RPC URL。节点是区块链网络的一部分，负责处理交易、维护区块链状态等。
      //Hardhat 本身并不运行一个完整的区块链节点，它通过提供的 url 连接到远程节点或服务来与区块链交互。
      //可以通过像 Infura、Alchemy 这样的服务来获取一个 RPC URL。
      url:SEPOLIA_URL,
      //设置账号的私钥，用她来签名和授权区块链上的操作，来部署合约，发送交易等
      accounts:[PRIVATE_KEY],
      chainId:11155111
    }
  },
  etherscan: {
    // Your API key for Etherscan,，允许你在 Hardhat 中自动验证和上传智能合约源代码到 Etherscan。
    //使用 Etherscan 的验证功能可以提高合约的透明度，允许其他开发者和用户查看和审核你的合约代码，增加可信度。
    apiKey: {
      sepolia:API_KEY
    }
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};
