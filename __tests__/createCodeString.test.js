import createCodeString, { ESM_PREFIX } from "../src/createCodeString";
import { jsonStringify } from "../src/utils";

describe("createCodeString/basic", () => {
  /** @type {import("../src/createFileHashJson").AssetListJson} */
  const inputFileMapJson = {
    image: {
      cat: "./image/catImage.jpg",
      dog: "./image/Dog.jpg",
    },
    sound: {
      bump: "./sound/bump.mp3",
    },
  };

  test("esm format", () => {
    const expectedOutput = `
import ${ESM_PREFIX}0 from "./image/catImage.jpg";
import ${ESM_PREFIX}1 from "./image/Dog.jpg";
import ${ESM_PREFIX}2 from "./sound/bump.mp3";
export default {
  "image": {
    "cat": ${ESM_PREFIX}0,
    "dog": ${ESM_PREFIX}1
  },
  "sound": {
    "bump": ${ESM_PREFIX}2
  }
};`.trim();
    expect(createCodeString(inputFileMapJson, "esm")).toBe(expectedOutput);
  });

  // TODO: json format

  test("default format", () => {
    const expectedOutput = `
export default ${jsonStringify(inputFileMapJson)}
    `.trim();
    expect(createCodeString(inputFileMapJson, "none")).toBe(expectedOutput);
  });
});
