'use strict';
// Initialization and run
const draw = require('./draw.js');
const renderer = require('onml/renderer.js');
const mech = require('./mechanics.js');
// const ind = require('./industry.js');
const majObj = require('./majorObjects.json');
// const hulls = require('./hulls.json');

const makeStar = (staro) => {
  return staro;
};

const makePlanet = (planeto) => {
  // ind.initInd(planeto);
  const planDat = mech.kepCalc(0, planeto);
  const planet = Object.assign(
    planeto,
    {
      focalShift: planDat.focalShift,
      x: planDat.x,
      y: planDat.y,
      z: planDat.z
    }
  );
  return planet;
};

// const makeMoon = (moono) => {
//   const planDat = mech.kepCalc(moono, 0, majObj[moono.primary]);
//   const moon = Object.assign(
//     moono,
//     {focalShift: planDat.focalShift, x: planDat.x, y: planDat.y, z: planDat.z}
//   );
//   return moon;
// };
//
// const makeCraft = (crafto) => {
//   const craft = Object.assign(
//     crafto,
//     {x: 150000000, y: 0, z: 0}
//   );
//   return craft;
// };

async function delay(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

const main = async () => {
  console.log("Giant alien spiders are no joke!");
  let stars = [];
  let planets = [];
  let moons = [];
  let ast = [];

  // const craft = [];

  Object.keys(majObj).forEach((objName) => {
    // console.log(el);
    if (majObj[objName].type === "star") {
      stars.push(makeStar(majObj[objName]));
    }
    if (majObj[objName].type === "planet") {
      planets.push(makePlanet(majObj[objName]));
    }
    // if (majObj[objName].type === "moon") {
    //   moons.   push(makeMoon(majObj[objName]));
    // }
    // if (majObj[objName].type === "asteroid") {
    //   ast.     push(makeAst(majObj[objName]));
    // }
    else {console.log("ERROR at make. Skipping.");}
  });
  // for (let i = 0; i < 1; i++) {
  //   craft.push(makeCraft(hulls.brick));
  // }

  renderer(document.getElementById('content'))(draw.drawStatic(stars, planets));
  const render2 = renderer(document.getElementById('moving'));

  let movBod = [];
  movBod = movBod.concat(planets, moons, ast);
  while (Date.now()) {
    const clock = Date.now();
    const t = clock / Math.pow(10, 4);
    const clock2 = Date(clock);

    for (let i = 0; i < movBod.length; i++) {
      let newData = mech.kepCalc(t, movBod[i]);
      movBod[i].x = newData.x;
      movBod[i].y = newData.y;
      movBod[i].z = newData.z;
    }

    render2(draw.drawMoving(clock2, planets, moons, ast));
    await delay(1000);
  }
};

window.onload = main;
