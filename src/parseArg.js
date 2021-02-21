import arg from "arg";
import path from "path";

/**
 * @typedef {"esm"|"cjs"|"json"|"none"} FormatType
 */

// Default params
const DEFAULT_INPUT_DIR = path.join("src", "assets");
const DEFAULT_OUTPUT_FILE_NAME = "index.js";
// const DEFAULT_EXTENSION = "js"; // json|js
/** @type {FormatType} */
const DEFAULT_FORMAT = "esm";
const DEFAULT_WATCH_SETTING = false;
const DEFAULT_MINIFY_SETTING = false;
const DEFAULT_MATCH_PATTERN = "!_*";

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
      "--match": String,
      "--version": Boolean,
      "--watch": Boolean,
      "--minify": Boolean, // WIP

      "-i": "--input-dir",
      "-o": "--output-file",
      "-v": "--version",
      "-w": "--watch",
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
    matchPattern: args["--match"] || DEFAULT_MATCH_PATTERN,
    version: args["--version"] || false,
    watch: args["--watch"] || DEFAULT_WATCH_SETTING,
    minify: args["--minify"] || DEFAULT_MINIFY_SETTING,
  };
}
