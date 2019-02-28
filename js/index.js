// WebGL three.js fog render
var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var debounce = function debounce(callback, duration) {
  var timer;
  return function (event) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback(event);
    }, duration);
  };
};

var loadTexs = function loadTexs(imgs, callback) {
  var texLoader = new THREE.TextureLoader();
  var length = Object.keys(imgs).length;
  var loadedTexs = {};
  var count = 0;

  texLoader.crossOrigin = 'anonymous';var _loop = function _loop() {


    var k = key;
    if (imgs.hasOwnProperty(k)) {
      texLoader.load(imgs[k], function (tex) {
        tex.repeat = THREE.RepeatWrapping;
        loadedTexs[k] = tex;
        count++;
        if (count >= length) callback(loadedTexs);
      });
    }};for (var key in imgs) {_loop();
  }
};var

Fog = function () {
  function Fog() {_classCallCheck(this, Fog);
    this.uniforms = {
      time: {
        type: 'f',
        value: 0 },

      tex: {
        type: 't',
        value: null } };


    this.num = 70;
    this.obj = null;
  }_createClass(Fog, [{ key: 'createObj', value: function createObj(
    tex) {
      // Define Geometries
      var geometry = new THREE.InstancedBufferGeometry();
      var baseGeometry = new THREE.PlaneBufferGeometry(1100, 1100, 20, 20);

      // Copy attributes of the base Geometry to the instancing Geometry
      geometry.addAttribute('position', baseGeometry.attributes.position);
      geometry.addAttribute('normal', baseGeometry.attributes.normal);
      geometry.addAttribute('uv', baseGeometry.attributes.uv);
      geometry.setIndex(baseGeometry.index);

      // Define attributes of the instancing geometry
      var instancePositions = new THREE.InstancedBufferAttribute(new Float32Array(this.num * 3), 3, 1);
      var delays = new THREE.InstancedBufferAttribute(new Float32Array(this.num), 1, 1);
      var rotates = new THREE.InstancedBufferAttribute(new Float32Array(this.num), 1, 1);
      for (var i = 0, ul = this.num; i < ul; i++) {
        instancePositions.setXYZ(
        i,
        (Math.random() * 2 - 1) * 850,
        0,
        (Math.random() * 2 - 1) * 300);

        delays.setXYZ(i, Math.random());
        rotates.setXYZ(i, Math.random() * 2 + 1);
      }
      geometry.addAttribute('instancePosition', instancePositions);
      geometry.addAttribute('delay', delays);
      geometry.addAttribute('rotate', rotates);

      // Define Material
      var material = new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: '\n        attribute vec3 position;\n        attribute vec2 uv;\n        attribute vec3 instancePosition;\n        attribute float delay;\n        attribute float rotate;\n\n        uniform mat4 projectionMatrix;\n        uniform mat4 modelViewMatrix;\n        uniform float time;\n\n        varying vec3 vPosition;\n        varying vec2 vUv;\n        varying vec3 vColor;\n        varying float vBlink;\n\n        const float duration = 200.0;\n\n        mat4 calcRotateMat4Z(float radian) {\n          return mat4(\n            cos(radian), -sin(radian), 0.0, 0.0,\n            sin(radian), cos(radian), 0.0, 0.0,\n            0.0, 0.0, 1.0, 0.0,\n            0.0, 0.0, 0.0, 1.0\n          );\n        }\n        vec3 convertHsvToRgb(vec3 c) {\n          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n        }\n\n        void main(void) {\n          float now = mod(time + delay * duration, duration) / duration;\n\n          mat4 rotateMat = calcRotateMat4Z(radians(rotate * 360.0) + time * 0.1);\n          vec3 rotatePosition = (rotateMat * vec4(position, 1.0)).xyz;\n\n          vec3 moveRise = vec3(\n            (now * 2.0 - 1.0) * (2500.0 - (delay * 2.0 - 1.0) * 2000.0),\n            (now * 2.0 - 1.0) * 2000.0,\n            sin(radians(time * 50.0 + delay + length(position))) * 30.0\n            );\n          vec3 updatePosition = instancePosition + moveRise + rotatePosition;\n\n          vec3 hsv = vec3(time * 0.1 + delay * 0.2 + length(instancePosition) * 100.0, 0.5 , 0.8);\n          vec3 rgb = convertHsvToRgb(hsv);\n          float blink = (sin(radians(now * 360.0 * 20.0)) + 1.0) * 0.88;\n\n          vec4 mvPosition = modelViewMatrix * vec4(updatePosition, 1.0);\n\n          vPosition = position;\n          vUv = uv;\n          vColor = rgb;\n          vBlink = blink;\n\n          gl_Position = projectionMatrix * mvPosition;\n        }\n      ',


























































        fragmentShader: '\n        precision highp float;\n\n        uniform sampler2D tex;\n\n        varying vec3 vPosition;\n        varying vec2 vUv;\n        varying vec3 vColor;\n        varying float vBlink;\n\n        void main() {\n          vec2 p = vUv * 2.0 - 1.0;\n\n          vec4 texColor = texture2D(tex, vUv);\n          vec3 color = (texColor.rgb - vBlink * length(p) * 0.8) /* (vcolor adds rgb colors) * vColor */;\n          float opacity = texColor.a * 0.4;\n\n          gl_FragColor = vec4(color, opacity);\n        }\n      ',



















        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending });

      this.uniforms.tex.value = tex;

      // Create Object3D
      this.obj = new THREE.Mesh(geometry, material);
    } }, { key: 'render', value: function render(
    time) {
      this.uniforms.time.value += time;
    } }]);return Fog;}();


var resolution = new THREE.Vector2();
var canvas = document.getElementById('canvas-webgl');
var renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  canvas: canvas });

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var clock = new THREE.Clock();

camera.far = 50000;
camera.setFocalLength(30);

var texsSrc = {
  fog: 'https://ykob.github.io/sketch-threejs/img/sketch/fog/fog.png' };

var fog = new Fog();

var render = function render() {
  var time = clock.getDelta();
  fog.render(time);
  renderer.render(scene, camera);
};
var renderLoop = function renderLoop() {
  render();
  requestAnimationFrame(renderLoop);
};
var resizeCamera = function resizeCamera() {
  camera.aspect = resolution.x / resolution.y;
  camera.updateProjectionMatrix();
};
var resizeWindow = function resizeWindow() {
  resolution.set(window.innerWidth, window.innerHeight);
  canvas.width = resolution.x;
  canvas.height = resolution.y;
  resizeCamera();
  renderer.setSize(resolution.x, resolution.y);
};
var on = function on() {
  window.addEventListener('resize', debounce(resizeWindow), 1000);
};

var init = function init() {
  loadTexs(texsSrc, function (loadedTexs) {
    fog.createObj(loadedTexs.fog);

    scene.add(fog.obj);

    renderer.setClearColor(0x111111, 1.0);
    camera.position.set(0, 0, 1000);
    camera.lookAt(new THREE.Vector3());
    clock.start();

    on();
    resizeWindow();
    renderLoop();
  });
};
init();

//
//
//
//
//
//
//
//
// disable right clicking on images
$("body").on("contextmenu", "img", function(e) {
  return false;
});

//
//
// magnifying glass function
//
//
$(function() {
  var native_width = 0;
  var native_height = 0;
  var mouse = { x: 0, y: 0 };
  var magnify;
  var cur_img;

  var ui = {
    magniflier: $("#season5map")
  };

  // Add the magnifying glass
  if (ui.magniflier.length) {
    var div = document.createElement("div");
    div.setAttribute("class", "glass");
    ui.glass = $(div);

    $("body").append(div);
  }

  // All the magnifying will happen on "mousemove"

  var mouseMove = function(e) {
    var $el = $(this);

    // Container offset relative to document
    var magnify_offset = cur_img.offset();

    // Mouse position relative to container
    // pageX/pageY - container's offsetLeft/offetTop
    mouse.x = e.pageX - magnify_offset.left;
    mouse.y = e.pageY - magnify_offset.top;

    // The Magnifying glass should only show up when the mouse is inside
    // It is important to note that attaching mouseout and then hiding
    // the glass wont work cuz mouse will never be out due to the glass
    // being inside the parent and having a higher z-index (positioned above)
    if (
      mouse.x < cur_img.width() &&
      mouse.y < cur_img.height() &&
      mouse.x > 0 &&
      mouse.y > 0
    ) {
      magnify(e);
    } else {
      ui.glass.fadeOut(100);
    }

    return;
  };

  var magnify = function(e) {
    // The background position of div.glass will be
    // changed according to the position
    // of the mouse over the img.magniflier
    //
    // So we will get the ratio of the pixel
    // under the mouse with respect
    // to the image and use that to position the
    // large image inside the magnifying glass

    var rx =
      Math.round(
        (mouse.x / cur_img.width()) * native_width - ui.glass.width() / 2
      ) * -1;
    var ry =
      Math.round(
        (mouse.y / cur_img.height()) * native_height - ui.glass.height() / 2
      ) * -1;
    var bg_pos = rx + "px " + ry + "px";

    // Calculate pos for magnifying glass
    //
    // Easy Logic: Deduct half of width/height
    // from mouse pos.

    // var glass_left = mouse.x - ui.glass.width() / 2;
    // var glass_top  = mouse.y - ui.glass.height() / 2;
    var glass_left = e.pageX - ui.glass.width() / 2;
    var glass_top = e.pageY - ui.glass.height() / 2;
    //console.log(glass_left, glass_top, bg_pos)
    // Now, if you hover on the image, you should
    // see the magnifying glass in action
    ui.glass.css({
      left: glass_left,
      top: glass_top,
      backgroundPosition: bg_pos
    });

    return;
  };

  $("#season5map").on("mousemove", function() {
    ui.glass.fadeIn(200);

    cur_img = $(this);

    var large_img_loaded = cur_img.data("large-img-loaded");
    var src = cur_img.data("large") || cur_img.attr("src");

    // Set large-img-loaded to true
    // cur_img.data('large-img-loaded', true)

    if (src) {
      ui.glass.css({
        "background-image": "url(" + src + ")",
        "background-repeat": "no-repeat"
      });
    }

    // When the user hovers on the image, the script will first calculate
    // the native dimensions if they don't exist. Only after the native dimensions
    // are available, the script will show the zoomed version.
    //if(!native_width && !native_height) {

    if (!cur_img.data("native_width")) {
      // This will create a new image object with the same image as that in .small
      // We cannot directly get the dimensions from .small because of the
      // width specified to 200px in the html. To get the actual dimensions we have
      // created this image object.
      var image_object = new Image();

      image_object.onload = function() {
        // This code is wrapped in the .load function which is important.
        // width and height of the object would return 0 if accessed before
        // the image gets loaded.
        native_width = image_object.width;
        native_height = image_object.height;

        cur_img.data("native_width", native_width);
        cur_img.data("native_height", native_height);

        //console.log(native_width, native_height);

        mouseMove.apply(this, arguments);

        ui.glass.on("mousemove", mouseMove);
      };

      image_object.src = src;

      return;
    } else {
      native_width = cur_img.data("native_width");
      native_height = cur_img.data("native_height");
    }
    //}
    //console.log(native_width, native_height);

    mouseMove.apply(this, arguments);

    ui.glass.on("mousemove", mouseMove);
  });

  ui.glass.on("mouseout", function() {
    ui.glass.off("mousemove", mouseMove);
  });
});

// Responsive modal test with week specific challenges
window.addEventListener("DOMContentLoaded", run);
function run() {
    
    //
    /* VARIABLES */
    //
    
    var freeChallenges = document.getElementsByClassName("freeChallengeModal");
    var paidChallenges = document.getElementsByClassName("paidChallengeModal");
    var closeBtn = document.getElementsByClassName("closeBtn");
    var paidCloseBtn = document.getElementsByClassName("paidCloseBtn");

    //
    /* LISTENERS */
    //
    
    // Listen for open click on specific free challenge button
    Object.keys(freeChallenges).forEach(index => {
    freeChallenges[index].addEventListener("click", () => openFreeModal(index));
    });

    // Listen for open click on specific paid challenge button    
    Object.keys(paidChallenges).forEach(index => {
    paidChallenges[index].addEventListener("click", () => openPaidModal(index));
    });
    
    // Listen for close click on free button
    Object.keys(closeBtn).forEach(index => {
    closeBtn[index].addEventListener("click", () => freeCloseModal(index));
    });
    
    // Listen for close click on paid button
    Object.keys(paidCloseBtn).forEach(index => {
    paidCloseBtn[index].addEventListener("click", () => paidCloseModal(index));
    });
    
    //
    /* FUNCTIONS */
    //
    
    // Function to open free modal
    openFreeModal = index => {
    var freeModal = document.getElementsByClassName("freeModal");
    freeModal[index].style.display = "block";
    };

    // Function to open paid modal
    openPaidModal = index => {
    var paidModal = document.getElementsByClassName("paidModal");
    paidModal[index].style.display = "block";
    };
    
    // Function to close free modal
    freeCloseModal = index => {
    var freeModal = document.getElementsByClassName("freeModal");
    freeModal[index].style.display = "none";
    };
    
    // Function to close paid modal
    paidCloseModal = index => {
    var paidModal = document.getElementsByClassName("paidModal");
    paidModal[index].style.display = "none";
    };
    
    
    var modal = document.getElementsById("simpleModal");
    window.addEventListener("click", outsideClick);
    function outsideClick(e)
    {
        if(e.target == modal)
        {
            modal.style.display = 'none';
        }
    }

}