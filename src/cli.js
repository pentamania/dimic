import { promises as fsp, existsSync } from "fs";
import { join, resolve } from "path";
import { Minimatch } from "minimatch";
import chokidar from "chokidar";
import parseArg from "./parseArg";
import { version } from "../package.json";
import createFileHashJson from "./createFileHashJson";
import createCodeString from "./createCodeString";
const log = console.log.bind(console);

/**
 * @param {string[]} rawArgs
 */
export async function cli(rawArgs) {
  const options = parseArg(rawArgs);
  // console.log('options',options);

  // バージョン出力コマンド
  if (options.version) {
    log(`v${version}`);
    return;
  }

  const absoluteInputDirPath = resolve(options.inputDir);

  // ディレクトリが見つからない場合のエラー（兼ensureDir）
  if (!existsSync(absoluteInputDirPath)) {
    throw Error(`Input directory "${options.inputDir}" does not exist`);
  }

  const mm = new Minimatch(options.matchPattern);
  const outputFilePath = join(
    absoluteInputDirPath,
    options.outputFile
  );
  const outputList = async function () {
    const assetListData = await createFileHashJson(absoluteInputDirPath, mm);

    // Write file
    await fsp
      .writeFile(
        outputFilePath,
        createCodeString(assetListData, options.format)
      )
      .catch((err) => {
        throw err;
      });

    log(`Output file: ${outputFilePath}`);
  };

  // Watch
  if (options.watch) {
    chokidar
      .watch(absoluteInputDirPath, {
        ignored: outputFilePath,
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
