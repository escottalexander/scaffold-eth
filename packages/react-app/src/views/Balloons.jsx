/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import { Tooltip } from "antd";
import "./Balloons.css";
import { Address } from "../components";

// import { balloons } from "./balloonsStubData.json";
export default function Balloons({ balloons, effect }) {
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
    const variance = numFromHex(balloon.seed, 3); // Variance is used to very slightly tweak X and Y positions so that balloons are dispersed
    // Balloon X and Y positions is based on seed so that it always appears in the same place when page reloads
    const balloonX = (screenWidth / 20) * xPos + variance * 2;
    const balloonY = (screenHeight / 60) * yPos + variance * 2;

    const wobbleEffectNum = balloon.seed.slice(2)[3];
    // define the condition for the balloon to be considered "launched"
    const hasLaunched = () => {
      const currentDate = new Date().getTime();
      const launchDate = Number(balloon.launchDate);
      console.log(currentDate, launchDate, currentDate - launchDate);
      console.log("has launched?", !(currentDate - launchDate < 25000));
      return !(currentDate - launchDate < 25000);
    };

    const formatAddress = addr => {
      return `${addr.substr(0, 6)}...${addr.substr(-4)}`;
    }

    return (
      <>
        <img
          key={balloon.name}
          src={balloon.image}
          onLoad={effect}
          className={"balloon" + (hasLaunched() ? " wobble-" + wobbleEffectNum : "")}
          width="100"
          style={{
            position: "absolute",
            left: hasLaunched() ? balloonX - 50 + "px" : screenWidth - balloonX - 50 + "px", // X start position is opposite from ending X position
            top: hasLaunched() ? balloonY + "px" : screenHeight - 400 + "px",
          }}
        />
        {hasLaunched() ? (
          ""
        ) : (
          <div
            key={balloon.seed}
            style={{
              width: "100px",
              position: "absolute",
              left: screenWidth - balloonX - 50 + "px",
              top: screenHeight - 280 + "px",
            }}
          >
            New Launch By {formatAddress(balloon.owner)}
          </div>
        )}
      </>
    );
  });
  console.log(dispersedBalloons);
  return <div>{dispersedBalloons}</div>;
}
