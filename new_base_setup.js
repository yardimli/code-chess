const manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

  console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};

manager.onLoad = function ( ) {

  console.log( 'Loading complete!');

};


manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

  console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

};

manager.onError = function ( url ) {

  console.log( 'There was an error loading ' + url );

};




//-----------------------------------------------------------------------------------------------------------------------
function updateLight() {
  DirectionalLight1.target.updateMatrixWorld();
  //DirectionalLight1Helper.update();
  //PointLight1Helper.update();
}

//----------------------------------------------------------------------------------------------------------------------
function AddLights() {

  const skyColor = 0xB1E1FF;  // light blue
  const groundColor = 0xB97A20;  // brownish orange
  const HemisphereLight_intensity = 1;

  HemisphereLight1 = new THREE.HemisphereLight(skyColor, groundColor, HemisphereLight_intensity);
  scene.add(HemisphereLight1);

  const color = 0xFFFFFF;
  const DirectionalLight_intensity = 1;
  DirectionalLight1 = new THREE.DirectionalLight(color, DirectionalLight_intensity);
  DirectionalLight1.position.set(0, 250, 0);
  DirectionalLight1.target.position.set(-5, 0, 0);
  scene.add(DirectionalLight1);
  scene.add(DirectionalLight1.target);

  // DirectionalLight1Helper = new THREE.DirectionalLightHelper(DirectionalLight1);
  // scene.add(DirectionalLight1Helper);


  const PointLight1_color = 0xFFFFFF;
  const PointLight1_intensity = 1;
  PointLight1 = new THREE.PointLight(PointLight1_color, PointLight1_intensity, 0, 2);
  PointLight1.position.set(0, 250, 0);
  PointLight1.castShadow = true;
  scene.add(PointLight1);

  PointLight1.shadow.mapSize.width = 512;  // default
  PointLight1.shadow.mapSize.height = 512; // default
  PointLight1.shadow.camera.near = 0.5;       // default
  PointLight1.shadow.camera.far = 1000;      // default

  // PointLight1Helper = new THREE.PointLightHelper(PointLight1);
  // scene.add(PointLight1Helper);

  updateLight();
}

function SkyBox_Ground() {
  //skybox
//    var urls = ['dark-s_px.jpg', 'dark-s_nx.jpg', 'dark-s_py.jpg', 'dark-s_ny.jpg', 'dark-s_pz.jpg', 'dark-s_nz.jpg'];
  var urls = ['leftimage.jpg', 'rightimage.jpg', 'upimage.jpg', 'downimage.jpg', 'frontimage.jpg', 'backimage.jpg'];
  var loaderCube = new THREE.CubeTextureLoader().setPath('./three/textures/cube/MilkyWay/');
  loaderCube.load(urls, function (texture) {
    scene.background = texture;
  });

  const size = 300;
  const divisions = 30;

  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);


  // floor
  geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  //geometry.applyMatrix( new THREE.Matrix4().makeRotationX( -Math.PI / 2 ) );
  material = new THREE.MeshLambertMaterial({color: 0x777777});
  markerMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
  //THREE.ColorUtils.adjustHSV( material.color, 0, 0, 0.9 );
  mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  mesh.receiveShadow = true;
  mesh.name = "plane";
  //  scene.add(mesh);

  // Materials
  var groundMaterial = new CANNON.Material("groundMaterial");

  // Adjust constraint equation parameters for ground/ground contact
  var ground_ground_cm = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
    friction: 0.01,
    restitution: 0.01,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRegularizationTime: 3,
  });

  // Add contact material to the world
  world.addContactMaterial(ground_ground_cm);

  // Create a plane
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({mass: 0, material: groundMaterial});
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  groundBody.name = "plane";
  world.addBody(groundBody);

  // Create a slippery material (friction coefficient = 0.0)
  slipperyMaterial = new CANNON.Material("slipperyMaterial");

  // The ContactMaterial defines what happens when two materials meet.
  // In this case we want friction coefficient = 0.0 when the slippery material touches ground.
  var slippery_ground_cm = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
    friction: 0.01,
    restitution: 0.01,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3
  });

  // We must add the contact materials to the world
  world.addContactMaterial(slippery_ground_cm);

}

