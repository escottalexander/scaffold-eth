/* eslint-disable react/button-has-type */
/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect, useRef } from "react";
import "./Balloons.css";
import { LoadingOutlined } from "@ant-design/icons";
import { Carousel, Space, Spin, Tag } from "antd";
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
      const tokensMetadata = await response.json();
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

  const balloonColorElements = attributes => {
    const output = [];
    for (const attr of attributes) {
      output.push(
        <Tag style={{ margin: 10 }} color={attr.value}>
          <h1 style={{ margin: 10, textShadow: "none", fontSize: 40 }}>{attr.value.toUpperCase()}</h1>
        </Tag>,
      );
    }
    return output;
  };
  console.log(selectedBalloon);
  return (
    <>
      {!isLoadingBalloons ? (
        <div
          style={{
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            borderRadius: "25px",
            width: "100%",
            height: "100%",
            fontFamily: "AirBalloon",
            fontSize: 20,
          }}
        >
          {allMyBalloons && allMyBalloons.length > 0 ? (
            <h2 style={{ marginTop: 50 }}>Mint a balloon to launch it on the big screen</h2>
          ) : (
            <h2>
              AUSTIN, WRITE SOMETHING HERE. Contrary to popular belief, Lorem Ipsum is not simply random text. It has
              roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard
              McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure
              Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical
              literature, discovered the undoubtable source.
            </h2>
          )}
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
          {allMyBalloons && allMyBalloons.length > 0 ? (
            <>
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
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    textShadow: "2px 2px 7px #000",
                  }}
                >
                  <h1 style={{ fontSize: 36 }}>{selectedBalloon.name}</h1>
                  <h1 style={{ fontSize: 36 }}>
                    Launched On: {new Date(Number(selectedBalloon.launchDate)).toDateString()}
                  </h1>
                  <h1 style={{ fontSize: 36 }}>Your balloon has the following colors:</h1>
                  <div>{balloonColorElements(selectedBalloon.attributes)}</div>
                </div>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
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
