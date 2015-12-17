/**
* Provides nosmoothing function
*
* @module nosmoothing
*/
var nosmoothing = (function NO_IMAGE_SMOOTHING (win, doc, undefined) {
"use strict";

/**
* @private
* @property CANVAS
* @type HTMLCanvasElement
*/
var CANVAS = doc.createElement('canvas');

/**
* @private
* @property CANVAS
* @type CanvasRenderingContext2D
*/
var CONTEXT = CANVAS.getContext('2d');

/**
* @private
* @property IMAGE
* @type HTMLImageElement
*/
var IMAGE = new Image();

/**
* Array of elements that will not be processed.
*
* @private
* @property IGNORED
* @type Arrat
*/
var IGNORED = []

/**
* Whether to watch the document for new image elements in order to scale them 
* as well.
*
* @private
* @property WATCH
* @type Boolean
*/
var WATCH = false;

/**
* Interval in milliseconds to search document for new image elements to process.
*
* @private
* @property WATCH_INTERVAL
* @type Number
*/
var WATCH_INTERVAL = 800;

/**
* Size of document body, used to quickly determine if there was a change in the 
* document.
*
* @private
* @property DOC_LENGTH
* @type Number
*/
var DOC_LENGTH = 0;

/**
* Whether the page has finished loading.
*
* @private
* @property DOCUMENT_READY
* @type Boolean
*/
var DOCUMENT_READY = false;

// -----------------------------------------------------------------------------

/**
* Extracts an image's pixel data.
*
* @private
* @method image_element_to_image_data
* @param image_element {HTMLImageElement}
* @return ImageData
*/
function image_element_to_image_data (image_element)
{
	var width = image_element.width;
	var height = image_element.height;
	CANVAS.width = width;
	CANVAS.height = height;
	CONTEXT.drawImage(image_element, 0, 0);
	return CONTEXT.getImageData(0, 0, width, height);
}

/**
* Scales an ImageData instance.
*
* @kudos http://stackoverflow.com/a/20452240/5244413
* @private
* @method scale_image_data
* @param image_data {ImageData}
* @param scale {Number}
* @return ImageData
*/
function scale_image_data(image_data, scale)
{
	var image_data_width = image_data.width;
	var image_data_height = image_data.height;
	var scaled_image_data_width = image_data_width * scale;
    var scaled = CONTEXT.createImageData(scaled_image_data_width, image_data.height * scale);
    var subline = CONTEXT.createImageData(scale, 1).data;

    for (var row = 0; row < image_data_height; row++) 
    {
        for (var col = 0; col < image_data_width; col++) 
        {
            var src_pixel = image_data.data.subarray(
                (row * image_data_width + col) * 4,
                (row * image_data_width + col) * 4 + 4
            );

            for (var x = 0; x < scale; x++)
            {
            	subline.set(src_pixel, x * 4);
            }

            for (var y = 0; y < scale; y++) 
            {
                var dest_row = row * scale + y;
                var dest_col = col * scale;
                scaled.data.set(subline, (dest_row * scaled_image_data_width + dest_col) * 4);
            }
        }
    }

    return scaled;
}

/**
* Handler used on any image that has completed loading.
*
* @private
* @method onimageload
* @this HTMLImageElement
*/
function onimageload () 
{
	var width = this.width;
	var height = this.height;
	var naturalWidth = this.naturalWidth;
	var naturalHeight = this.naturalHeight;
	if (naturalWidth === undefined)
	{
		IMAGE.src = image_element.src;
		if (!IMAGE.complete)
		{
			throw new Error('Unexpected; Navigator is downloading the same image more than once');
		}
		naturalWidth = IMAGE.width;
		naturalHeight = IMAGE.height;
	}

	var deltaWidth = Math.abs(naturalWidth - width);
	var deltaHeight = Math.abs(naturalHeight - height);
	if (deltaHeight > 1 || deltaWidth > 1)
	{
		var w_scale = (width - (width % naturalWidth)) / naturalWidth;
		var h_scale = (height - (height % naturalHeight)) / naturalHeight;
		var scale = w_scale > h_scale ? w_scale : h_scale;
		scale_image_element(this, scale);
	}

	IGNORED[IGNORED.length] = this;
}

/**
* Scales an image element in-place.
*
* @method scale_image_element
* @param image_element {HTMLImageElement}
* @param scale {Number}
*/
function scale_image_element (image_element, scale) 
{
	CANVAS.width = image_element.width * scale;
	CANVAS.height = image_element.height * scale;
	var scaled_image_data = scale_image_data(image_element_to_image_data(image_element), scale);
	CONTEXT.putImageData(scaled_image_data, 0, 0);
	image_element.src = CANVAS.toDataURL();
}

/**
* Finds image elements that are not already processed or set to be ignored and 
* scales them if necessary.
*
* @method find_prospect_image_elements_and_scale
*/
function find_prospect_image_elements_and_scale () 
{
	var images = doc.getElementsByTagName('img');
	for (var i = 0, l = images.length; i < l; i++) 
	{
		var image = images[i];
		if (image.src)
		{
			if (~IGNORED.indexOf(image) === 0)
			{
				if (image.getAttribute('data-nosmoothing') !== 'false')
				{
					if (image.complete)
					{
						onimageload.apply(image);
					}
					else
					{
						if (doc.addEventListener)
						{
							image.addEventListener('load', onimageload, false);
						}
						else
						{
							image.attachEvent('onload', onimageload);
						}
					}
				}

				IGNORED[IGNORED.length] = image;
			}
		}
	}
}

/**
* Starts watching document for new images
*
* @method watch
*/
function watch ()
{ 
	if (!WATCH)
	{
		WATCH = true;
		var tref = setInterval(
			function watch_callback () 
			{
				if (WATCH === false)
				{
					clearInterval(tref);
					tref = undefined;
				}
				else
				{
					if (DOC_LENGTH !== document.body.innerHTML.length)
					{
						DOC_LENGTH = document.body.innerHTML.length;
						find_prospect_image_elements_and_scale();
					}
				}
			}, 
			WATCH_INTERVAL
		);
	}	
}

/**
* Stop watching document
* 
* @method unwatch
*/
function unwatch () 
{ 
	if (WATCH)
	{
		WATCH = false;
	}	
}

// -----------------------------------------------------------------------------

/**
* Window has finished loading
*
* @private
* @method ready
*/
function ready ()
{
	if (!DOCUMENT_READY)
	{
		DOCUMENT_READY = true
		if (doc.addEventListener)
		{
			doc.removeEventListener('DOMContentLoaded', ready, false);
			win.removeEventListener('load', ready, false);
		} 
		else 
		{
			doc.detachEvent('onreadystatechange', readyStateChange);
			win.detachEvent('onload', ready);
		}

		switch(doc.body.getAttribute('data-nosmoothing'))
		{
			case 'false':
			break;
			case 'watch':
				watch();
			break;
			default: case 'true':
				find_prospect_image_elements_and_scale()
			break;
		}
	}
}

/**
* Document readystatechange event Handler
*
* @private
* @method readyStateChange
*/
function readyStateChange()
{
	if (doc.readyState === 'complete')
	{
		ready();
	}
}

// Autoexecute after document finishes loading
if (doc.readyState === 'complete' || (!doc.attachEvent && doc.readyState === 'interactive'))
{
	ready();
}
else
{
	if (doc.addEventListener)
	{
		doc.addEventListener('DOMContentLoaded', ready, false);
		win.addEventListener('load', ready, false);
	} 
	else 
	{
		doc.attachEvent('onreadystatechange', readyStateChange);
		win.attachEvent('onload', ready);
	}
}

return {
	// Scale all images in DOM
	run: find_prospect_image_elements_and_scale,
	// Scale specified image
	scale: scale_image_element,
	// Start watching DOM for new images to scale
	watch: watch,
	// Stop watching DOM
	unwatch: unwatch,
}
})(window, document, void 0);
