/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import "./Balloons.css";
import { LoadingOutlined } from "@ant-design/icons";
import { Space, Spin } from "antd";
import Balloon from "./Balloon";

// import { balloons } from "./balloonsStubData.json";
export default function Balloons({ balloons, existingBalloons, loading, currentTime, mainnetProvider }) {
  const balloonSize = 70;
  const screenWidth = window.innerWidth;
  const screenHeight = screenWidth * (48 / 28); // background ratio
  // console.log(screenWidth, screenHeight);
  const oldBalloons = existingBalloons.map(balloon => {
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
    const balloonX = (screenWidth / 17) * xPos + variance * 4 - balloonSize / 2;
    const balloonY = (screenHeight / 35) * yPos + variance * 10;

    return (
      <Balloon
        balloon={balloon}
        x={balloonX}
        y={balloonY}
        screenHeight={screenHeight}
        screenWidth={screenWidth}
        currentTime={currentTime}
      />
    );
  });
  const newMintBalloons = balloons.map(balloon => {
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
    const balloonX = (screenWidth / 17) * xPos + variance * 4 - balloonSize / 2;
    const balloonY = (screenHeight / 35) * yPos + variance * 10;

    // Create Balloon element that gets reflowed at interval
    return (
      <Balloon
        balloon={balloon}
        x={balloonX}
        y={balloonY}
        screenHeight={screenHeight}
        screenWidth={screenWidth}
        currentTime={currentTime}
        hasLaunched={false}
        mainnetProvider={mainnetProvider}
      />
    );
  });
  console.log(newMintBalloons, oldBalloons);
  return (
    <div>
      {loading ? (
        <Space
          direction="vertical"
          style={{ left: screenWidth / 2 - 100, top: screenHeight / 2 - 100, position: "absolute" }}
        >
          <Spin
            size="large"
            indicator={<LoadingOutlined style={{ fontSize: "128px" }} />}
            style={{ width: "200px", marginBottom: "100%" }}
          />
        </Space>
      ) : (
        ""
      )}
      {newMintBalloons}
      {oldBalloons}
    </div>
  );
}
