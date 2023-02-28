/* eslint-disable react/button-has-type */
/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect, useRef } from "react";
import "./Balloons.css";
import { LoadingOutlined } from "@ant-design/icons";
import { Carousel, Space, Spin } from "antd";
import Balloon from "./Balloon";

export default function MintPage({
  isSigner,
  mintItem,
  loadWeb3Modal,
  address,
  myMintedBalloons,
  mintingBalloon,
  indexerUrl,
}) {
  const carousel = useRef();
  const [isLoadingBalloons, setIsLoadingBalloons] = useState(true);
  const [selectedBalloon, setSelectedBalloon] = useState();
  const [mintPressed, setMintPressed] = useState(false);
  const [myBalloons, setMyBalloons] = useState([]);
  const [allMyBalloons, setAllMyBalloons] = useState([]);
  const getBalloonsForAddress = async addr => {
    try {
      const response = await fetch(`${indexerUrl}/all/${addr}`);
      const tokensMetadata = /* await new Promise((resolve) => resolve(exampleData)) */ await response.json();
      setSelectedBalloon(tokensMetadata[0]);
      setMyBalloons(tokensMetadata);
    } catch (e) {
      console.error(e);
    }

    setIsLoadingBalloons(false);
  };
  useEffect(() => {
    getBalloonsForAddress(address);
  }, [address]);
  const goToNew = index => {
    // Wait for reflow
    setTimeout(() => {
      carousel.current.goTo(index, false);
    }, 10);
  };
  const afterChange = () => {
    if (mintPressed) {
      goToNew(allMyBalloons.length - 1);
      setSelectedBalloon(allMyBalloons[allMyBalloons.length - 1]);
      setMintPressed(false);
    }
  };
  useEffect(() => {
    const all = [].concat(myBalloons, myMintedBalloons);
    setAllMyBalloons(all);
  }, [myBalloons, myMintedBalloons]);
  useEffect(() => {
    if (allMyBalloons.length === 1) {
      afterChange();
    }
  }, [allMyBalloons]);

  const showMyBalloons = () => {
    if (allMyBalloons.length === 0) {
      return (
        <div>
          <h1 style={{ fontSize: "128px", margin: "10%" }}>?</h1>
          <h1 style={{ fontSize: "48px" }}>No Balloons Found</h1>
        </div>
      );
    }
    return allMyBalloons.map(balloon => (
      <Balloon
        balloon={balloon}
        x={0}
        y={0}
        screenWidth={300}
        screenHeight={300}
        size="40%"
        position="relative"
        margin="10px 30% 30px"
      />
    ));
  };
  const onChange = (fromSlide, toSlide) => {
    setSelectedBalloon(allMyBalloons[toSlide]);
  };

  return (
    <>
      <div
        style={{
          zIndex: 2,
          position: "absolute",
          top: "100px",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          alignContent: "center",
          alignItems: "center",
          borderRadius: "25px",
          width: "100%",
          height: "100%",
          fontFamily: "AirBalloon",
          fontSize: 20,
        }}
      >
        <h2>Mint a balloon to launch it on the big screen</h2>
        {isSigner ? (
          <button
            className="btn-large-mobile"
            onClick={() => {
              setMintPressed(true);
              mintItem();
            }}
          >
            Mint Balloon
          </button>
        ) : (
          <button className="btn-large-mobile" onClick={loadWeb3Modal}>
            Connect Wallet
          </button>
        )}
        <h1 style={{ marginBottom: 0 }}>My Balloons</h1>
        <div style={{ display: "block", background: "#ffffff30", width: "100%", height: "auto" }}>
          <>
            <h1 style={{ fontSize: 30, margin: 0 }}>
              {allMyBalloons && allMyBalloons.length > 1 ? "< < <  Swipe  > > >" : " "}
            </h1>
            <Carousel ref={carousel} afterChange={afterChange} beforeChange={onChange} dots dotPosition="bottom">
              {showMyBalloons()}
            </Carousel>
          </>
        </div>
        {selectedBalloon ? (
          <div style={{ width: "100%", height: "100%", flex: "1 1 auto", background: "#00000040" }}>
            <h1 style={{ fontSize: 36 }}>{selectedBalloon.name}</h1>
            <h1 style={{ fontSize: 36 }}>Launched On: {new Date(Number(selectedBalloon.launchDate)).toDateString()}</h1>
            <h1 style={{ fontSize: 36 }}>{selectedBalloon.description}</h1>
          </div>
        ) : (
          ""
        )}
      </div>
      {isLoadingBalloons || mintingBalloon ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#00000052",
            zIndex: 999,
          }}
        >
          <Space direction="vertical">
            <Spin
              size="large"
              indicator={<LoadingOutlined style={{ fontSize: "128px" }} />}
              style={{ width: "200px", marginBottom: "100%" }}
            />
          </Space>
        </div>
      ) : (
        ""
      )}
    </>
  );
}
