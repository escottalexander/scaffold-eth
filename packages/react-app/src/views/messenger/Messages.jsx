import { Button, Col, Menu, Row, Switch, Form, Input, Checkbox, notification, Layout, Tooltip, Empty } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useContractReader } from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { AddressInput, Events } from "../../components";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EthCrypto from "eth-crypto";
import { MessageBubble } from "./";

const { TextArea } = Input;
const { Content, Sider, Header } = Layout;

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Messages({ receivedMessages, sentMessages, address, contactAddress }) {
  console.log(receivedMessages, sentMessages);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const combined = receivedMessages[contactAddress].concat(sentMessages[contactAddress]).sort((a, b) => {
      return a.blockNumber - b.blockNumber;
    });
    setMessages(combined);
  }, [receivedMessages[contactAddress], sentMessages[contactAddress]]);
  // TODO format messages to look totally rad
  return (
    <Layout style={{ minHeight: 600, maxHeight: 600 }}>
      <Content>
        {messages.length == 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          messages.map(m => (
            <MessageBubble
              key={`${contactAddress}-${m.blockNumber}`}
              message={m}
              address={address}
              contactAddress={contactAddress}
            />
          ))
        )}
      </Content>
    </Layout>
  );
}

export default Messages;
