///explosion
var explosion_group = new SPE.Group({
  texture: {
    value: THREE.ImageUtils.loadTexture('./img/sprite-explosion2.png'),
    frames: new THREE.Vector2(5, 5),
    loop: 1
  },
  depthTest: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  scale: 600
});
var explosion_pos = new THREE.Vector3();

var fireball = { //new SPE.Emitter({
  particleCount: 20,
  type: SPE.distributions.SPHERE,
  position: {
    radius: 1
  },
  maxAge: {value: 0.4},
  alive: true,
  duration: 0.05,
  //      duration: 10,
  activeMultiplier: 20,
  velocity: {
    value: new THREE.Vector3(1)
  },
  size: {value: [5, 25]},
  color: {
    value: [
      new THREE.Color(0.5, 0.1, 0.05),
      new THREE.Color(0.2, 0.2, 0.2)
    ]
  },
  opacity: {value: [0.5, 0.35, 0.2, 0]}
};//);

var flash = new SPE.Emitter({
  particleCount: 50,
  position: {spread: new THREE.Vector3(5, 5, 5)},
  velocity: {
    spread: new THREE.Vector3(30),
    distribution: SPE.distributions.SPHERE
  },
  size: {value: [2, 20, 20, 20]},
  maxAge: {value: 2},
  activeMultiplier: 2000,
  opacity: {value: [0.5, 0.25, 0, 0]}
});

function setExplosionCoords() {

  var idx = -1;
  for (var i = 0; i < meshes.length; i++) {
    if (meshes[i].name.indexOf("physical_object_rocket2_group") === 0) {
      idx = i;
      playerShip = meshes[i];
      break;
    }
  }

  var idx2 = -1;
  for (var i = 0; i < bodies.length; i++) {
    if (bodies[i].name.indexOf("physical_object_rocket2_group") === 0) {
      idx2 = i;
      break;
    }
  }

  if (idx !== -1) {

    meshes[idx].geometry.computeBoundingBox();
    var boundingBox = meshes[idx].geometry.boundingBox;
    worldCoords = new THREE.Vector3();
    worldCoords.subVectors(boundingBox.max, boundingBox.min);
    worldCoords.multiplyScalar(0.5);
    worldCoords.add(boundingBox.min);

    if (idx2 !== -1) {
      var axis = new THREE.Vector3(0, 1, 0);
      var angle = degrees_to_radians(bodies[idx2].direction);
      worldCoords.applyAxisAngle(axis, angle);
    }
    worldCoords.z = worldCoords.z + boundingBox.min.z;
    worldCoords.applyMatrix4(meshes[idx].matrixWorld);

    //----------------------------
    meshes[idx].geometry.computeBoundingBox();
    var boundingBox = meshes[idx].geometry.boundingBox;

    ShipFrontCoords = new THREE.Vector3();
    ShipFrontCoords.subVectors(boundingBox.max, boundingBox.min);
    ShipFrontCoords.multiplyScalar(0.5);
    ShipFrontCoords.add(boundingBox.min);

    if (idx2 !== -1) {
      var axis = new THREE.Vector3(0, 1, 0);
      var angle = degrees_to_radians(bodies[idx2].direction);
      ShipFrontCoords.applyAxisAngle(axis, angle);
    }
    ShipFrontCoords.z = ShipFrontCoords.z - (boundingBox.min.z-1);
    ShipFrontCoords.applyMatrix4(meshes[idx].matrixWorld);

  }
}


function InitShip() {
  var scaleFactor;
  var AddNewObjectPoint;
  var direction, speed, mass;

  scaleFactor = new THREE.Vector3(1, 1, 1);
  AddNewObjectPoint = new THREE.Vector3(30, 15, 0);
  direction = 0;
  speed = 0;
  mass = 40;
  loadGLTF("rocket1", "./catdog15_ship.gltf", AddNewObjectPoint, scaleFactor, direction, speed, mass);

  scaleFactor = new THREE.Vector3(1, 1, 1);
  AddNewObjectPoint = new THREE.Vector3(0, 15, 0);
  direction = 0;
  speed = 0;
  mass = 50;
  loadGLTF("rocket2", "./ship2.gltf", AddNewObjectPoint, scaleFactor, direction, speed, mass);

  scaleFactor = new THREE.Vector3(1, 1, 1);
  AddNewObjectPoint = new THREE.Vector3(-30, 15, 0);
  speed = 0;
  direction = 0;
  mass = 200;

  loadGLTF("rocket3", "./ship4.gltf", AddNewObjectPoint, scaleFactor, direction, speed, mass);
}


function InitCubes() {
  // cubes
  var cubeGeo = new THREE.BoxGeometry(1, 1, 1, 10, 10);

  // Create vube physics
  var mass = 5, radius = 1.3;
  boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));

  var cubeMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
  for (var i = 0; i < N; i++) {
    cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
    cubeMesh.castShadow = true;
    cubeMesh.name = "physical_object_cube_" + i;
    meshes.push(cubeMesh);
    scene.add(cubeMesh);


    boxBody = new CANNON.Body({mass: mass});
    boxBody.addShape(boxShape);
    boxBody.name = "physical_object_cube_" + i;
    boxBody.position.set(30, 5, 30);
    world.addBody(boxBody);
    bodies.push(boxBody);

  }


}



//------------------------------------------------------------------------------------------------
function drawBox(objectwidth, objectheight, objectdepth) {
  var geometry2, material2, sphere2, box;

  var radius = objectwidth;
  if (objectheight > radius) {
    radius = objectheight;
  }
  if (objectdepth > radius) {
    radius = objectdepth;
  }

  geometry2 = new THREE.SphereGeometry(radius / 2, 32, 32);
  material2 = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.05, depthTest: false});
  sphere2 = new THREE.Mesh(geometry2, material2);
  dragobjects.push(sphere2);
  return sphere2;

  // geometry = new THREE.BoxGeometry(objectwidth, objectheight, objectdepth);
  // material = new THREE.MeshBasicMaterial({color: 0xffff00, transparent: true, opacity: 0, depthTest: false});
  // box = new THREE.Mesh(geometry, material);
  // dragobjects.push(box);

  //// box.position.set(position.x, position.y, position.z);
  //return box;
};


//---------------------------------------------------------------------------------------------------------
function loadGLTF(name, model_file, position, scale, direction, speed, mass) {

  loader.load(model_file, function (gltf) {             // <<--------- Model Path
    let model = gltf.scene;
    var objectwidth;
    var objectheight;
    var objectdepth;
    var group = new THREE.Object3D();

    model.userData.name = name;
    model.userData.filePath = model_file;

    Outline_selectedObject_temp = model;

    model.name = name;
    model.userData.isContainer = true;
    model.castShadow = true;
    model.receiveShadow = true;

    const bbox = new THREE.Box3().setFromObject(model);
    const offset = new THREE.Vector3();
    bbox.getCenter(offset).negate();

    if (offset.y > 20) {
      offset.y = 3;
    }
    model.traverse((obj) => {
      if (obj.isMesh) {

        obj.castShadow = true;
        obj.receiveShadow = true;
        // obj.position.set(offset.x, offset.y, offset.z);
      }
    });
    // model.rotation.x = THREE.Math.degToRad(90);
    model.rotation.y = THREE.Math.degToRad(-90);
    // model.rotation.z = THREE.Math.degToRad(rotate.z);

    var gltfbox = new THREE.Box3().setFromObject(model);
    var temp_vector = new THREE.Vector3();
    gltfbox.getSize(temp_vector);
    console.log(temp_vector);
    objectwidth = Math.floor(temp_vector.x);
    objectheight = Math.floor(temp_vector.y);
    objectdepth = Math.floor(temp_vector.z);
    if (objectdepth > 20) {
      objectdepth = 3;
    }
    objectwidth = objectwidth + parseInt(2);
    objectheight = objectheight + parseInt(2);
    objectdepth = objectdepth + parseInt(1);

    model.position.set(0, 0, 0);

    // model.position.set(0, -objectheight/2, 0);
    var box = drawBox(objectwidth, objectheight, objectdepth);

    box.scale.set(scale.x, scale.y, scale.z);
    box.position.set(position.x, position.y, position.z);
    // box.rotation.x = THREE.Math.degToRad(rotate.x);
    // box.rotation.y = THREE.Math.degToRad(rotate.y);
    // box.rotation.z = THREE.Math.degToRad(rotate.z);

    box.name = "physical_object_" + name + "_group";

    var abox = new THREE.Box3().setFromObject(box);
    console.log(abox.min, abox.max);
    var abox_size = new THREE.Vector3();
    abox.getSize(abox_size);
    console.log(abox_size);
    console.log(objectwidth * scale.x * 0.5, objectheight * scale.y * 0.5, objectdepth * scale.z * 0.5);

    console.log(model);
    box.add(model);

    // Create cannon.js physical object
    // boxShape = new CANNON.Box(new CANNON.Vec3(objectwidth * scale.x * 0.5, objectheight * scale.y * 0.5, objectdepth * scale.z * 0.5));

    var radius = abox_size.x * 0.5;
    if (abox_size.y * 0.5 > radius) {
      radius = abox_size.y * 0.5;
    }
    if (abox_size.z * 0.5 > radius) {
      radius = abox_size.z * 0.5;
    }

    boxShape = new CANNON.Sphere(radius);
    // boxShape = new CANNON.Box(new CANNON.Vec3(abox_size.x* 0.5, abox_size.y* 0.5, abox_size.z* 0.5));
    boxBody = new CANNON.Body({mass: mass, material: slipperyMaterial});
    boxBody.addShape(boxShape);
    boxBody.position.set(position.x, position.y, position.z);
    // boxBody.quaternion.x = box.quaternion.x;
    // boxBody.quaternion.y = box.quaternion.y;
    // boxBody.quaternion.z = box.quaternion.z;
    // boxBody.quaternion.w = box.quaternion.w;
    boxBody.fixedRotation = true;
    // console.log ( boxBody.quaternion );
    // console.log ( box.quaternion );
    // boxBody.quaternion = box.quaternion;
    console.log(boxBody);
    boxBody.name = "physical_object_" + name + "_group";
    boxBody.direction = direction;

    boxBody.rotationRadians = new THREE.Vector3(0, 0, 0);
    boxBody.rotationAngleX = null;
    boxBody.rotationAngleY = null;
    boxBody.playerCoords = null;
    boxBody.damping = 0.9;
    // Damping or easing for player rotation
    boxBody.rotationDamping = 0.8;
    // Acceleration values
    boxBody.acceleration = 5;
    boxBody.rotationAcceleration = 0;

    boxBody.updateMassProperties();
    world.addBody(boxBody);
    bodies.push(boxBody);


    var axis = new CANNON.Vec3(0, 1, 0);
    boxBody.quaternion.setFromAxisAngle(axis, degrees_to_radians(direction));
    console.log(axis);


    var localForward = new CANNON.Vec3(0, 0, -1); // correct?
    var worldForward = new CANNON.Vec3();
    boxBody.vectorToWorldFrame(localForward, worldForward);
    var localVelocity = new CANNON.Vec3(0, 0, speed);
    var worldVelocity = boxBody.quaternion.vmult(localVelocity);
    worldVelocity.y = 0;
    boxBody.velocity.copy(worldVelocity);

    meshes.push(box);
    console.log(box);
    scene.add(box);
    return box;
  });
}

