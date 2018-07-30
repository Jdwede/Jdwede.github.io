var canvas = document.getElementById("container");
var clone = document.getElementById("blurCanvasBottom");

var cloneCtx = clone.getContext("2d");
var ctx = canvas.getContext("2d");

var w = $("#blurCanvasTop").width();
var h = $("#blurCanvasTop").height();

var ww = $(window).width();
var wh = $(window).height();
canvas.width = ww;
canvas.height = wh;
var partCount = 80;
var particles = [];

function particle() {
  this.color = "rgba(255,255,255," + Math.random() + ")";
  this.x = randomInt(0, ww);
  this.y = randomInt(0, wh);
  this.direction = {
    x: -1 + Math.random() * 2,
    y: -1 + Math.random() * 2
  };
  this.vx = 0.3 * Math.random();
  this.vy = 0.3 * Math.random();
  this.radius = randomInt(2, 2.5);
  this.float = function() {
    this.x += this.vx * this.direction.x;
    this.y += this.vy * this.direction.y;
  };
  this.changeDirection = function(axis) {
    this.direction[axis] *= -1;
  };
  this.boundaryCheck = function() {
    if (this.x >= ww) {
      this.x = ww;
      this.changeDirection("x");
    } else if (this.x <= 0) {
      this.x = 0;
      this.changeDirection("x");
    }
    if (this.y >= wh) {
      this.y = wh;
      this.changeDirection("y");
    } else if (this.y <= 0) {
      this.y = 0;
      this.changeDirection("y");
    }
  };
  this.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  };
}
function clearCanvas() {
  cloneCtx.clearRect(0, 0, ww, wh);
  ctx.clearRect(0, 0, ww, wh);
}
function createParticles() {
  for (i = 0; i < partCount; i++) {
    var p = new particle();
    particles.push(p);
  }
}
function drawParticles() {
  for (i = 0; i < particles.length; i++) {
    p = particles[i];
    p.draw();
  }
}
function updateParticles() {
  for (var i = particles.length - 1; i >= 0; i--) {
    p = particles[i];
    p.float();
    p.boundaryCheck();
  }
}
createParticles();
drawParticles();
function animateParticles() {
  clearCanvas();
  drawParticles();
  updateParticles();
  cloneCtx.drawImage(canvas, 0, 0);
  requestAnimationFrame(animateParticles);
}
requestAnimationFrame(animateParticles);
cloneCtx.drawImage(canvas, 0, 0);

$(window).on("resize", function() {
  ww = $(window).width();
  wh = $(window).height();
  canvas.width = ww;
  canvas.height = wh;
  clearCanvas();
  particles = [];
  createParticles();
  drawParticles();
});
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function velocityInt(min, max) {
  return Math.random() * (max - min + 1) + min;
}

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

// Responsive Modal Test, working with modaltest.html

/*
// Get modal elements
var modal = document.getElementById('simpleModal');

// Get open modal button
var modalBtn = document.getElementById('modalBtn');

// Get close button
var closeBtn = document.getElementsByClassName('closeBtn')[0];

// Listen for open click
modalBtn.addEventListener('click', openModal);

// Listen for close click
closeBtn.addEventListener('click', closeModal);

// Listen for outside click
window.addEventListener('click', outsideClick);

// Function to open modal
function openModal()
{
    modal.style.display = 'block';
}

// Function to close modal
function closeModal()
{
    modal.style.display = 'none';
}

// Function to close modal if outside click
function outsideClick(e)
{
    if(e.target == modal)
    {
        modal.style.display = 'none';
    }
}
*/

  // Initialize all event listeners
  // for (var i = 0; i < freeChallenge.length; i++) {
  //   freeChallenge[i].addEventListener("click", event => openModal(event, i));
  // }

// Responsive modal test with week specific challenges

// Function to add event listeners to every button with a loop instead of doing it manually

window.addEventListener("DOMContentLoaded", run);
function run() {
    // Get entire modal including window and contents
    var freeChallenges = document.getElementsByClassName("freeChallengeModal");
    var paidChallenges = document.getElementsByClassName("paidChallengeModal");
    var closeBtn = document.getElementsByClassName("closeBtn");
    var paidCloseBtn = document.getElementsByClassName("paidCloseBtn");

    // Listen for open click on specific free challenge button
    Object.keys(freeChallenges).forEach(index => {
    freeChallenges[index].addEventListener("click", () => openFreeModal(index));
    });

    // Listen for open click on specific paid challenge button    
    Object.keys(paidChallenges).forEach(index => {
    paidChallenges[index].addEventListener("click", () => openPaidModal(index));
    });
    
    // Listen for close click on button
    Object.keys(closeBtn).forEach(index => {
    closeBtn[index].addEventListener("click", () => closeModal(index));
    });
    
    // Listen for close click on paid button
    Object.keys(paidCloseBtn).forEach(index => {
    paidCloseBtn[index].addEventListener("click", () => paidCloseModal(index));
    });

    // Function to open free modal
    openFreeModal = index => {
    var freeModal = document.getElementsByClassName("freeModal");
    freeModal[index].style.display = "block";
    // Displays text in content of existing button
    //let text = modal[index].childNodes[1].childNodes[3];
    //text.textContent = freeChallenges[index].childNodes[3].textContent;
    };

    // Function to open paid modal
    openPaidModal = index => {
    var paidModal = document.getElementsByClassName("paidModal");
    paidModal[index].style.display = "block";
    // Displays text in content of existing button
    //let text = modal[index].childNodes[1].childNodes[3];
    //text.textContent = freeChallenges[index].childNodes[3].textContent;
    };
    
    // Function to close free modal
    closeModal = index => {
    var freeModal = document.getElementsByClassName("freeModal");
    freeModal[index].style.display = "none";
    //var paidModal = document.getElementsByClassName("paidModal");
    //paidModal[index].style.display = "none";
    };
    
    // Function to close paid modal
    paidCloseModal = index => {
    var paidModal = document.getElementsByClassName("paidModal");
    paidModal[index].style.display = "none";
    };
    
    /*
    // Only working for week 1 challenge 1 right now
    window.addEventListener('click', outsideClick);
    var modal = document.getElementById("simpleModal");
    function outsideClick(e)
    {  
        if(e.target == modal)
        {
            console.log("Outside click");
            modal.style.display = "none";
        }
    }
    */
    
    // WORK IN PROGRESS
    /*
    window.addEventListener('click', outsideClick);
    var freeModal = document.getElementsByClassName("freeModal");
    Object.keys(freeModal).forEach(index => {
    window.addEventListener("click", () => freeModalOutsideClick(index));
    });
    
    freeModalOutsideClick = index => {
    console.log("outside click");
    var freeModal = document.getElementsByClassName("freeModal");
    freeModal[index].style.display = "none";
    };
    */
    
}
