# [packageName]
Node CLI to create asset hashmap from directory structure.

```
|-src
  |-assets
    |- font
      |- aldrich.woff
    |- image
      |- player.png
      |- enemy.png
```

👇

```js
// src/assets/assetlist.js
import phaster_mod_0 from "./font/aldrich.woff";
import phaster_mod_1 from "./image/player.png";
import phaster_mod_2 from "./image/enemy.png";
export default {
  "font": {
    "aldrich": phaster_mod_0
  },
  "image": {
    "player": phaster_mod_1,
    "enemy": phaster_mod_2
  }
};
```

## Requirements
Node.js v10+

## Install

```bash
npm install [packageName]
```

## Usage

```
npx [packageName] --options
```
