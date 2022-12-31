import React, { useState } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { useLocalStorage } from "../../hooks";
import { Link, Route, Switch, useLocation, useHistory } from "react-router-dom";
import Blockies from "react-blockies";
import { ethers } from "ethers";
import { Contract, AddressInput } from "../../components";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useEventListener } from "eth-hooks/events/useEventListener";
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

  // TODO only get events for our addresses, this may take awhile if we are loading every event EVER. At least choke it down to the last 1000 blocks or something.
  const messageEvents = useEventListener(readContracts, "EthereumInstantMessenger", "MessageSent", provider);
  console.log("📟 Transfer events:", messageEvents);

  useEffect(() => {
    // get all contacts
    const myMessages = messageEvents
      .filter(m => m.args.to == address)
      .map(e => {
        return { to: e.args.to, from: e.args.from, blockNumber: e.blockNumber, message: e.args.message };
      });
    setUserMessages(Object.assign({}, userMessages, { [address]: myMessages }));
    for (let event of myMessages) {
      if (!userContacts[address][event.from] && event.from != address) {
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
    setContactMenuItems(menuItems);
  }, [userContacts[address]]);

  useEffect(async () => {
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
        <Sider theme={currentTheme} width={200}></Sider>
      </Layout>
    </Layout>
  );
};
export default ContactManager;
