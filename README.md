RiftThree
=========

Some code samples that make it easier to use Oculus Rift with Three.js.
Makes use of:

-	OculusRiftEffect.js from https://github.com/troffmo5/OculusStreetView
-	vr.js from https://github.com/benvanik/vr.js


## Basic Usage

You need a working three.js project fullfilling these requirements
- [vr.js](https://github.com/benvanik/vr.js) plugin is installed (used for head-tracking)
- [three.js](https://github.com/mrdoob/three.js/) rev >= 59
- WebGL renderer instance is accesible from global namespace

Append this to your `body`
```html
<script src="//rawgithub.com/carstenschwede/RiftThree/master/lib/RiftThree.js"></script>
<script>
	window.RiftThree();
</script>
```

or use this 
[bookmarklet](javascript:(function()%7Bvar%20cmd%20%3D%20%22function%20loadJS(path%2Ccallback)%20%7Bvar%20script%20%3D%20document.createElement('script')%3Bscript.type%20%3D%20'text%2Fjavascript'%3Bscript.async%20%3D%20true%3Bscript.onload%20%3D%20callback%3Bscript.src%20%3D%20path%3Bdocument.getElementsByTagName('head')%5B0%5D.appendChild(script)%3B%7D%3BloadJS('%2F%2Frawgithub.com%2Fcarstenschwede%2FRiftThree%2Fmaster%2Flib%2FRiftThree.js'%2C%20function()%20%7Bwindow.RiftThree()%3B%7D)%3B%22%3Bvar%20i%20%3D%20document.getElementById('viewer')%3Bvar%20p%20%3D%20document.getElementById('panel')%3Bif%20(i%20%26%26%20p)%20%7Bvar%20is%20%3D%20i.style%2C%20ps%20%3D%20p.style%2C%20iD%2Cs%3Bps.zIndex%20%3D%202%3Bps.bottom%20%3D%20is.left%20%3D%200%3Bis.width%20%3D%20ps.width%20%3D%20%22100%25%22%3Bps.height%20%3D%20%22100px%22%3BiD%20%3D%20i.contentWindow.document%3Bs%20%3D%20iD.createElement('script')%3Bs.text%20%3D%20cmd%3BiD.getElementsByTagName(%22head%22)%5B0%5D.appendChild(s)%3B%7D%20else%20%7Beval(cmd)%3B%7D%7D)())

that also works on http://threejs.org/examples! (Examples that change camera orientation might mess with head tracking)


### Head Tracking
You need to have vr.js installed in order to use head tracking.
-	Use `h` to enable/disable head tracking.
- Use `r` to reset head tracking.

## Advanced Usage
```
var options = {
	useHeadTracking:			boolean,
	geometriesWith3DTextures:	[THREE.Geometry,...],		//3D Texture Support, see below
	preLeft:					[function, ...],			//Will be executed before rendering left eye
	preRight:					[function, ...],			//Will be executed before rendering right eye
	scale:						float,						//Reduce Oculus FOV to increase size, caution
	emptyColor:					argument to THREE.Color		//Background color, defaults to HTML background
}

window.RiftThree([renderer[, options]]);

```

## 3D Texture Support
You can use the following types of stereoscopic images or videos:
- [Side-by-Side/Top-and-Bottom](http://carstenschwede.github.io/RiftThree/examples/MediaPlayer/index.html#3)
- [Depth maps](http://carstenschwede.github.io/RiftThree/examples/MediaPlayer/index.html#2)
- Side-by-Side + Depth map
- [Panorama](http://carstenschwede.github.io/RiftThree/examples/MediaPlayer/index.html#0)

## Issues
- Why is switching UV mapping set faster than switching texcoords in shader?
- Supported media limited to browsers HTML5 audio/video support
- Only tested in Chrome
- Documentation...
