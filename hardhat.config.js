/** @type import('hardhat/config').HardhatUserConfig */
const config = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            viaIR: true  // Enable IR-based compiler to fix "stack too deep" errors
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    networks: {
        hardhat: {
            chainId: 1337,
        },
        bittensorTestnet: {
            url: "https://test.chain.opentensor.ai",
            chainId: 945,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    },
};

export default config;
