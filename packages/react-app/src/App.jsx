import { ArrowRightOutlined, DownOutlined } from "@ant-design/icons";
import "./fonts/Air Balloon - TTF.ttf";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { formatEther, parseEther } from "@ethersproject/units";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import QR from "qrcode.react";
import { utils } from "ethers";
import React, { useCallback, useEffect, useState, useRef } from "react";
import ReactJson from "react-json-view";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import StackGrid from "react-stack-grid";
import Web3Modal from "web3modal";
import "./App.css";
// import assets from "./assets.js";
import { BlockPicker } from "react-color";
import ReactCanvasConfetti from "react-canvas-confetti";
import { Account, Address, AddressInput, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch, NetworkDisplay } from "./components";
import { Balloons } from "./views";
import { DAI_ABI, DAI_ADDRESS, INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
  useExternalContractLoader,
  useGasPrice,
  useOnBlock,
  useUserProvider,
} from "./hooks";
import exampleData from "./example-data";
import MintPage from "./views/MintPage";

const { BufferList } = require("bl");
// https://www.npmjs.com/package/ipfs-http-client

const ipfsAPI = require("ipfs-http-client");

const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

// console.log("📦 Assets: ", assets);

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
const indexerUrl = "http://localhost:32889";
// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;
const USE_NETWORK_SELECTOR = true;

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
// const getFromIPFS = async hashToGet => {
//   for await (const file of ipfs.get(hashToGet)) {
//     console.log(file.path);
//     if (!file.content) continue;
//     const content = new BufferList();
//     for await (const chunk of file.content) {
//       content.append(chunk);
//     }
//     console.log(content);
//     return content;
//   }
// };

// 🛰 providers
// if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = new StaticJsonRpcProvider(
  "https://mainnet.infura.io/v3/" + INFURA_ID /* "https://rpc.scaffoldeth.io:48544" */,
);
const mainnetInfura = new StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

// const screenWidth = window.innerWidth;
// const screenHeight = screenWidth * (48 / 28); // background ratio

function App(props) {
  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  const [mintUrl, setMintUrl] = useState("");
  const [isFullView, setIsFullView] = useState(false);
  useEffect(() => {
    // Check and set route
    setIsFullView(window.location.pathname === "/full-view");
    setMintUrl(window.location.origin);
    // start currentTime counter
    setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 2000);
  }, []);

  const [isLoadingBalloons, setIsLoadingBalloons] = useState(true);
  const [existingBalloons, setExistingBalloons] = useState([]);
  useEffect(() => {
    if (!isFullView) return;
    async function fetchData() {
      const balloons = [];
      let fullPageReturned = false;
      let page = 1;
      const perPage = 100;
      while (!fullPageReturned) {
        try {
          const response = await fetch(`${indexerUrl}/all?page=${page}&perPage=${perPage}`);
          const tokensMetadata = await response.json();
          fullPageReturned = tokensMetadata.length !== perPage;
          page++;
          balloons.push(...tokensMetadata);
        } catch (e) {
          fullPageReturned = true;
          console.error(e);
        }
      }
      setExistingBalloons(balloons);
      setIsLoadingBalloons(false);
    }
    fetchData();
  }, [isFullView]);

  // confetti setup
  // const canvasStyles = {
  //   position: "fixed",
  //   pointerEvents: "none",
  //   width: "100%",
  //   height: "100%",
  //   top: 0,
  //   left: 0,
  //   zIndex: -1,
  // };
  // const refAnimationInstance = useRef(null);

  // const getInstance = useCallback(instance => {
  //   refAnimationInstance.current = instance;
  // }, []);

  // const makeShot = useCallback((particleRatio, opts) => {
  //   refAnimationInstance.current &&
  //     refAnimationInstance.current({
  //       ...opts,
  //       origin: { y: 0.8 },
  //       particleCount: Math.floor(200 * particleRatio),
  //     });
  // }, []);

  // const showConfetti = useCallback(() => {
  //   makeShot(0.25, {
  //     spread: 26,
  //     startVelocity: 55,
  //   });

  //   makeShot(0.2, {
  //     spread: 60,
  //   });

  //   makeShot(0.35, {
  //     spread: 100,
  //     decay: 0.91,
  //     scalar: 0.8,
  //   });

  //   makeShot(0.1, {
  //     spread: 120,
  //     startVelocity: 25,
  //     decay: 0.92,
  //     scalar: 1.2,
  //   });

  //   makeShot(0.1, {
  //     spread: 120,
  //     startVelocity: 45,
  //   });
  // }, [makeShot]);
  // end confetti setup
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;
  const [injectedProvider, setInjectedProvider] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect === "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  // const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const isSigner = injectedProvider && injectedProvider.getSigner && injectedProvider.getSigner()._isSigner;

  // If you want to call a function on a new block
  // useOnBlock(mainnetProvider, () => {
  //   console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  // });

  // Then read your DAI balance like:
  /*
  const myMainnetDAIBalance = useContractReader({ DAI: mainnetDAIContract }, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]); */

  // // keep track of a variable from the contract in the local React state:
  // const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [address]);
  // // console.log("🤗 balance:", balance);

  const [pageLoadBlock, setPageLoadBlock] = useState(0);

  useEffect(() => {
    const getBlockNumber = () => {
      const blockNumber = localProvider.blockNumber + 1;
      setPageLoadBlock(blockNumber);
      console.log("transferEvents block: ", blockNumber);
    };
    if (localProvider.blockNumber > 0 && pageLoadBlock === 0) {
      getBlockNumber();
    }
  }, [localProvider.blockNumber]);
  // 📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, "YourCollectible", "Transfer", localProvider, pageLoadBlock);
  // console.log("📟 Transfer events:", transferEvents);

  // const scrollToBottom = instant => {
  //   window.scrollTo({
  //     top: 10000,
  //     behavior: instant ? "auto" : "smooth",
  //   });
  // };

  // Scroll and confetti!
  // const balloonScrollWithConfetti = () => {
  //   // scroll to bottom of page
  //   scrollToBottom();
  //   // show confetti
  //   // showConfetti();
  // };

  // Scroll to bottom of page on load
  // useEffect(() => {
  //   scrollToBottom(true);
  // }, []);
  //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //
  // const total = useContractReader(readContracts, "YourCollectible", "totalSupply");
  const [mintingBalloon, setMintingBalloon] = useState(false);
  const [myMintedBalloons, setMyMintedBalloons] = useState([]);
  const [newBalloons, setNewBalloons] = useState([]);
  // const [userMintedTokenId, setUserMintedTokenId] = useState();

  const mintItem = async () => {
    setMintingBalloon(true);
    const timeStamp = new Date().getTime();
    await tx(writeContracts.YourCollectible.mintItem(timeStamp), async update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
        setTimeout(() => {
          setMintingBalloon(false);
        }, 4000);
      } else {
        setMintingBalloon(false);
      }
    });
  };

  useEffect(() => {
    const updateYourCollectibles = async () => {
      const balloons = [...newBalloons];
      for await (const balloon of transferEvents) {
        const tokenId = balloon.tokenId.toNumber();
        if (balloons.findIndex(b => b.id === tokenId) === -1) {
          try {
            console.log("💰 tokenId:", tokenId);
            const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
            const jsonManifestString = atob(tokenURI.substring(29));
            try {
              const jsonManifest = JSON.parse(jsonManifestString);
              balloons.push({ id: tokenId, uri: tokenURI, ...jsonManifest });
            } catch (e) {
              console.log(e);
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
      setNewBalloons(balloons);
      const myBalloons = balloons.filter(b => b.owner.toLowerCase() === address.toLowerCase());
      setMyMintedBalloons(myBalloons);
    };
    updateYourCollectibles();
  }, [transferEvents]);
  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  let faucetHint = "";
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name === "localhost";

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId === 31337 &&
    yourLocalBalance &&
    formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ position: "absolute", zIndex: 5, padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: address,
              value: parseEther("0.01"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      {isFullView ? "" : <Header />}
      {isFullView ? (
        ""
      ) : (
        <NetworkDisplay
          NETWORKCHECK={NETWORKCHECK}
          localChainId={localChainId}
          selectedChainId={selectedChainId}
          targetNetwork={targetNetwork}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
        />
      )}

      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <MintPage
              isSigner={isSigner}
              mintItem={mintItem}
              loadWeb3Modal={loadWeb3Modal}
              address={address}
              myMintedBalloons={myMintedBalloons}
              mintingBalloon={mintingBalloon}
              indexerUrl={indexerUrl}
            />
          </Route>
          <Route exact path="/full-view">
            <Balloons
              existingBalloons={existingBalloons}
              balloons={newBalloons}
              loading={isLoadingBalloons}
              currentTime={currentTime}
              mainnetProvider={mainnetProvider}
            />
            <h1
              style={{
                fontFamily: "AirBalloon",
                fontSize: "42px",
                color: "#6d15de",
                margin: "0 50px 40px",
                position: "absolute",
                right: 150,
                bottom: 0,
              }}
            >
              Scan the QR code to launch a balloon! {">"}
            </h1>
            <QR
              style={{ position: "absolute", right: 0, bottom: 0 }}
              value={mintUrl}
              size="150"
              level="H"
              includeMargin
              renderAs="svg"
              imageSettings={{ excavate: false }}
            />
          </Route>
          <Route path="/debug">
            <div style={{ padding: 32 }}>
              <Address
                value={readContracts && readContracts.YourCollectible && readContracts.YourCollectible.address}
              />
            </div>

            <Contract
              name="YourCollectible"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      {/* <ThemeSwitch /> */}

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      {isFullView ? (
        ""
      ) : (
        <div style={{ zoom: "130%", position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
          <Account
            address={address}
            localProvider={localProvider}
            userProvider={userProvider}
            // mainnetProvider={mainnetProvider}
            // price={price}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            blockExplorer={blockExplorer}
            isSigner={isSigner}
          />
          {faucetHint}
        </div>
      )}

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      {true ? (
        ""
      ) : (
        <div style={{ zIndex: 999, position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
          <Row align="middle" gutter={[4, 4]}>
            <Col span={8}>
              <Ramp /* price={price} */ address={address} networks={NETWORKS} />
            </Col>

            <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
              <GasGauge gasPrice={gasPrice} />
            </Col>
            <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
              <Button
                onClick={() => {
                  window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
                }}
                size="large"
                shape="round"
              >
                <span style={{ marginRight: 8 }} role="img" aria-label="support">
                  💬
                </span>
                Support
              </Button>
            </Col>
          </Row>

          <Row align="middle" gutter={[4, 4]}>
            <Col span={24}>
              {
                /*  if the local provider has a signer, let's show the faucet:  */
                faucetAvailable ? (
                  <Faucet localProvider={localProvider} /* price={price} ensProvider={mainnetProvider} */ />
                ) : (
                  ""
                )
              }
            </Col>
          </Row>
        </div>
      )}
      {/* <ReactCanvasConfetti refConfetti={getInstance} style={canvasStyles} /> */}
    </div>
  );
}

/* eslint-disable */
window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

window.ethereum &&
  window.ethereum.on("accountsChanged", accounts => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });
/* eslint-enable */

export default App;
