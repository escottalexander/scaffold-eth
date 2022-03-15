/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import "./Balloons.css";
import { balloons } from "./balloons.json";

export default function Balloons({
    //balloons
}) {
    console.log(balloons);
    const screenWidth = window.innerWidth;
    const screenHeight = screenWidth * (48 / 28);
    console.log(screenWidth, screenHeight);
    const currentDate = new Date().getTime();//1647230400000;
    const endDate = 1647835200000;
    const difference = endDate - currentDate;
    // if the endDate - balloons timestamp == 0 it means the balloon is at the very top of the screen
    // if the endDate - balloons timestamp == `difference` it means the balloon is at the very bottom of the screen
    const heightRatio = (screenHeight * .85) / difference;

    const [balloonPositions, setBalloonPositions] = useState([]);

    const dispersedBalloons = balloons.map(balloon => {
        const id = parseInt(balloon.id.hex, 16);

        // this is both deterministic (so that they don't hop around on reflow)
        // and pseudo-random so that all the balloons don't bunch together
        const numFromHash = (hash, place) => {
            // returns a pseudo-random number between 1 and 16
            const pos = parseInt(hash[place], 16) + 1;
            return pos;
        }
        const xPos = numFromHash(balloon.attributes.find(a => a.trait_type === "color").value, 1);
        const xVariance = numFromHash(balloon.attributes.find(a => a.trait_type === "color").value, 3);
        // Balloon X position is based on id so that it always appears in the same place
        const balloonX = ((screenWidth / 20) * xPos) + (xVariance * 2);

        const oneThroughFour = (num) => {
            if (num <= 4) {
                return num
            } else if (num > 4 && num <= 8) {
                return num - 4
            } else if (num > 8 && num <= 12) {
                return num - 8
            } else if (num > 12 && num <= 16) {
                return num - 12
            }
        }

        const wobbleEffectNum = oneThroughFour(numFromHash(balloon.attributes.find(a => a.trait_type === "color").value, 2));

        const balloonY = (endDate - balloon.timestamp) * heightRatio;

        return (
            <img key={id + "-" + balloon.name} src={balloon.image} className={"wobble-" + wobbleEffectNum} width="100" style={{ position: "absolute", left: balloonX + "px", top: balloonY + "px" }}></img>
        )
    })

    return (
        <div>
            {dispersedBalloons}
        </div>
    );
}
