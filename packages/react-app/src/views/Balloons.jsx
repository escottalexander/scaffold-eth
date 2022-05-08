/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import "./Balloons.css";
//import { balloons } from "./balloonsStubData.json";

export default function Balloons({
    balloons
}) {
    console.log(balloons);
    const screenWidth = window.innerWidth;
    const screenHeight = screenWidth * (48 / 28); // background ratio
    console.log(screenWidth, screenHeight);

    const [balloonPositions, setBalloonPositions] = useState([]);

    const dispersedBalloons = balloons.map(balloon => {
        const currentDate = new Date().getTime() / 1000;
        const startDate = Number(balloon.launchDate);
        const endDate = startDate + 1000//((604800000 / 7) / 4); // launchDate + 6 hours (remove / 28 to make one week)
        const difference = endDate - startDate;
        // if the endDate - balloons launchDate == 0 it means the balloon is at the very top of the screen
        // if the endDate - balloons launchDate == `difference` it means the balloon is at the very bottom of the screen
        const heightRatio = ((screenHeight) / difference);

        console.log(currentDate, startDate, endDate, difference, heightRatio);

        const id = parseInt(balloon.id.hex, 16);

        // this is both deterministic (so that they don't hop around on reflow)
        // and pseudo-random so that all the balloons don't bunch together
        const numFromHash = (hash, place) => {
            // returns a pseudo-random number between 1 and 16
            const pos = parseInt(hash[place], 16) + 1;
            return pos;
        }
        const xPos = numFromHash(balloon.attributes.find(a => a.trait_type === "color1").value, 1);
        const xVariance = numFromHash(balloon.attributes.find(a => a.trait_type === "color1").value, 3);
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

        const wobbleEffectNum = oneThroughFour(numFromHash(balloon.attributes.find(a => a.trait_type === "color1").value, 2));

        const balloonY = (screenHeight - 400) - ((currentDate - startDate) * heightRatio);
        // balloon doesn't show if the endDate has passed
        if (balloonY <= -125) return;

        return (
            <img key={id + "-" + balloon.name} src={balloon.image} className={"wobble-" + wobbleEffectNum} width="100" style={{ position: "absolute", left: balloonX + "px", top: balloonY + "px" }}></img>
        )
    });
    console.log(dispersedBalloons);
    return (
        <div>
            {dispersedBalloons}
        </div>
    );
}
