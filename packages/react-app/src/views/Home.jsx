import { Button, Col, Menu, Row, Switch, Form, Input, Checkbox, notification } from "antd";
import { useContractReader } from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { AddressInput, Events } from "../components";
import { ContactManager } from "./messenger";
import { ethers } from "ethers";
import { useLocalStorage } from "../hooks";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EthCrypto from "eth-crypto";

const { TextArea } = Input;
/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ address, tx, userSigner, provider, mainnetProvider, readContracts, writeContracts }) {
  const [form] = Form.useForm();
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  //const purpose = useContractReader(readContracts, "YourContract", "purpose");

  const messageEvents = useEventListener(readContracts, "YourContract", "MessageSent", provider);
  console.log("📟 Transfer events:", messageEvents);
  // const getMyMessages = async () => {
  //   const messages = await readContracts["YourContract"].getAllMessages(userAddress);
  //   console.log(messages);
  //   return messages;
  // }
  // const register = async () => {
  //   //get signature
  //   const signature = await new Promise((resolve, reject) => {
  //   web3.currentProvider.sendAsync({
  //     method: 'personal_sign',
  //     params: [web3.utils.utf8ToHex(message), address],
  //     from: address,
  //     }, (err, response) => {
  //       if(err) return reject(err);
  //       resolve(response.result);
  //     });
  //   });
  //   // send signature
  //   const result = tx(writeContracts.YourContract.register(signature), update => {
  //     console.log("📡 Transaction Update:", update);
  //     if (update && (update.status === "confirmed" || update.status === 1)) {
  //       console.log(" 🍾 Transaction " + update.hash + " finished!");
  //       console.log(
  //         " ⛽️ " +
  //           update.gasUsed +
  //           "/" +
  //           (update.gasLimit || update.gas) +
  //           " @ " +
  //           parseFloat(update.gasPrice) / 1000000000 +
  //           " gwei",
  //       );
  //     }
  //   });
  //   console.log("awaiting metamask/web3 confirm result...", result);
  //   console.log(await result);

  // }
  const [credentials, setCredentials] = useLocalStorage(`messagingCredentials:${userSigner.address}`, {
    pubKey: "",
    privKey: "",
  });

  const [mySentMessages, setMySentMessages] = useState([]);
  const [myRecievedMessages, setMyRecievedMessages] = useState([]);
  useEffect(async () => {
    const myAddress = await userSigner.getAddress();

    const recieved = messageEvents.filter(m => m.args.to == myAddress);
    for (let m of recieved) {
      try {
        const message = await EthCrypto.decryptWithPrivateKey(
          credentials.privKey, // privateKey
          JSON.parse(m.args.message),
        );
        m.decodedMessage = message;
      } catch (e) {}
    }

    setMyRecievedMessages(recieved);
  }, [messageEvents]);

  const registerUser = async () => {
    // sign message and use signed message as entropy for credentials
    const signedMessage = await userSigner.signMessage("Signing in to generate messaging credentials");
    // check to see if address already has key
    const existingPubKey = await readContracts["YourContract"].getUserPubKey(address);

    // generate new keys with eth-crypto and store them locally
    const identity = EthCrypto.createIdentity(Buffer.from(signedMessage, "utf8"));
    console.log(identity);
    // store identity as attached to current address
    setCredentials({
      pubKey: identity.publicKey,
      privKey: identity.privateKey,
    });

    if (existingPubKey != identity.publicKey) {
      // send tx to update your pubkey held in contract
      const result = tx(writeContracts.YourContract.register(identity.publicKey), update => {
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
        }
      });
      console.log("awaiting metamask/web3 confirm result...", result);
      console.log(await result);
    }
  };

  // const checkUserState = async () => {
  //   // check if local storage account state exists
  //   if (credentials.pubKey) {
  //     // check if local state matches chain state
  //     const existingPubKey = await readContracts["YourContract"].getUserPubKey(userSigner.address);
  //     if (existingPubKey != credentials.pubKey){
  //       // state mismatch - need to reregister
  //       registerUser();
  //     }
  //   }
  // }

  // useEffect(() => {
  //   checkUserState();
  // }, [credentials]);

  const [encrypted, setEncrypted] = useState(false);

  const checkIfRecipientRegistered = async () => {
    const recipient = form.getFieldValue("address");
    const recipientPubKey = await readContracts["YourContract"].getUserPubKey(recipient);
    const recipientRegistered = recipientPubKey != "";
    console.log(recipientRegistered);
    setEncrypted(recipientRegistered);
    form.setFieldsValue({ encrypted: recipientRegistered });
  };

  const sendMessage = async () => {
    const recipient = form.getFieldValue("address");
    let message = form.getFieldValue("message");
    console.log("encrypted: ", encrypted);
    if (encrypted) {
      // get public key of recipient
      const recipientPubKey = await readContracts["YourContract"].getUserPubKey(recipient);
      if (recipientPubKey == "") {
        // show user that reciepient is not registered. Advise them to send unencrypted message telling recipient to register.
        notification.error({
          message: "Recipient Is Not Registered",
          description: "Send them an unencrypted message telling them to register!",
          placement: "bottomRight",
        });
        return;
      }
      // encrypt with recipients public key
      message = await EthCrypto.encryptWithPublicKey(
        recipientPubKey, // publicKey
        message, // message
      );
      console.log(recipientPubKey, message);
    }

    const result = tx(
      writeContracts.YourContract.sendMessage(recipient, JSON.stringify(message), encrypted),
      update => {
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
        }
      },
    );
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
    // getMyMessages();
  };

  return (
    <div>
      {/* <Events 
      contracts={readContracts}
      contractName="YourContract"
      eventName="MessageSent"
      localProvider={provider}
      mainnetProvider={mainnetProvider}
      startBlock={1}
      /> */}
      <ContactManager style={{ width: "100%", height: 200 }} />
      <p>Register to recieve encrypted messages:</p>
      <Button onClick={registerUser}>Register</Button>

      <h3>Send Message</h3>

      <Form
        form={form}
        onFinish={sendMessage}
        labelCol={{
          span: 10,
        }}
        wrapperCol={{
          span: 6,
        }}
        layout="horizontal"
      >
        <Form.Item label="Encryption" valuePropName="checked" name="encrypted">
          <Switch disabled={true} checked={encrypted} checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>
        <Form.Item label="Address" name="address">
          <AddressInput
            placeholder="Recipient Address"
            onChange={() => {
              checkIfRecipientRegistered();
            }}
            ensProvider={mainnetProvider}
          />
        </Form.Item>
        <Form.Item label="Message" name="message">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Send</Button>
        </Form.Item>
      </Form>

      <h3>Recieved Messages</h3>
      {myRecievedMessages.map(m => (
        <p>{m.decodedMessage ? m.decodedMessage : m.args.message}</p>
      ))}
    </div>
  );
}

export default Home;
