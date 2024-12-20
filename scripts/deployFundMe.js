import pkg from "hardhat"; // 导入整个 Hardhat 模块
const { ethers } = pkg; // 从 Hardhat 模块中解构出 ethers

async function main() {
  //using factory mode to build contract examples and simplify deployment

  //读取合约的源代码，并进行编译。通常它会从指定的路径或项目中查找合约的编译文件。
  // 因为这些过程可能涉及到文件操作、网络请求等，可能需要一些时间，所以它是异步的
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  console.log("contract deploying");
  //deploy 会发送一笔交易到区块链上，要求矿工将合约的字节码（bytecode）写入区块链。
  const fundMe = await fundMeFactory.deploy();
  //用来等待部署的合约被确认，意思是等待合约被成功地广播到区块链并且进入一个块。
  await fundMe.waitForDeployment();
  console.log(
    `contract has been deployed successfully, contract address is ${fundMe.target}`
  );

  //判断如果我们处在sepolia测试网，并且设置好了ehterscan 的 apiKey才会去往etherscan发送验证
  if (hre.network.config.chainId == 11155111 && process.env.API_KEY) {
    //等一定时间，来让以太坊区块链浏览器写入到他自己的数据库
    console.log("waiting for five confirmations");
    await fundMe.deploymentTransaction().wait(5);

    //默认部署是用的本地的网络和提供几个测试的钱包

    //自动化的验证
    await hre.run("verify:verify", {
      address: fundMe.target,
      constructorArguments: [],
    });
  }else{
    console.log("verification skip");
  }
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
