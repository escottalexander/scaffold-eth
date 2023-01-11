import "./Messages.css";
import { Layout, Empty, Tooltip } from "antd";
import { useEffect, useState } from "react";

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
  return (
    <Layout style={{ maxHeight: 600 }}>
      <Content style={{ minHeight: 600, overflow: "auto", display: "flex", flexDirection: "column-reverse" }}>
        <div className="imessage">
          {messages.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            messages.map(m => (
              <Tooltip
                key={`${m.from}-${m.blockNumber}`}
                title={`Message was sent at ${new Date(m.timestamp * 1000).toLocaleTimeString()} on ${new Date(
                  m.timestamp * 1000,
                ).toLocaleDateString()}.`}
              >
                <p className={m.from === address ? "from-me" : "from-them"}>{m.message}</p>
              </Tooltip>
            ))
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default Messages;
