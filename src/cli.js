import { join, parse, relative, resolve } from "path";
import { existsSync, outputFile, writeJSON } from "fs-extra";
import parseArg from "./parseArg";
import { getFiles, hasDir, jsonStringify } from "./utils";

/**
 * @typedef {{
 *   [assetType: string]: {
 *     [assetKey: string]: string
 *   }
 * }} AssetListJson
 */

const ESM_PREFIX = "asset_mod_";

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
    let exportStr = `export default ${jsonStringify(fileJson)};`;
    moduleNames.forEach((modName) => {
      exportStr = exportStr.replace(`\"${modName}\"`, modName);
    });
    codeStr += exportStr;
  } else if (resolveType === "cjs") {
    // TODO
  } else {
    // そのままexport
    codeStr += `export default ${jsonStringify(assetList)}`;
  }

  return codeStr;
}

/**
 * @param {string[]} rawArgs
 */
export async function cli(rawArgs) {
  const options = parseArg(rawArgs);
  // console.log('options',options);

  const absoluteInputDirPath = resolve(options.inputDir);

  // ディレクトリが見つからない場合のエラー（兼ensureDir）
  if (!existsSync(absoluteInputDirPath)) {
    throw Error(`Input directory "${options.inputDir}" does not exist`);
  }

  /** @type {string[]} */
  let files = await getFiles(absoluteInputDirPath);

  // Create AssetListJson
  /** @type {AssetListJson} */
  const assetListData = Object.create(null);
  files.forEach((fp) => {
    const fileData = parse(relative(absoluteInputDirPath, fp));
    if (fileData.dir && !hasDir(fileData.dir)) {
      const dir = fileData.dir;
      if (!assetListData[dir]) assetListData[dir] = Object.create(null);
      assetListData[dir][fileData.name] = `./${fileData.dir}/${fileData.base}`;
    }
  });
  // console.log("assetListJson", assetListData);

  // Output
  {
    const assetListOutputPath = join(
      absoluteInputDirPath,
      options.outputFile
    );

    switch (options.format) {
      case "esm":
        const codeString = createCodeString(assetListData, "esm");
        outputFile(assetListOutputPath, codeString, (err) => {
          if (err) throw err;
        });
        break;

      case "cjs":
        // TODO
        break;

      case "json":
        writeJSON(assetListOutputPath, assetListData);
        break;

      default:
        console.error("Format option not valid.");
        // TODO
        break;
    }
  }

  console.log("End");
}
