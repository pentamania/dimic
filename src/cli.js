const path = require("path");
const fs = require("fs-extra");
const getFiles = require("./utils").getFiles;
const hasDir = require("./utils").hasDir;
import parseArg from "./parseArg";

/**
 * @typedef {{
 *   [assetType: string]: {
 *     [assetKey: string]: string
 *   }
 * }} AssetListJson
 */

const ESM_PREFIX = "asset_mod_";

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
 * @param {string[]} rawArgs
 */
export async function cli(rawArgs) {
  const options = parseArg(rawArgs);
  // console.log('options',options);

  const absoluteInputDirPath = path.resolve(options.inputDir);

  // TODO: ディレクトリが見つからない場合のエラー（兼ensureDir）

  /** @type {string[]} */
  let files = await getFiles(absoluteInputDirPath);

  // Create AssetListJson
  /** @type {AssetListJson} */
  const assetListData = Object.create(null);
  files.forEach((fp) => {
    const fileData = path.parse(path.relative(absoluteInputDirPath, fp));
    if (fileData.dir && !hasDir(fileData.dir)) {
      const dir = fileData.dir;
      if (!assetListData[dir]) assetListData[dir] = Object.create(null);
      assetListData[dir][fileData.name] = `./${fileData.dir}/${fileData.base}`;
    }
  });
  // console.log("assetListJson", assetListData);

  // Output
  {
    const assetListOutputPath = path.join(
      absoluteInputDirPath,
      options.outputFile
    );
    await fs.ensureDir(absoluteInputDirPath);

    switch (options.format) {
      case "esm":
        const codeString = createCodeString(assetListData, "esm");
        fs.outputFile(assetListOutputPath, codeString, (err) => {
          if (err) throw err;
        });
        break;

      case "cjs":
        // TODO
        break;

      case "json":
        fs.writeJSON(assetListOutputPath, assetListData);
        break;

      default:
        console.error("Format option not valid.");
        // TODO
        break;
    }
  }

  console.log("End");
}
