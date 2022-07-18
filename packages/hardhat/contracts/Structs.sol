// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Structs {
  
  // since string will take up 1 slot so with this order the total slots consumed by the struct are 3 instead of 4
  struct System {
    string name; // The system/star name
    string category; // Star type: main sequence or dwarf
    bytes32 entropy;
    uint16[2] coordinates; // Galactic x/y system coordinates
    uint16 radius; // Star radius (pixels)
    uint16 hue; // Star Hue
    uint8 nGas; // Number of gas planets
    uint8 nRocky; // Number of rocky, mars-like worlds
    uint8 nHabitable; // Number of habitable, earth-like worlds
  }

  struct Planet {
    bytes32 entropy;
    uint16 radius; // Planet radius (pixels)
    uint16 orbDist; // Planet orbit distance; radial distance from star centroid to planet centroid (pixels)
    uint8 category; 
    uint16 hueA; // Base planet hue
    uint16 hueB; // Secondary planet hue
    uint16 hueC; // Tertiary planet hue
    uint16 hueD; // You get it...
    uint16 hueE;
    uint16 turbScale; // Smear filter turbulance scale. Adds more variation in planet appearance
  }

  // struct PlanetResources {
  //   bool hydrogen;
  //   bool helium;
  //   bool oxygen;
  //   bool water;
  //   bool ammonia;
  //   bool methane;
  //   bool iron;
  //   bool nickel;
  //   bool copper;
  //   bool aluminium;
  //   bool silicon;
  //   bool gold;
  //   bool silver;
  //   bool titanium;
  //   bool chromium;
  //   bool platinum;
  //   bool lithium;
  //   bool palladium;
  //   bool cobalt;
  //   bool selenium;
  // }

}