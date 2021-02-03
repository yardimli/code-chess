var keyA = false;
var keyS = false;
var keyD = false;
var keyW = false;

setInterval(function () {

  if (keyD || keyA || keyS ||keyW) {

    var idx = -1;
    for (var i = 0; i < bodies.length; i++) {
      if (bodies[i].name.indexOf("physical_object_rocket2_group") === 0) {
        // console.log(bodies[i].name);

        if (keyD) {

          bodies[i].direction -= 0.5;
          var axis = new CANNON.Vec3(0, 1, 0);
          bodies[i].quaternion.setFromAxisAngle(axis, degrees_to_radians(bodies[i].direction));
        }

        if (keyA) {

          bodies[i].direction += 0.5;
          var axis = new CANNON.Vec3(0, 1, 0);
          bodies[i].quaternion.setFromAxisAngle(axis, degrees_to_radians(bodies[i].direction));
        }

        if (keyS) {

          var localForward = new CANNON.Vec3(0, 0, -1); // correct?
          var worldForward = new CANNON.Vec3();
          bodies[i].vectorToWorldFrame(localForward, worldForward);
          var localVelocity = new CANNON.Vec3(0, 0, -0.02);
          var worldVelocity = bodies[i].quaternion.vmult(localVelocity);
          worldVelocity.y = 0;
          // console.log ( worldVelocity );

          bodies[i].velocity.x += worldVelocity.x;
          bodies[i].velocity.z += worldVelocity.z;
        }

        if (keyW) {
          var localForward = new CANNON.Vec3(0, 0, -1); // correct?
          var worldForward = new CANNON.Vec3();
          bodies[i].vectorToWorldFrame(localForward, worldForward);
          var localVelocity = new CANNON.Vec3(0, 0, 0.2);
          var worldVelocity = bodies[i].quaternion.vmult(localVelocity);
          worldVelocity.y = 0;
          // console.log ( worldVelocity );

          bodies[i].velocity.x += worldVelocity.x;
          bodies[i].velocity.z += worldVelocity.z;
        }
      }
    }
  }

}, 1);

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
      // keyS = true;
      // fireball.activeMultiplier = 10;

      setExplosionCoords();
      if (typeof playerShip !== "undefined") {
        firePew(playerShip)
      }


      break;
    case 65: //a
      keyA = true;
      keyW = false;
      break;
    case 87: //w
      if (!keyW) {
        if (typeof playerShip !== "undefined") {
          controls.target = playerShip.position;
          controls.update();
        }
      }
      keyW = true;


      setExplosionCoords();
      explosion_group.triggerPoolEmitter( 1, worldCoords );

      // fireball.activeMultiplier = 10;
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

