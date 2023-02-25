/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import "./Balloons.css";
import { Space, Spin } from "antd";

// import { balloons } from "./balloonsStubData.json";
export default function Balloons({ balloons, existingBalloons, loading }) {
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
    const balloonX = (screenWidth / 20) * xPos + variance * 2;
    const balloonY = (screenHeight / 60) * yPos + variance * 2;

    const wobbleEffectNum = balloon.seed.slice(2)[3];
    return (
      <>
        <img
          key={balloon.name}
          src={balloon.image}
          // onLoad={effect}
          className={"balloon wobble-" + wobbleEffectNum}
          width="100"
          style={{
            position: "absolute",
            left: balloonX - 50 + "px", // X start position is opposite from ending X position
            top: balloonY + "px",
          }}
        />
      </>
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
    const balloonX = (screenWidth / 20) * xPos + variance * 2;
    const balloonY = (screenHeight / 60) * yPos + variance * 2;

    const wobbleEffectNum = balloon.seed.slice(2)[3];
    // define the condition for the balloon to be considered "launched"
    const hasLaunched = lDate => {
      const currentDate = new Date().getTime();
      const launchDate = Number(lDate);
      console.log(currentDate, launchDate, currentDate - launchDate);
      console.log("has launched?", !(currentDate - launchDate < 25000));
      return !(currentDate - launchDate < 25000);
    };

    const formatAddress = addr => {
      return `${addr.substr(0, 6)}...${addr.substr(-4)}`;
    };

    return (
      <>
        <img
          key={balloon.name}
          src={balloon.image}
          // onLoad={effect}
          className={"balloon" + (hasLaunched(balloon.launchDate) ? " wobble-" + wobbleEffectNum : "")}
          width="100"
          style={{
            position: "absolute",
            left: hasLaunched(balloon.launchDate) ? balloonX - 50 + "px" : screenWidth - balloonX - 50 + "px", // X start position is opposite from ending X position
            top: hasLaunched(balloon.launchDate) ? balloonY + "px" : screenHeight - 400 + "px",
          }}
        />
        {hasLaunched(balloon.launchDate) ? (
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
  console.log(newMintBalloons, oldBalloons);
  return (
    <div>
      {loading ? (
        <Space
          direction="vertical"
          style={{ left: screenWidth / 2 - 100, top: screenHeight / 2 - 100, position: "absolute" }}
        >
          <Spin size="large" style={{ width: "200px" }} />
        </Space>
      ) : (
        ""
      )}
      {newMintBalloons}
      {oldBalloons}
    </div>
  );
}
