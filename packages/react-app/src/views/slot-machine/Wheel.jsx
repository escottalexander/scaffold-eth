import React, { useCallback, useEffect, useState, useRef } from "react";

import "./SlotMachine.css";
/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Wheel({ selectedIndex, readContracts }) {
  // const [wheel, setWheel] = useState(null);
  const wheel = useRef();
  const theta = 360 / 6; // 6 slots
  // const [cellHeight, setCellHeight] = useState(120);
  const cellHeight = 116;
  // const [radius, setRadius] = useState(288);
  const radius = Math.round(cellHeight / 2 / Math.tan(Math.PI / 6));
  // useEffect(()=>{
  //     if (wheel && wheel.current && wheel.current.offsetHeight) {
  //         // setCellHeight(wheel.current.offsetHeight);
  //         setRadius(Math.round( ( cellHeight / 2) / Math.tan( Math.PI / 6 ) ));
  //     }
  // },[wheel])

  useEffect(() => {
    updateSlots();
    rotateWheel();
  }, [radius, cellHeight]);

  useEffect(() => {
    if (wheel) {
      rotateLikeCrazy(selectedIndex.selectedIndex);
    }
  }, [selectedIndex]);

  const rotateWheel = index => {
    if (wheel && wheel.current && wheel.current) {
      var angle = theta * index * -1;
      wheel.current.style.transform = "translateZ(" + -radius + "px) rotateX(" + angle + "deg)";
    }
  };

  const rotateLikeCrazy = endIndex => {
    let currentIndex = selectedIndex.selectedIndex;
    let i = 1000;
    while (i > 0) {
      setTimeout(() => {
        rotateWheel(currentIndex++);
      }, i + 100);
      i--;
    }
  };

  const [slots, setSlots] = useState([]);

  const updateSlots = () => {
    const slots = [1, 2, 3, 4, 5, 6];
    const slotCount = slots.length;
    const slotElements = [];
    for (let i = 0; i < slots.length; i++) {
      if (i < slotCount) {
        const slotAngle = theta * i;
        const transform = "rotateX(" + slotAngle + "deg) translateZ(" + radius + "px)";
        const style = {
          opacity: 1, // visible slot
          transform,
        };
        slotElements.push(
          <div className="slot__cell" style={style}>
            {slots[i]}
          </div>,
        );
      } else {
        const style = {
          opacity: 0, // hidden slot
          transform: "none",
        };
        slotElements.push(
          <div className="slot__cell" style={style}>
            {slots[i]}
          </div>,
        );
      }
    }
    setSlots(slotElements);
  };

  return (
    <div className="wheel" ref={wheel}>
      {slots}
    </div>
  );
}

export default Wheel;
