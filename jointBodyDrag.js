function InitJointBody() {
  // Joint body
  var shape = new CANNON.Sphere(0.1);
  jointBody = new CANNON.Body({mass: 0});
  jointBody.addShape(shape);
  jointBody.collisionFilterGroup = 0;
  jointBody.collisionFilterMask = 0;
  world.addBody(jointBody)
}


//----------------------------------------------------------------------------------
function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  if (gplane && mouseConstraint) {
    // console.log( event.clientX + "," + event.clientY );
    var pos = projectOntoPlane(event.clientX, event.clientY, gplane, camera);
    // console.log(pos);
    if (pos) {
      updateClickMarker(pos.x, pos.y, pos.z, scene);
    //  moveJointToPoint(pos.x, pos.y, pos.z);
    }
  }
}


//----------------------------------------------------------------------------------
function onMouseMove2(event) {
  // console.log(event.detail);
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.detail.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.detail.clientY / window.innerHeight) * 2 + 1;
  if (gplane && mouseConstraint) {
    // console.log( event.detail.clientX + "," + event.detail.clientY );
    var pos = projectOntoPlane(event.detail.clientX, event.detail.clientY, gplane, camera);
    // console.log(pos);
    if (pos) {
      updateClickMarker(pos.x, pos.y, pos.z, scene);
    //  moveJointToPoint(pos.x, pos.y, pos.z);
    }
  }
}

//----------------------------------------------------------------------------------
function onMouseDown(e) {
  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  // calculate objects intersecting the picking ray
  var entity = raycaster.intersectObjects(scene.children, true);

  // console.log(entity);
  if (entity.length > 0) {
    var jj = -1;
    for (var i = 0; i < entity.length; i++) {
      console.log(entity[i].object.name);
      if (entity[i].object.name.indexOf("physical_object") === 0) {
        jj = i;
      }
      // entity[ i ].object.material.color.set( 0xff0000 );
    }
    if (jj !== -1) {
      console.log(entity[jj]);

      // Find mesh from a ray
      var pos = entity[jj].point;
      if (pos && (entity[jj].object.geometry instanceof THREE.BoxGeometry || entity[jj].object.geometry instanceof THREE.SphereGeometry)) {
        controls.enabled = false;

        constraintDown = true;
        // Set marker on contact point
        setClickMarker(pos.x, pos.y, pos.z, scene);

        // Set the movement plane
        setScreenPerpCenter(pos, camera);

        var idx2 = -1;
        for (var i = 0; i < meshes.length; i++) {
          if (meshes[i].name === entity[jj].object.name) {
            idx2 = i;
            break;
          }
        }

        var idx = -1;
        for (var i = 0; i < bodies.length; i++) {
          if (bodies[i].name === entity[jj].object.name) {
            idx = i;
            console.log(bodies[i].name + " " + idx);
            break;
          }
        }

        // var idx = meshes.indexOf(entity[jj].object);
        if (idx !== -1) {

          // if (idx2!==-1) {
          //   controls.target = meshes[idx2].position;
          //   controls.update();
          // }


          AllowYMotion = !bodies[idx].fixedRotation;
          addMouseConstraint(pos.x, pos.y, pos.z, bodies[idx]);
        }
      }
    }
  }
}

//----------------------------------------------------------------------------------
// This function creates a virtual movement plane for the mouseJoint to move in
function setScreenPerpCenter(point, camera) {
  // If it does not exist, create a new one
  if (!gplane) {
    var planeGeo = new THREE.PlaneGeometry(100, 100);
    var plane = gplane = new THREE.Mesh(planeGeo, material);
    plane.visible = false; // Hide it..
    plane.name = "gplane";
    scene.add(gplane);
  }

  // Center at mouse position
  gplane.position.copy(point);

  // Make it face toward the camera
  gplane.quaternion.copy(camera.quaternion);
}


//----------------------------------------------------------------------------------
function onMouseUp(e) {
  console.log("mouse up");
  constraintDown = false;

  controls.enabled = true;

  // remove the marker
  removeClickMarker();

  // Send the remove mouse joint to server
  removeJointConstraint();
}


//----------------------------------------------------------------------------------
function projectOntoPlane(screenX, screenY, thePlane, camera) {
  var x = screenX;
  var y = screenY;
  var now = new Date().getTime();
  // project mouse to that plane
  var hit = findNearestIntersectingObject(screenX, screenY, camera, [thePlane]);
  lastx = x;
  lasty = y;
  last = now;
  if (hit)
    return hit.point;
  return false;
}


//----------------------------------------------------------------------------------
function findNearestIntersectingObject(clientX, clientY, camera, objects) {
  // Get the picking ray from the point


  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);
  // calculate objects intersecting the picking ray
  var entity = raycaster.intersectObjects(objects);

  if (entity.length > 0) {
    var jj = -1;
    for (var i = 0; i < entity.length; i++) {
      if (entity[i].object.name.indexOf("gplane") === 0) {
        jj = i;
      }
      // entity[ i ].object.material.color.set( 0xff0000 );
    }
    if (jj !== -1) {
      return entity[jj];
    }
  }
}

//----------------------------------------------------------------------------------
function setClickMarker(x, y, z) {
  if (!clickMarker) {
    var shape = new THREE.SphereGeometry(0.2, 8, 8);
    clickMarker = new THREE.Mesh(shape, markerMaterial);
    scene.add(clickMarker);
  }
  clickMarker.visible = true;
  clickMarker.position.set(x, y, z);
}


//----------------------------------------------------------------------------------
function updateClickMarker(x, y, z) {
  if (!clickMarker) {
    var shape = new THREE.SphereGeometry(0.2, 8, 8);
    clickMarker = new THREE.Mesh(shape, markerMaterial);
    scene.add(clickMarker);
  }
  clickMarker.visible = true;
  if (y >= 0 && AllowYMotion) {
    clickMarker.position.set(x, y, z);
  }
  else {
    clickMarker.position.set(x, clickMarker.position.y, z);
  }
}

//----------------------------------------------------------------------------------
function removeClickMarker() {
  clickMarker.visible = false;
}


//----------------------------------------------------------------------------------
function addMouseConstraint(x, y, z, body) {
  // The cannon body constrained by the mouse joint
  constrainedBody = body;

  // Vector to the clicked point, relative to the body
  var v1 = new CANNON.Vec3(x, y, z).vsub(constrainedBody.position);

  // Apply anti-quaternion to vector to tranform it into the local body coordinate system
  var antiRot = constrainedBody.quaternion.inverse();
  pivot = antiRot.vmult(v1); // pivot is not in local body coordinates

  // Move the cannon click marker particle to the click position
  jointBody.position.set(x, y, z);

  // Create a new constraint
  // The pivot for the jointBody is zero
  mouseConstraint = new CANNON.PointToPointConstraint(constrainedBody, pivot, jointBody, new CANNON.Vec3(0, 0, 0));

  // Add the constriant to world
  world.addConstraint(mouseConstraint);
}


//----------------------------------------------------------------------------------
// This functions moves the transparent joint body to a new postion in space
function moveJointToPoint(x, y, z) {
  // Move the joint body to a new position

  if (y >= 0 && AllowYMotion) {
    jointBody.position.set(x, y, z);
  }
  else {
    jointBody.position.set(x, jointBody.position.y, z);
  }
  mouseConstraint.update();
}


//----------------------------------------------------------------------------------
function removeJointConstraint() {
  // Remove constriant from world
  world.removeConstraint(mouseConstraint);
  mouseConstraint = false;
}

