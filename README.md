# 🏗 scaffold-eth - Exos

Renders animated SVG NFTs of star systems on Optimism. They look something like this but with 100% more spin.

![Example Exo NFT](https://github.com/sfaber34/scaffold-eth/blob/exos/ExampleExo.png?raw=true)

This project is a fork of Optimistic Loogies https://optimistic.loogies.io/ | https://github.com/scaffold-eth/scaffold-eth/tree/optimistic-loogies-master

It's a hack job - definitely not coded in a very efficient way and the method of pulling system attributes at mint could easily be gamed **BUT** it draws some spinny solar system NFTs. Hopefully it's a jumping off point for something cooler.


# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

## Getting Started

### Installation

### Manual setup

> clone/fork 🏗 scaffold-eth optimistic-loogies-master branch:

```
git clone -b exos-random-optimized https://github.com/sfaber34/scaffold-eth.git exos-random-optimized

```

> install and start your 👷‍ Hardhat chain:

```bash
cd exos-random-optimized
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd exos-random-optimized
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd exos-random-optimized
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app


## Introduction

This branch renders animated solar system SVG NFTs based on provided details about the system's star and planets.


**Structs.sol** contains struct definitions used to hold system attributes:

```
  struct Planet {
    uint16 radius; // Planet radius (pixels)
    uint16 orbDist; // Planet orbit distance; radial distance from star centroid to planet centroid (pixels)
    string colorA; // Base planet color (hex)
    string colorB; // Secondary planet color (hex)
    string colorC; // Tertiary planet color (hex)
    string colorD; // You get it...
  }

  struct System {
    string name; // The system/star name
    uint16 radius; // Star radius (pixels)
    uint16 colorH; // Star Hue
    string sequence; // Star type: main sequence or dwarf  
  }
```
**System.name** and **System.sequence** are used for descriptions and rendering text in the bottom corners of NFTs. Remaining Planet/System attributes are used for layout.<br /><br />

**SystemData.sol** has functions for filling/returning System/Planet structs. **createSystem()** is a messy boi that randomly picks a number of planets, planet radii, planet hex colors, system sector, star radius, and star hue. Planet colors can be anything but the star is restricted to yellow, orange, or blueish (using hsl() format). The function then checks if the chosen star/planet radii will fit in the SVG and reduces planet radii if not. Finally, the function calculates the radial distance to place planets so that they're roughly evenly spread out.<br /><br />

The logic for building out star system SVGs for render lives in the **ReturnSvg.sol** library.
```
function returnSvg()
```
Gets System and Planets structs from **SystemData.sol** and does a bunch of string(abi.encodePacked()) to build out SVG tags for render.

Initial planet xy positions are calculated by trig identities in
```
function calcPlanetXY(uint256 rDist_, uint256 rads)
```

The remaining attributes needed for layout are pulled from System/Planet structs.<br /><br /><br /><br />

Much of the code in YourCollectible.sol is the same as Optimistic Loogies (some things in there definitely need edits to work with this fork if you want to take it live).

## Known Issues

- **Trigonometry.sol** (https://github.com/mds1/solidity-trigonometry) isn't being imported correctly. Works but can't be smart.
- Rendering the background star field (**ReturnSvg.sol:82-107**) really slows down the app. Commented out for now.
- There's no restrictions on possible planet colors (**Planet.colorA**, **Planet.colorB**, **Planet.colorC**) so there could be very dark planets which looks meh.
- I tried some css hackery to disable the light mode in frontend. Causes legibility issues with addresses.
- Need to make ant card in /yourExos responsive so it fits on little screens

# 🍦 Other Flavors
- [scaffold-eth-typescript](https://github.com/scaffold-eth/scaffold-eth-typescript)
- [scaffold-eth-tailwind](https://github.com/stevenpslade/scaffold-eth-tailwind)
- [scaffold-nextjs](https://github.com/scaffold-eth/scaffold-eth/tree/scaffold-nextjs)
- [scaffold-chakra](https://github.com/scaffold-eth/scaffold-eth/tree/chakra-ui)
- [eth-hooks](https://github.com/scaffold-eth/eth-hooks)
- [eth-components](https://github.com/scaffold-eth/eth-components)
- [scaffold-eth-expo](https://github.com/scaffold-eth/scaffold-eth-expo)
- [scaffold-eth-truffle](https://github.com/trufflesuite/scaffold-eth)



# 🔭 Learning Solidity

📕 Read the docs: https://docs.soliditylang.org

📚 Go through each topic from [solidity by example](https://solidity-by-example.org) editing `YourContract.sol` in **🏗 scaffold-eth**

- [Primitive Data Types](https://solidity-by-example.org/primitives/)
- [Mappings](https://solidity-by-example.org/mapping/)
- [Structs](https://solidity-by-example.org/structs/)
- [Modifiers](https://solidity-by-example.org/function-modifier/)
- [Events](https://solidity-by-example.org/events/)
- [Inheritance](https://solidity-by-example.org/inheritance/)
- [Payable](https://solidity-by-example.org/payable/)
- [Fallback](https://solidity-by-example.org/fallback/)

📧 Learn the [Solidity globals and units](https://docs.soliditylang.org/en/latest/units-and-global-variables.html)

# 🛠 Buidl

Check out all the [active branches](https://github.com/scaffold-eth/scaffold-eth/branches/active), [open issues](https://github.com/scaffold-eth/scaffold-eth/issues), and join/fund the 🏰 [BuidlGuidl](https://BuidlGuidl.com)!


 - 🚤  [Follow the full Ethereum Speed Run](https://medium.com/@austin_48503/%EF%B8%8Fethereum-dev-speed-run-bd72bcba6a4c)


 - 🎟  [Create your first NFT](https://github.com/scaffold-eth/scaffold-eth/tree/simple-nft-example)
 - 🥩  [Build a staking smart contract](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-1-decentralized-staking)
 - 🏵  [Deploy a token and vendor](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-2-token-vendor)
 - 🎫  [Extend the NFT example to make a "buyer mints" marketplace](https://github.com/scaffold-eth/scaffold-eth/tree/buyer-mints-nft)
 - 🎲  [Learn about commit/reveal](https://github.com/scaffold-eth/scaffold-eth-examples/tree/commit-reveal-with-frontend)
 - ✍️  [Learn how ecrecover works](https://github.com/scaffold-eth/scaffold-eth-examples/tree/signature-recover)
 - 👩‍👩‍👧‍👧  [Build a multi-sig that uses off-chain signatures](https://github.com/scaffold-eth/scaffold-eth/tree/meta-multi-sig)
 - ⏳  [Extend the multi-sig to stream ETH](https://github.com/scaffold-eth/scaffold-eth/tree/streaming-meta-multi-sig)
 - ⚖️  [Learn how a simple DEX works](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90)
 - 🦍  [Ape into learning!](https://github.com/scaffold-eth/scaffold-eth/tree/aave-ape)

# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# 🏃💨 Speedrun Ethereum
Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

### Automated with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/scaffold-eth/scaffold-eth)
