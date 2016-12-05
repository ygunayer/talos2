# The Talos Compendium
This is the codebase for the website [The Talos Compendium](http://taloscomp.org), a collection and search engine for in-game texts from [The Talos Principle](http://www.croteam.com/talosprinciple/). The game is a philosophical puzzle game and is set on a post-apocalyptic background where the story is conveyed through pieces of texts found in computer terminals scattered around the world.

![http://i.imgur.com/FMMJJQj.png](http://i.imgur.com/FMMJJQj.png "Screenshot")

## Why
Story-wise, some of these texts are corrupted and therefore partly destroyed. Technically, these parts are (mostly) meaningful texts represented in hexadecimal format, so it's possible to revert them to their original state by decoding them.

Unfortunately, the game does not provide a way to highlight, select or copy these texts, so curious players have to open up a browser and type in the hex code to a hex-to-string website manually. I made this website in an effort to overcome this cumbersome process.

Simply type in the displayed name or title of the file, or a part of its content (encoded or otherwise), and you'll be presented with a side-by-side view of both the original (encoded, or "corrupt") and the decoded versions of the said texts.

## How
I created a command line tool to retrieve the texts from the game's own assets, try its best to find those "corrupted" parts, decode them, and store both versions on an Elasticsearch index so that they're easily searchable. Then, I made this website to serve as an introductory tool, a catalog, and a search engine.

The command line tool is written in Java 8 and the website (i.e. this repo) is written in Node.js and AngularJS. Both projects are open-source and the sources are served on Github.

See the codebase for the command line at [ygunayer/talos-decoder](https://github.com/ygunayer/talos-decoder)
