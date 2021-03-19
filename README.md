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
dimic --[options]
```

### Test

```bash
npm run test
```
