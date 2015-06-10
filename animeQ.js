
/*  Animation Queue using vanilla JavaScript w/Easing methods
 *      by: Michael Rosata
 *          and Algebra too, stay in school.
 */
 
// Grab browser environments requestAnimationFrame if needed or poly-fill requestAnimationFrame().
var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (cb) { window.setTimeout(callback, 30);};
// I will also poly-fill performance.now() if it that is something that is needed.
var pageLoadedAt = new Date().getTime();
// Basically the poly-fill for performance.now() is a weak measurement of elapsed time after this script begins.
var performance = window.performance || {now: function () { return new Date().getTime() - pageLoadedAt;} };


/**
 * Main Object AnimeQ
 * @constructor
 */
function AnimeQ (int) {
  this.intv = parseInt(int,10) || 10;
  this.queue = [];
}

/**
 * Adds an AnimeQ setup animation item into current instances Queue
 * @private
 */
AnimeQ.prototype.addToQueue = function (item) {
  item.animating = true;
  this.queue.push(item);
  // If this is the first/only item, start queue
  if (this.queue.length == 1) {
    this.runQueue();
  }
};

/**
 * Remove item from object queue when finished
 * @private
 */
AnimeQ.prototype.removeFromQueue = function (item) {
  var index = this.queue.indexOf(item);
  return this.queue.splice(index,1);
};

/**
 * Checks that queue has length before beginning or continuing handled elements animation into
 * the next animation frame. Shouldn't ever need to cancel an AnimationFrame, but in fringe
 * case, you can just use self method AnimeQ.stopQueue()
 * @private
 */
AnimeQ.prototype.runQueue = function () {
  var inst = this;
  // Only request next frame if there is something to animate.
  if (!inst.queue.length) return false;
  this.timer = requestAnimationFrame(function (currentTimeHR) {
    // The currentTimeHR passed in by requestAnimation frame doesn't seem to act how listed in MDN docs 
    // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame  - -
    // I believe this has to do with the way that the script is called eg: main or worker. So to be safe
    // I will explicitly call performance.now(), it should provide desired functionality and accuracy level.
    var hrt = performance.now();
    inst.processQueue(hrt);
  });
};

/**
 * ## depricated ## Used to have to cancel frames but now with requestAnimationFrame
 * we don't, all we have to do is not request the next execution of processQueue which
 * I have setup to figure out automatically. But for now, the method will remain here.
 * @private
 */
  //todo: Be a good idea to have this function call a clear queue if elements are still in the queue. Then we could have "public" pause/kill methods
AnimeQ.prototype.stopQueue = function () {
  window.cancelAnimationFrame(this.timer);
  this.timer = null;
};

/**
 * The work horse. This function is called every animation frame and it runs through each element in the queue. 
 * Based on their current frame and easing set on item, it will call proper easing method to calculate position, 
 * then it will update the position and track overall progress of each animation
 * @private
 * @param DOMHighResTimeStamp hrt - performance.now() timestamp passed by requestAnimationFrame
 */
AnimeQ.prototype.processQueue = function (hrt) {
  var index, attr, item;
  // Loop through each item that is in our animators queue
  for(index in this.queue) {

    item = this.queue[index];

    // Must solve for each animated property for item
    for (attr in item.endValue) {

      // Check if the totalFrames are done, if so render final position
      if (hrt >= item.endTime) {

        // Set the item to it's final designated property (the property passed by programmer)
        item.elm.style[attr] = item.endValue[attr];
        // Set items animating property to false
        item.animating = false;
      } else {

        // This item is still animating, call easing function to get new position
        var newPos = AnimeQ.prototype.easingFunc[item.easing](hrt - item.startTime, item.duration, item.start[attr], item.change[attr]);
        // Set the new position on the HTMLElements style object
        item.elm.style[attr] = newPos + 'px';
      }
    }

    // Is item still animating?
    if (item.animating) {

    } else {

      // Remove item from queue
      this.removeFromQueue(item);
    }
  }
  this.runQueue();
};

/**
 * Object that holds the easing functions. This way the AnimeQ API is extensible by adding new animation formulas into this object
 * @private
 */
// Array with the names of easing functions we have available
AnimeQ.prototype.easingFunc = {

  // Linear, (default) move in straight path
  linear : function (time, duration, start, change) {
    return ( change * ( time/duration ) + start );
  },

  // Quadratic ease-out
  easeIn : function (time, duration, start, change) {
    var percent = (time/duration);
    return (change * (percent*percent) + start);
  },

  // Quadratic ease-in
  easeOut : function (time, duration, start, change) {
    var percent = (time/duration);
    // When percent becomes 1, we have -change*-1 + start, which is change+start!
    return (-change * (percent * (percent-2)) + start);
  }

};


/**
 * The main "public" function. It will process items passed by programmer to be animated
 * @param HTMLElement itemElm - the element to be animated
 * @param object endPoints - the css absolute positioning to move the element to
 * @param int time - ms for the animation to last
 * @param string easing - The name of the easing method to use in the animation 'linear','easeIn','easeOut'
 * @public
 */
AnimeQ.prototype.animate = function (itemElm, endPoints, time, easing) {
  // item will hold all the properties for and reference to element and props needed to animate
  var item = {};

  // Check that user passed in easing fn name and that we have timing function
  if (!!!easing || !AnimeQ.prototype.easingFunc.hasOwnProperty(easing)) {

    // else, just make linear
    item.easing = 'linear';
  } else {

    // Easing Function exists, so we'll use it for this elements
    item.easing = easing;
  }

  // ['elm'] our HTMLElement reference
  item.elm = itemElm;
  // The current frame, the time
  item.startTime = performance.now();
  // endTime - relative measure of when the animation will stop
  item.endTime = parseInt(time, 10) + item.startTime;
  // duration is total amount of time that will elapse over entire animation
  item.duration = item.endTime - item.startTime;
  // endValue will hold the final position desired for element
  item.endValue = {};
  // start positions. doesn't change
  item.start = {};
  // the difference between start and end positions.
  item.change = {};

  // To find start vals, and solve change vals, we need computed style
  var style = window.getComputedStyle(item.elm, null);
  // Loop through our endPoint values (ex: top, left, right, bottom)
  for (var attr in endPoints) {
    // set the current value as start
    item.start[attr] = parseInt(style[attr], 10);
    // endValue holds the final value for x and y
    item.endValue[attr] = parseInt(endPoints[attr], 10);
    // Solve for change by
    item.change[attr] = (item.endValue[attr] - item.start[attr]);
    // Set the current computed style onto the actual elements style object
    item.elm.style[attr] = style[attr];
  }

  // All set with setting variables, add to the queue and animate!
  this.addToQueue(item);
};
