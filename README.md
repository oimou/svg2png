# svg2png.js

Convert SVG element to PNG as dataURL.

## Installation

```
$ bower install svg2png
```

## Usage

```
var svg = document.querySelector("svg");

svg2png(svg, function (err, dataURL) {
    console.log(dataURL);
});
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

0.1.0

* The first version

## License

MIT
