# js-animation-easing
Vanilla JS with a little Easing!
===================


This is just a fun project I whipped up. It's a JavaScript class that can manage animating multiple elements around the screen, all with different animation times and 3 different easing options, linear, ease-in and ease-out. The easing functions make use of quadratic equation variances. It is called similar to the way one would call a jQuery animation function. Just get a reference to the `HTMLElement` , and do like below.

```js
/**
 * This example, grabs 3 absolute positioned elements
 * then animates them at the same time,
 * but with different timing functions
 */
someElm = document.getElementById('someElement');
anotherElm = document.getElementById('two');
lastElm = document.getElementById('three');

// Regular linear animation
anime.animate(someElm, {'left':800,'top':300}, 5000, 'linear');
// Animation Ease Out
anime.animate(anotherElm, {'left':800,'top':200}, 5000, 'easeOut');
// Animation Ease In
anime.animate(lastElm, {'left':800,'top':100}, 5000, 'easeIn');
```


Documention
-------------
> **Note:**
The documentation inside the file labels extensions on the prototype object as private and public. This is merely post suggestive documentation, as there is no actual attempt at private implementation of any of the methods or properties. This code is merely an example of how semi-complex animations can be achieved with vanilla JavaScript. The actual structure of the class could be redesigned, I'm actually not too partial to building a class from the ground up directly off of its prototype, but that's what fun projects are for, fun!

#### <i class="icon-file"></i>  Created by Michael Rosata
 
[email @ mrosata1984@gmail.com](mike@stayshine.com)

[site @ http://stayshine.com](http://stayshine.com)
