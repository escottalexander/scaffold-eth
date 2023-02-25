/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import "./Balloons.css";

// import { balloons } from "./balloonsStubData.json";
export default function Balloon({
  balloon,
  x,
  y,
  screenWidth,
  screenHeight,
  currentTime,
  hasLaunched = true,
  size = 70,
}) {
  const formatAddress = addr => {
    return `${addr.substr(0, 6)}...${addr.substr(-4)}`;
  };

  const wobbleEffectNum = balloon.seed.slice(2)[3];

  const [launched, setLaunched] = useState(hasLaunched);

  const hasBeenLaunched = () => {
    return launched;
  };
  useEffect(() => {
    setLaunched(!(currentTime - balloon.launchDate < 25000));
  }, [currentTime]);

  return (
    <>
      <img
        key={"ballon-" + balloon.seed}
        src={balloon.image}
        // onLoad={effect}
        className={"balloon" + (hasBeenLaunched() ? " wobble-" + wobbleEffectNum : "")}
        width={size}
        style={{
          position: "absolute",
          left: hasBeenLaunched() ? x - size / 2 + "px" : screenWidth - x - size / 2 + "px", // X start position is opposite from ending X position
          top: hasBeenLaunched() ? y + "px" : screenHeight - 400 + "px",
        }}
      />
      {hasBeenLaunched() ? (
        ""
      ) : (
        <div
          key={"minter-" + balloon.seed}
          style={{
            width: size + "px",
            position: "absolute",
            left: screenWidth - x - size / 2 + "px",
            top: screenHeight - 280 + "px",
          }}
        >
          New Launch By {formatAddress(balloon.owner)}
        </div>
      )}
    </>
  );
}
