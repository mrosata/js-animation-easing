/*  Animation Queue using vanilla JavaScript w/Easing methods
 *      by: Michael Rosata
 *          and Algebra too, stay in school.
 */


/**
 * Main Object AnimeQ 
 * @constructor
 */
function AnimeQ (int) {
  this.intv = parseInt(int,10) || 10;
  this.queue = [];
}

/**
 * Adds a parsed item into instances Queue
 * @private
 */
AnimeQ.prototype.addToQueue = function (item) {
  item.animating = true;
  this.queue.push(item);
  // If this is the first/only item, start queue
  if (this.queue.length == 1) {
    this.startQueue();
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
 * Begin animating, runs whenever a new queue begins. If all animating elements have finished,
 * then AnimeQ stops running it's queue to save resources. If another animation is added to
 * the queue then it will start the inteval timer back up. 
 * @private
 */
AnimeQ.prototype.startQueue = function () {
  var inst = this;
  this.timer = window.setInterval(function () {
    inst.processQueue();
  }, this.intv);
};

/**
 * When animations end, AnimeQ clears the Interval timer that manages the function to run through
 * each elements animation properties and calculate and render their current frame
 * @private
 */
 //todo: Be a good idea to have this function call a clear queue if elements are still in the queue. Then we could have "public" pause/kill methods
AnimeQ.prototype.stopQueue = function () {
  window.clearInterval(this.timer);
  this.timer = null;
};

/**
 * The work horse. This function is called every animation frame and it runs through each element in the queue, based on their current frame and easing
 * method it will call the method to calculate position, then it will update the position and also update progress tracking data
 * @private
 */
AnimeQ.prototype.processQueue = function () {
  var index, item, attr, newPos;
  
  // Loop through each item that is in our animators queue
  for(index in this.queue) {
    item = this.queue[index];

    // Must solve for each animated property for item
    for (attr in item.endValue) {

      // Check if the totalFrames are done, if so render final position
      if (item.currFrame >= item.totalFrames) {
        // Set the item to it's final designated property (the property passed by programmer)
        item.elm.style[attr] = item.endValue[attr];
        // Set items animating property to false
        item.animating = false;
        
      } else {
        // This item is still animating, call easing function to get new position
        newPos = AnimeQ.prototype.easingFunc[item.easing](item.currFrame, item.totalFrames, item.start[attr], item.change[attr]);
        // Set the new position on the HTMLElements style object
        item.elm.style[attr] = newPos + 'px';
        
      }
    }

    // Is item still animating?
    if (item.animating) {
      // Yes, increment currFrame
      item.currFrame++;
      
    } else {
      // Remove item from queue
      this.removeFromQueue(item);
      
    }
  }
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
  var attr, style;
  var item = {};
  
  // Check that user passed in easing fn name and that we have timing function
  if (!!!easing || !AnimeQ.prototype.easingFunc.hasOwnProperty(easing)) {
    // No easing? or Yes easing but we don't suuport, no worries, just use linear animation
    item.easing = 'linear';
    
  } else {
    // Easing Function exists, so we'll use it for this elements
    item.easing = easing;
    
  }

  // ['elm'] our HTMLElement reference
  item.elm = itemElm;
  // The current frame, the time
  item.currFrame = 1;
  // totalFrames, the duration
  item.totalFrames = parseInt(time/this.intv, 10);
  item.endValue = {};
  // start positions. doesn't change
  item.start = {};
  // change between start and end positions. doesn't change
  item.change = {};

  // To find start vals, and solve change vals, we need computed style
  style = window.getComputedStyle(item.elm, null);
  // Loop through our endPoint values (ex: top, left, right, bottom)
  for (attr in endPoints) {
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
