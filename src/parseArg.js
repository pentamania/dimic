import arg from "arg";
import path from "path";

/**
 * @typedef {"esm"|"cjs"|"json"|"none"} FormatType
 */

// Default params
const DEFAULT_INPUT_DIR = path.join("src", "assets");
const DEFAULT_OUTPUT_FILE_NAME = "assetlist.js";
// const DEFAULT_EXTENSION = "js"; // json|js
/** @type {FormatType} */
const DEFAULT_FORMAT = "esm";
const DEFAULT_WATCH_SETTING = false;
const DEFAULT_MINIFY_SETTING = false;

/**
 * @param {string[]} rawArgs
 */
export default function (rawArgs) {
  const args = arg(
    {
      "--input-dir": String,
      "--output-file": String,
      // "--ext": String,
      "--format": String,
      "--watch": Boolean, // WIP
      "--minify": Boolean, // WIP

      "-w": "--watch", // WIP
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    inputDir: args["--input-dir"] || DEFAULT_INPUT_DIR,
    outputFile: args["--output-file"] || DEFAULT_OUTPUT_FILE_NAME,
    /** @type {FormatType} */
    format: /** @type {FormatType} */ (args["--format"] || DEFAULT_FORMAT),
    // exportExtension: args["--ext"] || DEFAULT_EXTENSION,
    watch: args["--watch"] || DEFAULT_WATCH_SETTING,
    minify: args["--minify"] || DEFAULT_MINIFY_SETTING,
  };
}
