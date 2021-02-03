const path = require("path");
const fs = require("fs-extra");
const getFiles = require("./utils").getFiles;
const hasDir = require("./utils").hasDir;

/**
 * @typedef {{
 *   [assetType: string]: {
 *     [assetKey: string]: string
 *   }
 * }} AssetListJson
 */

// Default params
const ESM_PREFIX = "asset_mod_";
const DEFAULT_ASSET_DIR = path.join("src", "assets");
const DEFAULT_LIST_JS_FILE_NAME = "assetlist.js";
const DEFAULT_EXPORT_FORMAT = "js"; // json|js
const DEFAULT_RESOLVE_TYPE = "esm"; // cjs|esm|none
// const DEFAULT_WATCH_SETTING = true;

/**
 * JSON.stringifyラッパー関数
 * @param {any} obj
 */
function stringify(obj, pretty = true) {
  if (pretty) {
    return JSON.stringify(obj, null, 2);
  }
  return JSON.stringify(obj);
}

/**
 * コード出力
 * モジュール解決しながら
 * @param {AssetListJson} assetList
 * @param {string} [resolveType]
 */
function createCodeString(assetList, resolveType = "esm") {
  let codeStr = "";
  if (resolveType === "esm") {
    const fileJson = Object.create(null);
    let assetCount = 0;
    const moduleNames = [];
    for (const [assetType, assetData] of Object.entries(assetList)) {
      if (!fileJson[assetType]) fileJson[assetType] = Object.create(null);

      for (const [assetKey, assetPath] of Object.entries(assetData)) {
        // import文を書く: import [assetModuleName] from "./[assetType]/foo.png";
        const assetModuleName = `${ESM_PREFIX}${assetCount++}`;
        codeStr += `import ${assetModuleName} from "${assetPath}";\n`;
        fileJson[assetType][assetKey] = assetModuleName;
        moduleNames.push(assetModuleName);
      }
    }

    // json文字列化してexport文定義 => module名を囲うコロンを消す
    let exportStr = `export default ${stringify(fileJson)};`;
    moduleNames.forEach((modName) => {
      exportStr = exportStr.replace(`\"${modName}\"`, modName);
    });
    codeStr += exportStr;
  } else if (resolveType === "cjs") {
    // TODO
  } else {
    // そのままexport
    codeStr += `export default ${stringify(assetList)}`;
  }

  return codeStr;
}

/**
 * @param {{ [x: string]: string; }} args
 */
export async function cli(args) {
  // console.log(args);
  const assetDir = path.resolve(DEFAULT_ASSET_DIR);
  const listFileName = DEFAULT_LIST_JS_FILE_NAME;
  const exportType = args["exportFormat"] || DEFAULT_EXPORT_FORMAT;
  const moduleResolveType = args["resolveType"] || DEFAULT_RESOLVE_TYPE;

  /** @type {string[]} */
  let files = await getFiles(assetDir);

  // Create AssetListJson
  /** @type {AssetListJson} */
  const assetListData = Object.create(null);
  files.forEach((fp) => {
    const fileData = path.parse(path.relative(assetDir, fp));
    if (fileData.dir && !hasDir(fileData.dir)) {
      const dir = fileData.dir;
      if (!assetListData[dir]) assetListData[dir] = Object.create(null);
      assetListData[dir][fileData.name] = `./${fileData.dir}/${fileData.base}`;
    }
  });
  // console.log("assetListJson", assetListData);

  // Output
  {
    const assetListExportPath = path.join(assetDir, listFileName);
    await fs.ensureDir(assetDir);

    switch (exportType) {
      case "js":
        const codeString = createCodeString(assetListData, moduleResolveType);
        fs.outputFile(assetListExportPath, codeString, (err) => {
          if (err) throw err;
        });
        break;

      case "json":
        fs.writeJSON(assetListExportPath, assetListData);
        break;

      // case "ts":
      //   // TODO?
      //   break;

      default:
        break;
    }
  }

  console.log("End");
}
