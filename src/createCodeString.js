import { jsonStringify } from "./utils";

const ESM_PREFIX = "asset_mod_";

/**
 * esm形式のコード文に変換
 * 
 * @param {import("./createFileHashJson").AssetListJson} assetList
 * @returns {string}
 */
function esmFormat(assetList) {
  let codeStr = "";
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

  // json文字列化してexport文定義
  let exportStr = `export default ${jsonStringify(fileJson)};`;
  // module名を囲う余計なコロンを消す
  moduleNames.forEach((modName) => {
    exportStr = exportStr.replace(`\"${modName}\"`, modName);
  });
  codeStr += exportStr;
  return codeStr;
}

/**
 * コード文のデフォルト変換
 * 
 * @example
 * defaultFormat({foo: "./foo/bar.jpg"}) // => "export default {"foo": "./foo/bar.jpg"}"
 * 
 * @param {import("./createFileHashJson").AssetListJson} assetList
 */
function defaultFormat(assetList) {
  return `export default ${jsonStringify(assetList)}`;
}

/**
 * コード本文を作成
 * 
 * @param {import("./createFileHashJson").AssetListJson} assetList
 * @param {import("./parseArg").FormatType} [formatType]
 */
export default function createCodeString(assetList, formatType = "esm") {
  switch (formatType) {
    case "esm":
      return esmFormat(assetList);

    case "cjs":
      console.warn("cjs format not supported yet!");
      return defaultFormat(assetList);

    case "json":
      return jsonStringify(assetList);

    default:
      // "none",　etc.
      return defaultFormat(assetList);
  }
}
