/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import "./Balloons.css";
// import { balloons } from "./balloonsStubData.json";
export default function Balloons({ balloons }) {
  console.log(balloons);
  const screenWidth = window.innerWidth;
  const screenHeight = screenWidth * (48 / 28); // background ratio
  console.log(screenWidth, screenHeight);
  const dispersedBalloons = balloons.map(balloon => {
    
    // const endDate = startDate + 1000; // ((604800000 / 7) / 4); // launchDate + 6 hours (remove / 28 to make one week)
    // const difference = endDate - startDate;

    // const heightRatio = screenHeight / difference;
    // console.log(currentDate, startDate, endDate, difference, heightRatio);
    // this is both deterministic (so that they don't hop around on reflow)
    // and pseudo-random so that all the balloons don't bunch together
    const numFromHex = (hex, place) => {
      // trim the 0x from the hex string
      if (hex[1] === "x") {
        hex = hex.slice(2);
      }
      // returns a pseudo-random number between 1 and 16
      const pos = parseInt(hex[place], 16) + 1;
      return pos;
    };
    const xPos = numFromHex(balloon.seed, 1);
    const yPos = numFromHex(balloon.seed, 2);
    const variance = numFromHex(balloon.seed, 3);
    // Balloon X position is based on seed so that it always appears in the same place
    const balloonX = (screenWidth / 20) * xPos + variance * 2;
    const balloonY = (screenHeight / 60) * yPos + variance * 2;

    const wobbleEffectNum = balloon.seed.slice(2)[3];
    // define the condition for the ballon to be considered "launched"
    const hasLaunched = () => {
      const currentDate = new Date().getTime() / 1000;
      const launchDate = Number(balloon.launchDate);
      return !(currentDate - launchDate < 120);
    } 
    return (
      <img
        key={balloon.name}
        src={balloon.image}
        className={"balloon" + (hasLaunched() ? " wobble-" + wobbleEffectNum : "") }
        width="100"
        style={{ position: "absolute", left: balloonX + "px", top: ( hasLaunched() ? (screenHeight - 300) + "px" : balloonY + "px") }}
      />
    );
  });
  console.log(dispersedBalloons);
  return <div>{dispersedBalloons}</div>;
}
