import React, { useState } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { useLocalStorage, useEventListener } from "../../hooks";
import { Link, Route, Switch, useLocation, useHistory } from "react-router-dom";
import Blockies from "react-blockies";
import { ethers } from "ethers";
import { Contract, AddressInput } from "../../components";
import { PlusCircleOutlined, BugOutlined } from "@ant-design/icons";
import { Button, Menu, Layout, Alert, Space } from "antd";
import { Messenger } from ".";
import EthCrypto from "eth-crypto";
import { useEffect } from "react";

const { Content, Sider } = Layout;
const getItem = (label, key, icon, isContact) => {
  return {
    key,
    icon,
    label,
    isContact,
  };
};

const ContactManager = ({
  address,
  tx,
  userSigner,
  provider,
  mainnetProvider,
  readContracts,
  writeContracts,
  price,
  blockExplorer,
  contractConfig,
  DEBUG,
}) => {
  const [contactMenuItems, setContactMenuItems] = useState([getItem("Add Contact", "", <PlusCircleOutlined />, false)]);
  const { currentTheme } = useThemeSwitcher();
  const location = useLocation();
  const history = useHistory();
  const [credentials, setCredentials] = useLocalStorage(`messagingCredentials`, {
    [address]: { pubKey: "", privKey: "" },
  });
  const [isRegistered, setIsRegistered] = useLocalStorage(`isRegistered`, { [address]: false });
  const [userContacts, setUserContacts] = useLocalStorage(`userContacts`, { [address]: [] });
  const [userMessages, setUserMessages] = useLocalStorage("userMessageEvents", { [address]: [] });

  const messageEvents = useEventListener(readContracts, "EthereumInstantMessenger", "MessageSent", provider);
  console.log("📟 Transfer events:", messageEvents);

  useEffect(() => {
    // get all contacts
    const myMessages = messageEvents
      .filter(m => m.args.to === address)
      .map(e => {
        return { to: e.args.to, from: e.args.from, blockNumber: e.blockNumber, message: e.args.message };
      });
    setUserMessages(Object.assign({}, userMessages, { [address]: myMessages }));
    for (let event of myMessages) {
      if (!userContacts[address][event.from] && event.from !== address) {
        setUserContacts(Object.assign({}, userContacts, { [address]: userContacts[address].concat(event.from) }));
      }
    }
  }, [messageEvents]);

  useEffect(() => {
    // undefined check
    if (!userContacts[address]) {
      setUserContacts(Object.assign({}, userContacts, { [address]: [] }));
    }
    // get all user contacts from state
    const menuItems = [getItem("Add Contact", "", <PlusCircleOutlined />, false)];
    if (userContacts[address]) {
      for (let contact of userContacts[address]) {
        const key = `contact/${contact}`;
        if (!menuItems.find(i => i.key == key)) {
          menuItems.push(getItem(contact, key, <Blockies seed={contact.toLowerCase()} size={8} scale={2} />, true));
        }
      }
    }
    if (DEBUG) {
      menuItems.push(getItem("Debug Contract", "debug", <BugOutlined />));
    }
    setContactMenuItems(menuItems);
  }, [userContacts[address], address]);

  const onAddressChange = async () => {
    // Get users registration state
    if (!credentials[address] || credentials[address].pubKey == "") {
      // sign message and use signed message as entropy for credentials
      const signedMessage = await userSigner.signMessage("Signing in to generate messaging credentials");

      // generate new keys with eth-crypto and store them locally
      const identity = EthCrypto.createIdentity(Buffer.from(signedMessage, "utf8"));
      // store identity as attached to current address
      setCredentials(
        Object.assign({}, credentials, {
          [address]: {
            pubKey: identity.publicKey,
            privKey: identity.privateKey,
          },
        }),
      );
    }
    // check to see if address already has key
    const existingPubKey = await readContracts["EthereumInstantMessenger"].getUserPubKey(address);

    if (existingPubKey != "" && credentials[address] && existingPubKey == credentials[address].pubKey) {
      setIsRegistered(Object.assign({}, isRegistered, { [address]: true }));
    } else {
      setIsRegistered(Object.assign({}, isRegistered, { [address]: false }));
    }

    // change back to default view
    history.push("/");
  };

  useEffect(() => {
    onAddressChange();
  }, [address]);

  const registerUser = async () => {
    // sign message and use signed message as entropy for credentials
    const signedMessage = await userSigner.signMessage("Signing in to generate messaging credentials");
    // check to see if address already has key
    const existingPubKey = await readContracts["EthereumInstantMessenger"].getUserPubKey(address);

    // generate new keys with eth-crypto and store them locally
    const identity = EthCrypto.createIdentity(Buffer.from(signedMessage, "utf8"));
    // store identity as attached to current address
    setCredentials(
      Object.assign({}, credentials, {
        [address]: {
          pubKey: identity.publicKey,
          privKey: identity.privateKey,
        },
      }),
    );

    if (existingPubKey != identity.publicKey) {
      // send tx to update your pubkey held in contract
      let hasError = false;
      const result = tx(writeContracts.EthereumInstantMessenger.register(identity.publicKey), update => {
        console.log("📡 Transaction Update:", update);
        if (update && update.error) {
          hasError = true;
          // setIsRegistered(Object.assign({}, isRegistered, { [address]: false }));
        }
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
        }
      });
      console.log("awaiting metamask/web3 confirm result...", result);
      const awaitedResult = await result;
      console.log(awaitedResult);
      if (hasError) {
        setIsRegistered(Object.assign({}, isRegistered, { [address]: false }));
      } else if (awaitedResult) {
        setIsRegistered(Object.assign({}, isRegistered, { [address]: true }));
      }
    } else {
      setIsRegistered(Object.assign({}, isRegistered, { [address]: true }));
    }
  };

  const [toAddress, setToAddress] = useState("");
  const [badAddressMessage, setBadAddressMessage] = useState("");

  const addContact = () => {
    // Validate address
    if (!ethers.utils.isAddress(toAddress)) {
      setBadAddressMessage("Address is invalid.");
      return;
    } else if (toAddress == address) {
      // Make sure it's not our own address - that just leads to some weird side effects
      setBadAddressMessage("You cannot enter your own address.");
      return;
    }
    // add contact to menu, localstorage
    const key = `contact/${toAddress}`;
    // change path to new contact
    history.push(key);
    setUserContacts(Object.assign({}, userContacts, { [address]: userContacts[address].concat(toAddress) }));
    setToAddress("");
  };

  const formatAddress = addr => {
    const displayAddress = addr?.substr(0, 7) + "..." + addr?.substr(-5);
    return displayAddress;
  };

  return (
    <Layout>
      {isRegistered[address] ? (
        ""
      ) : (
        <Alert
          style={{ width: "100%", height: 46 }}
          message="You must register to receive encrypted messages"
          showIcon
          type="warning"
          action={<Button onClick={registerUser}>Register</Button>}
        />
      )}
      <Layout>
        <Sider theme={currentTheme} width={200}>
          <Menu
            style={{ width: 200, height: "100%" }}
            defaultSelectedKeys={["add-contact"]}
            mode="inline"
            theme={currentTheme}
            selectedKeys={[location.pathname]}
          >
            {contactMenuItems.map(i => {
              return (
                <Menu.Item key={`/${i.key}`} icon={i.icon} label={i.label}>
                  <Link to={`/${i.key}`}>{i.isContact ? formatAddress(i.label) : i.label}</Link>
                </Menu.Item>
              );
            })}
          </Menu>
        </Sider>
        <Content>
          <Switch>
            <Route exact path="/">
              <div
                style={{
                  minHeight: "732px",
                  maxHeight: "732px",
                  marginTop: "10%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <h1>Add a Contact</h1>
                <Space direction="horizontal">
                  <AddressInput
                    placeholder="New Contact Address"
                    value={toAddress}
                    onChange={addr => {
                      setToAddress(addr);
                      setBadAddressMessage("");
                    }}
                    ensProvider={mainnetProvider}
                  />
                  <Button onClick={addContact}>Add</Button>
                </Space>
                {badAddressMessage ? (
                  <Alert style={{ alignSelf: "normal", margin: "0 30%" }} message={badAddressMessage} type="error" />
                ) : (
                  ""
                )}
              </div>
            </Route>
            <Route path="/contact/:contactAddress">
              <Messenger
                address={address}
                tx={tx}
                userSigner={userSigner}
                provider={provider}
                mainnetProvider={mainnetProvider}
                readContracts={readContracts}
                writeContracts={writeContracts}
                credentials={credentials[address]}
                userMessages={userMessages[address]}
              />
            </Route>
            <Route exact path="/debug">
              <Contract
                name="EthereumInstantMessenger"
                price={price}
                signer={userSigner}
                provider={provider}
                address={address}
                blockExplorer={blockExplorer}
                contractConfig={contractConfig}
              />
            </Route>
          </Switch>
        </Content>
        <Sider theme={currentTheme} width={"40%"}>
          <Content style={{ maxHeight: "790px", overflow: "auto", margin: 20 }}>
            <h1 style={{ fontSize: 20, padding: 20 }}>Ethereum Instant Messenger</h1>
            <p>
              A prototype to demonstrate the use of public key cryptography for the sending and receiving of messages.
              Through the use of ephemeral keys, we can encrypt and decrypt messages without using/exposing a users
              private key. Their ephemeral set of keys is derived from their signature so it can be replicated on any
              device.
            </p>
            <p>
              By default, this app uses burner wallets so signing occurs without any prompt to the user. If you wish to
              use a web3 wallet then you can do that as well. When you first change accounts you will be asked to sign a
              message. This message is then used as entropy for generating a new private and public key pair. Because we
              are using an ephemeral set of keys for the encryption you must "register" with the smart contract after
              generating your new keys. This way any user can look up your web3 address and find your associated public
              key. Now other users are able to encrypt messages using your public key that only you can read (with your
              private key).
            </p>
            <p>
              To test the app, open two windows, with at least one being a private browsing window so they don't share
              local storage. You can then add the address of the opposite window to your list of contacts and send
              messages back and forth. The content of these messages are completely visible on chain. Now click the
              "Register" button on each window. Each session should now recognize that the contact has registered with
              the smart contract and any messages will be encrypted and not able to be read on chain without the private
              key.
            </p>
            <p>
              Real world use cases for a messaging app built on top of Ethereum is very small considering the cost of
              block space and the lack of need for message permanence in most cases.
            </p>
            <p>Here are some ideas to improve:</p>
            <ul style={{ textAlign: "left" }}>
              <li>Build on top of Lens Protocol</li>
              <li>Integrate with IPFS or Arweave so that the only thing sent on-chain is the hash of the content</li>
              <li>Implement Lit Protocol</li>
              <li>
                Only use ECDSA with public key cryptography to send a shared secret and use AES (symmetric key
                cryptography) for the content encryption
              </li>
              <li>
                Perhaps we could reliable store messages off-chain and only use the chain for secret sharing and sharing
                the location of messages
              </li>
              <li>
                Look for the potential to use a users existing keys instead of generating ephemeral ones. The
                functionality for this is currently being deprecated in Metamask
              </li>
              <li>Securely store ephemeral keys. Currently using Local Storage which is not a good idea</li>
            </ul>
            <p>
              Built with <a href="https://github.com/scaffold-eth/scaffold-eth">Scaffold-Eth</a>, a forkable Ethereum
              development stack focused on fast product iterations.
            </p>

            <p>
              Scaffold-Eth is built and maintained by the <a href="https://buidlguidl.com/">Buidl Guidl</a>, a curated
              group of Ethereum builders creating products, prototypes, and tutorials to enrich the web3 ecosystem with
              a special focus on on-boarding developers to the Ethereum ecosystem.
            </p>
          </Content>
        </Sider>
      </Layout>
    </Layout>
  );
};
export default ContactManager;
