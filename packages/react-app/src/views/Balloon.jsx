/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import "./Balloons.css";
import { Tag } from "antd";
import { Blockie } from "../components";

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
    <div
      className="balloon"
      style={{
        width: size,
        position: "absolute",
        left: hasBeenLaunched() ? x - size / 2 + "px" : screenWidth - x - size / 2 + "px", // X start position is opposite from ending X position
        top: hasBeenLaunched() ? y + "px" : screenHeight - 300 + "px",
      }}
    >
      <img
        key={"ballon-" + balloon.seed}
        src={balloon.image}
        // onLoad={effect}
        className={hasBeenLaunched() ? " wobble-" + wobbleEffectNum : ""}
        width="100%"
      />
      {hasBeenLaunched() ? (
        ""
      ) : (
        <div className="owner-tag" key={"minter-" + balloon.seed}>
          <Tag icon={<Blockie size={12} scale={1} address={balloon.owner} />}> {formatAddress(balloon.owner)}</Tag>
        </div>
      )}
    </div>
  );
}
