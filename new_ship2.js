var BulletCounter = 0;

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
  material2 = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.02, depthTest: false});
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


function GameShip(shipname, filename, direction, mass, speed, position) {

  this.scaleFactor = new THREE.Vector3(1, 1, 1);
  this.AddNewObjectPoint = position;// new THREE.Vector3(30, 15, 0);
  this.direction = direction;
  this.speed = speed;
  this.mass = mass;
  this.filename = filename;
  this.shipname = shipname;
  this.ShipFrontCoords = null;
  this.worldCoords = null;

  this.glowMaterial = null;
  this.glowGeom = null;

  this.ballShape = null;
  this.shootDirection = null;
  this.shootVelo = null;
  this.sphereShape = null;
  this.sphereBody = null;
  this.explosion_group = null;


}

GameShip.prototype.init = function () {

  loadGLTF(this.shipname, this.filename, this.AddNewObjectPoint, this.scaleFactor, this.direction, this.speed, this.mass);

  ///explosion
  this.explosion_group = new SPE.Group({
    texture: {
      value: THREE.ImageUtils.loadTexture('./img/sprite-explosion2.png'),
      frames: new THREE.Vector2(5, 5),
      loop: 1
    },
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    scale: 600,
    name:"ship_engine_rockets"
  });
  this.explosion_pos = new THREE.Vector3();

  this.fireball = { //new SPE.Emitter({
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
    opacity: {value: [0.5, 0.35, 0.2, 0]},
    name:"fireball"
  };//);

  this.flash = new SPE.Emitter({
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

  this.explosion_group.addPool(10, this.fireball, false);

  scene.add(this.explosion_group.mesh);

  this.glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      viewVector: {type: "v3", value: camera.position}
    },
    vertexShader: document.getElementById('vertexShaderPew').textContent,
    fragmentShader: document.getElementById('fragmentShaderPew').textContent,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  this.glowGeom = new THREE.CylinderGeometry(0.2, 0.2, 3.1);
  var modifier = new THREE.SubdivisionModifier(4);
  modifier.modify(this.glowGeom);


  this.ballShape = new CANNON.Cylinder(0.2, 0.2, 3.1, 3); //this.ballShape = new CANNON.Sphere(0.1);

  return this;
}

GameShip.prototype.mesh_index = function () {

  var idx = -1;
  for (var i = 0; i < meshes.length; i++) {
    if (meshes[i].name.indexOf("physical_object_" + this.shipname + "_group") === 0) {
      idx = i;
      break;
    }
  }
  return idx;
}

GameShip.prototype.body_index = function () {

  var idx = -1;
  for (var i = 0; i < bodies.length; i++) {
    if (bodies[i].name.indexOf("physical_object_" + this.shipname + "_group") === 0) {
      idx = i;
      break;
    }
  }
  return idx;
}

GameShip.prototype.rotate_ship = function (rotate_value) {

  let body_index = this.body_index();

  bodies[body_index].direction += rotate_value;
  var axis = new CANNON.Vec3(0, 1, 0);
  bodies[body_index].quaternion.setFromAxisAngle(axis, degrees_to_radians(bodies[body_index].direction));

}

GameShip.prototype.fire_engines = function (engine_power) {

  let body_index = this.body_index();

  var localForward = new CANNON.Vec3(0, 0, -1); // correct?
  var worldForward = new CANNON.Vec3();
  bodies[body_index].vectorToWorldFrame(localForward, worldForward);
  var localVelocity = new CANNON.Vec3(0, 0, engine_power);//-0.02);
  var worldVelocity = bodies[body_index].quaternion.vmult(localVelocity);
  worldVelocity.y = 0;

  bodies[body_index].velocity.x += worldVelocity.x;
  bodies[body_index].velocity.z += worldVelocity.z;

}

GameShip.prototype.setExplosionCoords = function () {

  let mesh_index = this.mesh_index();
  let body_index = this.body_index();

  var idx2 = -1;
  for (var i = 0; i < bodies.length; i++) {
    if (bodies[i].name.indexOf("physical_object_" + this.shipname + "_group") === 0) {
      idx2 = i;
      break;
    }
  }

  if (mesh_index !== -1) {

    meshes[mesh_index].geometry.computeBoundingBox();
    var boundingBox = meshes[mesh_index].geometry.boundingBox;
    this.worldCoords = new THREE.Vector3();
    this.worldCoords.subVectors(boundingBox.max, boundingBox.min);
    this.worldCoords.multiplyScalar(0.5);
    this.worldCoords.add(boundingBox.min);

    if (body_index !== -1) {
      var axis = new THREE.Vector3(0, 1, 0);
      var angle = degrees_to_radians(bodies[body_index].direction);
      this.worldCoords.applyAxisAngle(axis, angle);
    }
    this.worldCoords.z = this.worldCoords.z + boundingBox.min.z;
    this.worldCoords.applyMatrix4(meshes[body_index].matrixWorld);
  }
}


GameShip.prototype.fire_guns = function () {

  // console.log("fire guns");
  let mesh_index = this.mesh_index();
  let body_index = this.body_index();

  let direction;
  if (mesh_index !== -1) {
    //----------------------------
    meshes[mesh_index].geometry.computeBoundingBox();
    var boundingBox = meshes[mesh_index].geometry.boundingBox;

    this.ShipFrontCoords = new THREE.Vector3();
    this.ShipFrontCoords.subVectors(boundingBox.max, boundingBox.min);
    this.ShipFrontCoords.multiplyScalar(0.5);
    this.ShipFrontCoords.add(boundingBox.min);

    if (body_index !== -1) {
      direction = bodies[body_index].direction;
      var axis = new THREE.Vector3(0, 1, 0);
      var angle = degrees_to_radians(bodies[body_index].direction);
      this.ShipFrontCoords.applyAxisAngle(axis, angle);
    }
    this.ShipFrontCoords.z = this.ShipFrontCoords.z - (boundingBox.min.z - 1);
    this.ShipFrontCoords.applyMatrix4(meshes[mesh_index].matrixWorld);
  }

  var localForward = new CANNON.Vec3(0, 0, -1); // correct?
  var worldForward = new CANNON.Vec3();
  bodies[mesh_index].vectorToWorldFrame(localForward, worldForward);
  var localVelocity = new CANNON.Vec3(0, 0, 1);
  var worldVelocity = bodies[body_index].quaternion.vmult(localVelocity);
  worldVelocity.y = 0;
  let new_direction = new THREE.Vector3();
  new_direction.x = worldVelocity.x;
  new_direction.y = worldVelocity.y;
  new_direction.z = worldVelocity.z;
//  console.log(new_direction);

  let material = new THREE.LineBasicMaterial({color: 0xadffd0});

  let geometry = new THREE.Geometry();
  let head = new_direction.clone().multiplyScalar(2);

  geometry.vertices.push(
    new THREE.Vector3(0, 0, 0),
    head
  );

  let line = new THREE.Line(geometry, material);
  line.position.copy(this.ShipFrontCoords);

  // console.log(this.ShipFrontCoords);

  var x = this.ShipFrontCoords.x;
  var y = this.ShipFrontCoords.y;
  var z = this.ShipFrontCoords.z;
  var ballBody = new CANNON.Body({mass: 1});
  // console.log(this.ballShape);

  var quat = new CANNON.Quaternion();
  quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  var translation = new CANNON.Vec3(0, 0, 0);
  this.ballShape.transformAllPoints(translation, quat);

  ballBody.addShape(this.ballShape);


  // console.log(ballBody);

  var quatX = new CANNON.Quaternion();
  var quatY = new CANNON.Quaternion();
  quatX.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), 1.5708);
  quatY.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), degrees_to_radians(direction));
  var quaternion = quatY.mult(quatX);
  quaternion.normalize();
  ballBody.quaternion = quaternion;

  var ballMesh = new THREE.Mesh(this.glowGeom.clone(), this.glowMaterial.clone());
  ballMesh.life = 140;
  BulletCounter++;
  ballMesh.name = "bullet"+BulletCounter;

  world.add(ballBody);
  scene.add(ballMesh);
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  balls.push(ballBody);
  ballMeshes.push(ballMesh);
  ballBody.velocity.set(new_direction.x * 80, new_direction.y * 80, new_direction.z * 80);

  // Move the ball outside the player sphere
  x += new_direction.x;// * (sphereShape.radius*1.02 + ballShape.radius);
  y += new_direction.y;// * (sphereShape.radius*1.02 + ballShape.radius);
  z += new_direction.z;// * (sphereShape.radius*1.02 + ballShape.radius);
  ballBody.position.set(x, y, z);
  ballMesh.position.set(x, y, z);
}

GameShip.prototype.addGas = function () {
  this.setExplosionCoords();
  this.explosion_group.triggerPoolEmitter(1, this.worldCoords);
}
