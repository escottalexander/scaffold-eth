import { useContractReader } from "eth-hooks";
import SlotMachineMask from "./slot-machine-mask.jpg";
import { Button, Col, Menu, Row } from "antd";
import { ethers } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SlotMachine.css";
import { default as Wheel } from "./Wheel";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function SlotMachine({ yourLocalBalance, readContracts }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const [selectedIndex1, setSelectedIndex1] = useState({ totalSpins: 0, selectedIndex: 0 });
  const [selectedIndex2, setSelectedIndex2] = useState({ totalSpins: 0, selectedIndex: 0 });
  const [selectedIndex3, setSelectedIndex3] = useState({ totalSpins: 0, selectedIndex: 0 });

  const spinSlots = () => {
    console.log("Spinning!");
    const getRandNum = max => {
      const num = Math.floor(Math.random() * (max - 0 + 1)) + 0;
      console.log(num);
      return num;
    };
    const totalSpins = selectedIndex1.totalSpins + 1;
    setSelectedIndex1({ totalSpins, selectedIndex: getRandNum(5) });
    setSelectedIndex2({ totalSpins, selectedIndex: getRandNum(5) });
    setSelectedIndex3({ totalSpins, selectedIndex: getRandNum(5) });
  };

  return (
    <div>
      <div className="slots">
        <div className="container">
          <Wheel key="wheel1" selectedIndex={selectedIndex1} />
        </div>
        <div className="container">
          <Wheel key="wheel2" selectedIndex={selectedIndex2} />
        </div>
        <div className="container">
          <Wheel key="wheel3" selectedIndex={selectedIndex3} />
        </div>
      </div>
      <Button onClick={spinSlots}>Spin!</Button>
      <img alt="slot-machine" className="slot-machine-mask" src={SlotMachineMask} />
    </div>
  );
}

export default SlotMachine;
