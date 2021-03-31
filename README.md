# dimic

Node.js CLI to create pathmap index module from directory structure.

From

```
|-src
  |-assets
    |- font
      |- aldrich.woff
    |- image
      |- player.png
      |- enemy.png
```

👇 To

```js
// src/assets/index.js
import mod_0 from "./font/aldrich.woff";
import mod_1 from "./image/player.png";
import mod_2 from "./image/enemy.png";
export default {
  font: {
    aldrich: mod_0,
  },
  image: {
    player: mod_1,
    enemy: mod_2,
  },
};
```

## Requirements

Node.js v10.10.0+

## Install

```bash
npm install dimic -g
```

## Usage

```bash
dimic [--options]
```

### Options

#### Change input(target) directory

```bash
dimic -i public/static
```

Default input directory is `src/assets/`, but you can change this by `--input-dir` (`-i` in short) option.


#### Change output file name

```bash
dimic -o index.ts
```

Default output file name is `index.js`, but you can change this by `--output-file` (`-o` in short) option.


##### Watch changes

```bash
dimic --watch
```

Add this option if you want to output file in accordance with directory change.
(`-w` in short)


#### Filter files

```bash
dimic --match *
```

You can filter files/directories to be mapped by adding `--match` option.  
Use [glob](https://github.com/isaacs/node-glob) pattern to set value.

Default is `!_*`, which means files/dirs starting from "_" are ignored.


## Development

### Test

```bash
npm run test
```
