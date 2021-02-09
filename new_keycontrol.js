var keyA = false;
var keyS = false;
var keyD = false;
var keyW = false;

var Interval1 = false;
var Interval2 = false;
var Interval3 = false;

setInterval(function () {

  if (!Interval1) {
    Interval1 = true;
    if (keyD || keyA || keyS || keyW) {

      var idx = -1;
      for (var i = 0; i < GameShips.length; i++) {
        //if (GameShips[i].shipname === "rocket2")
        {
          let body_index = GameShips[i].body_index();

          if (keyD) {
            GameShips[i].rotate_ship(-0.5);
          }

          if (keyA) {
            GameShips[i].rotate_ship(0.5);
          }

          if (keyS) {
          }

          if (keyW) {
            GameShips[i].fire_engines(0.08);
          }
        }
      }
    }
    Interval1 = false;
  }

}, 1);

setInterval(function () {
  if (!Interval2) {
    Interval2 = true;
    for (var i = 0; i < GameShips.length; i++) {

      if (keyS) {
        GameShips[i].fire_guns();
      }
    }
    Interval2 = false;
  }
}, 250);

setInterval(function () {

  if (!Interval3) {
    Interval3 = true;
    if (keyD || keyA || keyS || keyW) {

      var idx = -1;
      for (var i = 0; i < GameShips.length; i++) {

        //if (GameShips[i].shipname === "rocket2")
        {
          // let body_index = GameShips[i].body_index();
          if (keyW) {
            GameShips[i].addGas();
            console.log("add gas");
          }
        }
      }
    }
    Interval3 = false;
  }

}, 50);


setTimeout(function () {
  setInterval(function () {

    for (var i = 0; i < GameShips.length; i++) {
//      GameShips[i].addGas();
      GameShips[i].fire_guns();
    }
    console.log(world.bodies.length + " " + scene.children.length + " " + ballMeshes.length);

  }, 500);
},2500);

//event listener
window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);

function onKeyDown(event) {
  var keyCode = event.keyCode;
  switch (keyCode) {
    case 68: //d
      keyD = true;
      keyW = false;
      break;
    case 83: //s // no breaking in space
      keyS = true;
      break;
    case 65: //a
      keyA = true;
      keyW = false;
      break;
    case 87: //w
      // if (!keyW) {
      //   if (typeof playerShip !== "undefined") {
      //     controls.target = playerShip.position;
      //     controls.update();
      //   }
      // }
      keyW = true;
      break;
  }
}

function onKeyUp(event) {
  var keyCode = event.keyCode;

  switch (keyCode) {
    case 68: //d
      keyD = false;
      break;
    case 83: //s
      keyS = false;
      // fireball.activeMultiplier = 0;
      break;
    case 65: //a
      keyA = false;
      break;
    case 87: //w
      keyW = false;
      // fireball.activeMultiplier = 0;
      break;
  }
}

