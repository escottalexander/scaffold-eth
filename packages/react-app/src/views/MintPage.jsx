/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from "react";
import "./Balloons.css";
import { Button } from "antd";
// import { Tag } from "antd";
// import { Blockie } from "../components";

// import { balloons } from "./balloonsStubData.json";
export default function MintPage({ isSigner, mintItem, loadWeb3Modal }) {
  return (
    <>
      <div
        style={{
          zIndex: 2,
          position: "absolute",
          left: "10%",
          top: "300px",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          alignContent: "center",
          alignItems: "center",
          background: "#ffffff52",
          borderRadius: "25px",
          width: "80%",
          padding: "20px",
          fontFamily: "AirBalloon",
          fontSize: 20,
        }}
      >
        <h2 style={{ fontSize: 30, fontWeight: 800, color: "#7445a1" }}>
          Launch a balloon in support of the BuidlGuidl
        </h2>
        {isSigner ? (
          <Button
            style={{ marginTop: 20 }}
            type="primary"
            onClick={() => {
              mintItem();
            }}
          >
            Launch Balloon
          </Button>
        ) : (
          <Button type="primary" onClick={loadWeb3Modal}>
            Connect Wallet
          </Button>
        )}
      </div>
    </>
  );
}
