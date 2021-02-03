// We create and recycle smoke objects here
//Largely insipred by Karim Maaloul's Amazing work here https://codepen.io/Yakudoo/pen/eNmjEv
// https://codepen.io/Yakudoo/

function setSmokeCoords() {

  var idx = -1;
  for (var i = 0; i < meshes.length; i++) {
    if (meshes[i].name.indexOf("physical_object_rocket2_group") === 0) {
      idx = i;
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

    // console.log (bodies[idx] );
    // var boundingBox = new THREE.Box3().setFromObject(meshes[idx]);
    // console.log(boundingBox.min, boundingBox.max);

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

    explosion_group.mesh.position.x = worldCoords.x;
    explosion_group.mesh.position.y = worldCoords.y;
    explosion_group.mesh.position.z = worldCoords.z;


  }
}

function dropSmoke(s) {

  if (worldCoords === null) {
    return;
  }

  s.mesh.material.opacity = 0.5;
  s.mesh.position.x = worldCoords.x;
  s.mesh.position.y = worldCoords.y;
  s.mesh.position.z = worldCoords.z;
  s.mesh.scale.set(0.001, 0.001, 0.001);

  var smokeTl = new TimelineMax();

  var tweenSmokeEnter = TweenMax.to(s.mesh.scale, Math.random() * 1 + 0.3, {
    x: Math.random() * 1 + 0.7,
    y: Math.random() * 1 + 0.7,
    z: Math.random() * 1 + 0.7,
    delay: 0.1,
    ease: Strong.easeOut
  });
  var tweenSmokeLeave = TweenMax.to(s.mesh.scale, 0.5, {
    x: 0.1,
    y: 0.1,
    z: 0.1,
    ease: Strong.easeIn,
    onComplete: resetSmoke,
    onCompleteParams: [s]
  });
  smokeTl.add(tweenSmokeEnter).add(tweenSmokeLeave, 0.6).play();
}

function createDroppingWaste() {
  var s = getSmokeParticle();
  dropSmoke(s);
}

function getSmokeParticle() {
  if (smokeRecycle.length) {
    return smokeRecycle.pop();
  }
  else {
    return new SmokeParticle();
  }
}

function resetSmoke(s) {
  s.mesh.position.x = 0;
  s.mesh.position.y = 0;
  s.mesh.position.z = 0;
  s.mesh.rotation.x = Math.random() * Math.PI * 2;
  s.mesh.rotation.y = Math.random() * Math.PI * 2;
  s.mesh.rotation.z = Math.random() * Math.PI * 2;
  s.mesh.scale.set(1, 1, 1);
  s.mesh.material.opacity = 0;
  s.material.needUpdate = true;
  scene.add(s.mesh);
  smokeRecycle.push(s);
}

function SmokeParticle() {
  this.geometry = new THREE.IcosahedronGeometry(1, 1);
  this.material = new THREE.MeshLambertMaterial({
    color: 'brown', flatShading: THREE.FlatShading, transparent: true
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  resetSmoke(this);
}

function updateSmokeArr() {
  if (freqCount % frequency == 0) {
    createDroppingWaste();
  }
  freqCount++;
}
