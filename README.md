# nosmoothing

**Every** browser implements their own image scaling algorithm, that unfortunately uses interpolation that leaves images looking blurry when perhaps you'd want to see them pixelated. 

**nosmoothing** is a cross-browser drop-in solution where you need to view enlarged versions of an image without the blurry interpolation that is forced by the navigator.

[![Example](http://i.imgur.com/XdG86wQ.png)](http://i.imgur.com/XdG86wQ.png)

I work with small images when creating algorithms that manipulate pixels. There are times where I want to see every single pixel that is written onto a canvas, however its always a blurry mess because of the browsers hardcoded scaling algorithm, not anymore.

-------------------------

### Usage

By default, including `nosmoothing.js` in a page causes it to run once on every image element that is being
scaled by the browser. 

You can deactivate it from auto-executing by adding the attribute `data-nosmoothing="false"` on the `body` element.
Also, you can add the same attribute and value to individual image elements you want the nosmoothing scaling to ignore.

### API

`nosmoothing.run()`
Find all images in current document that need to be scaled without interpolation, and scale them so interpolation is not used.

`nosmoothing.scale(HTMLImageElement, Number)`
Scale a specified image element by a scaling factor, in place.

`nosmoothing.watch()`
Watch the current document for new images that will need to be scaled so as to not be smoothen by the brower.

`nosmoothing.unwatch()`
Stop watching document for new images.

## License

[The MIT License](http://opensource.org/licenses/MIT)