import mockfs from "mock-fs";
import { Minimatch } from "minimatch";
import createFileHashJson from "../src/createFileHashJson";

const MOCK_INPUT_DIR_PATH = "/assets";

afterEach(async () => {
  mockfs.restore();
});

describe("createFileHashJson", () => {
  test("basic output", async () => {
    const mockInputDirectory = {
      [MOCK_INPUT_DIR_PATH]: {
        image: {
          "some-image.png": Buffer.from([8, 6, 7, 5, 3, 0, 9]),
        },
        data: {
          "some-file.txt": "file content here",
          "some-json.json": JSON.stringify({ name: "hoge" }),
        },
      },
    };
    const expectedOutput = {
      image: {
        "some-image": "./image/some-image.png",
      },
      data: {
        "some-file": "./data/some-file.txt",
        "some-json": "./data/some-json.json",
      },
    };

    mockfs(mockInputDirectory);
    const hashJson = await createFileHashJson(
      MOCK_INPUT_DIR_PATH,
      new Minimatch("*")
    ).catch((err) => {
      throw err;
    });
    expect(hashJson).toEqual(expectedOutput);
  });

  test("ignore unmatched file/directory", async () => {
    const MATCH_PATTERN = "!_*";
    const mockInputDirectory = {
      [MOCK_INPUT_DIR_PATH]: {
        image: {
          "some-image.png": Buffer.from([8, 6, 7, 5, 3, 0, 9]),
          "_ignored.png": Buffer.from([8, 6, 7, 5, 3, 0, 9]),
        },
        "_ignored-dir": {
          "some-file": "./data/some-file.txt",
        },
      },
    };
    const expectedOutput = {
      image: {
        "some-image": "./image/some-image.png",
      },
    };

    mockfs(mockInputDirectory);
    const hashJson = await createFileHashJson(
      MOCK_INPUT_DIR_PATH,
      new Minimatch(MATCH_PATTERN)
    ).catch((err) => {
      throw err;
    });
    expect(hashJson).toEqual(expectedOutput);
  });

  test("ignore nested directory", async () => {
    const mockInputDirectory = {
      [MOCK_INPUT_DIR_PATH]: {
        image: {
          "some-image.png": Buffer.from([8, 6, 7, 5, 3, 0, 9]),
          "nested-dir": {
            "other-image.png": Buffer.from([8, 6, 7, 5, 3, 0, 9]),
          },
        },
      },
    };
    const expectedOutput = {
      image: {
        "some-image": "./image/some-image.png",
      },
    };

    mockfs(mockInputDirectory);
    const hashJson = await createFileHashJson(
      MOCK_INPUT_DIR_PATH,
      new Minimatch("*")
    ).catch((err) => {
      throw err;
    });
    expect(hashJson).toEqual(expectedOutput);
  });
});
