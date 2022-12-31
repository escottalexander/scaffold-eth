import { Tooltip } from "antd";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function MessageBubble({ message, address, contactAddress }) {
  return (
    <>
      <Tooltip
        title={`Message was sent at ${new Date(message.timestamp * 1000).toLocaleTimeString()} on ${new Date(
          message.timestamp * 1000,
        ).toLocaleDateString()}.`}
      >
        <p style={{ textAlign: message.from == address ? "right" : "left" }}>{message.message}</p>
      </Tooltip>
    </>
  );
}

export default MessageBubble;
