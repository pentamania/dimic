import { promises as fsp, existsSync } from "fs";
import { join, parse, relative, resolve } from "path";
import { Minimatch } from "minimatch";
import chokidar from "chokidar";
import parseArg from "./parseArg";
import { getFiles, hasDir, jsonStringify } from "./utils";
import { version } from "../package.json";
const log = console.log.bind(console);

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

  // バージョン出力コマンド
  if (options.version) {
    console.log(`v${version}`);
    return;
  }

  const absoluteInputDirPath = resolve(options.inputDir);

  // ディレクトリが見つからない場合のエラー（兼ensureDir）
  if (!existsSync(absoluteInputDirPath)) {
    throw Error(`Input directory "${options.inputDir}" does not exist`);
  }

  const mm = new Minimatch(options.matchPattern);
  const assetListOutputPath = join(absoluteInputDirPath, options.outputFile);
  const outputList = async function () {
    /** @type {string[]} */
    const allFiles = await getFiles(absoluteInputDirPath);

    // Create AssetListJson
    /** @type {AssetListJson} */
    const assetListData = Object.create(null);
    allFiles.forEach((fp) => {
      const fileData = parse(relative(absoluteInputDirPath, fp));
      if (fileData.dir && !hasDir(fileData.dir)) {
        const dir = fileData.dir;

        // Skip ignored name pattern
        if (!mm.match(fileData.base)) return;

        if (!assetListData[dir]) assetListData[dir] = Object.create(null);

        assetListData[dir][
          fileData.name
        ] = `./${fileData.dir}/${fileData.base}`;
      }
    });
    // console.log("assetListJson", assetListData);

    // Write file
    {
      let codeString = "";
      switch (options.format) {
        case "esm":
          codeString = createCodeString(assetListData, "esm");
          await fsp.writeFile(assetListOutputPath, codeString).catch((err) => {
            throw err;
          });
          break;

        case "cjs":
          // TODO
          break;

        case "json":
          codeString = jsonStringify(assetListData);
          await fsp.writeFile(assetListOutputPath, codeString).catch((err) => {
            throw err;
          });
          break;

        default:
          console.error("Format option not valid.");
          // TODO
          break;
      }
    }

    log(`Output List: ${assetListOutputPath}`);
  };

  // Watch
  if (options.watch) {
    chokidar
      .watch(absoluteInputDirPath, {
        ignored: assetListOutputPath,
        ignoreInitial: true,
      })
      // .on("all", (event, path) => {
      //   console.log(event, path);
      // })
      .on("change", (path) => {
        outputList();
        log(`Changed: ${path}`);
      })
      .on("unlink", (path) => {
        outputList();
        log(`Removed: ${path}`);
      });
    log(`Watching '${absoluteInputDirPath}'...`);
  }

  await outputList();
}
