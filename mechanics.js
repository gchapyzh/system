'use strict';
const majObj = require('./majorObjects2.json');

const cos   = Math.cos;
const sin   = Math.sin;
const PI    = Math.PI;
const sqrt  = Math.sqrt;

const kepCalc = (bodyo, time = bodyo.t, mode = 'n', mat  = 0) => {
  if(!bodyo){throw 'kepCalc() err: no bodyo given.';}

  let primaryo = majObj[bodyo.primary];

  let a    = bodyo.a;    // semi-major axis (a)
  let e    = bodyo.e;    // eccentricity (e)
  let t0   = bodyo.t0;   // epoch (days) (t0)
  let w    = bodyo.w;    // argument of periapsis (w)
  let lang = bodyo.lang; // longitude of ascention node (lang)
  let inc  = bodyo.inc;  // inclanation (inc)
  let maz  = bodyo.maz;
  // let focalShift = 0;
  // let maz  = bodyo.maz;  // mean anomaly at zero (maz)
  // time (days) (t)

  const calcMAT = () => {
    a = a * Math.pow(10, 9);
    const g = 6.674 * Math.pow(10, -11); // Gravitational constant G
    const mass = primaryo.mass * Math.pow(10, 20); // Central object mass, approximately sol
    const u = g * mass; // Standard gravitational parameter u

    // const calcMinorAxis = (a, e) => {return ( a * sqrt(1 - e * e) );};
    // const b = (calcMinorAxis(a, e)); // minorAxis b[m]

    // distance of focus from center
    // focalShift = ( sqrt(Math.pow(a, 2) - Math.pow(b, 2)) );

    // const epoch = t0; //epoch (given) (days)

    let tdiff = ( 86400 * ( time - t0 ) );
    mat = maz + ( tdiff * sqrt( u / Math.pow(a, 3) ) );
    while (mat < 0) {
      mat += PI * 2;
    }
    mat = mat % (PI * 2);
    // console.log(mat);
  };

  if (mode === 'n') {calcMAT();} // Mean Anomaly at Time

  // Kepler's Equasion: M = E - e * sin(E)= with M(at t) and e(ccentricity)

  const itter = 3;
  let eat = mat;
  for (let i = 0; i < itter; i++) {
    eat = eat - ( (eat - ( e * sin(eat) ) - mat) / ( 1 - e * cos(eat) ) );
  }

  const tat = ( 2 * Math.atan2(
    ( sqrt(1 + e) * sin(eat / 2) ),
    ( sqrt(1 - e) * cos(eat / 2) )
  ) );

  const dist = ( a * ( 1 - ( e * cos(eat) ) ) );

  // Positional vectors in orbital frame o(t)
  const ox = dist * cos(tat);
  const oy = dist * sin(tat);
  // const oz = 0;

  const x = ( ox * ( (cos(w) * cos(lang)) - (sin(w) * cos(inc) * sin(lang)) )
    - oy * ( (sin(w) * cos(lang)) + (cos(w) * cos(inc) * sin(lang)) ) );
  const y = ( ox * ( (cos(w) * sin(lang)) + (sin(w) * cos(inc) * cos(lang)) )
    + oy * ( (cos(w) * cos(inc) * cos(lang)) - (sin(w) * sin(lang)) ) );
  const z = ( ox * ( sin(w) * sin(inc) ) + oy * ( cos(w) * sin(inc) ) );

  let bodyCoords = {
    x: x,
    y: y,
    z: z
  };

  if (mode === 'n') {
    ['x', 'y', 'z'].forEach(e => {
      bodyCoords[e] = bodyCoords[e] / Math.pow(10, 9);
    });
  }

  let primaryCoords = {};

  if (primaryo.type !== 'star') {
    primaryCoords = kepCalc(primaryo, time);
  } else {
    primaryCoords = {
      x: primaryo.x,
      y: primaryo.y,
      z: primaryo.z
    };
  }

  return {
    x: bodyCoords.x + primaryCoords.x,
    y: bodyCoords.y + primaryCoords.y,
    z: bodyCoords.z + primaryCoords.z,
    px: primaryo.x,
    py: primaryo.y,
    pz: primaryo.z
    // focalShift: focalShift
  };
};
exports.kepCalc = kepCalc;

const calcDist = (body1, body2) => {
  return sqrt(
    Math.pow( (body1.x - body2.x), 2 )
  + Math.pow( (body1.y - body2.y), 2 )
  + Math.pow( (body1.z - body2.z), 2 ) );
};
exports.calcDist = calcDist;

const calcTravelTime = (dist, accel) => {
  return sqrt( dist / accel ) * 2;
};
exports.calcTravelTime = calcTravelTime;
