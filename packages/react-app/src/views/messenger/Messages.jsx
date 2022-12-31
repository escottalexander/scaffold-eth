import { Layout, Empty } from "antd";
import { useEffect, useState } from "react";
import { MessageBubble } from "./";

const { Content } = Layout;

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Messages({ receivedMessages, sentMessages, address, contactAddress }) {
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
