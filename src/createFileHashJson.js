import { parse, relative } from "path";
import { getFiles, hasDir } from "./utils";

/**
 * @typedef {{
 *   [assetType: string]: {
 *     [assetKey: string]: string
 *   }
 * }} AssetListJson
 */

/**
 * 対象ディレクトリからハッシュマップオブジェクトを生成する
 * @param {string} inputDirPath 対象ディレクトリ
 * @param {import("minimatch").IMinimatch} mm Minimatchインスタンス
 * @returns {Promise<AssetListJson>}
 */
export default async function (inputDirPath, mm) {
  const allFiles = await getFiles(inputDirPath);

  return (
    allFiles
      // .map((fp) => parse(relative(inputDirPath, fp)))
      .reduce((listData, fp) => {
        const fileData = parse(relative(inputDirPath, fp));
        if (fileData.dir && !hasDir(fileData.dir)) {
          const dir = fileData.dir;

          // Skip ignored name pattern
          if (!mm.match(fileData.base) || !mm.match(fileData.dir))
            return listData;

          // Add new key
          if (!listData[dir]) listData[dir] = Object.create(null);

          listData[dir][fileData.name] = `./${fileData.dir}/${fileData.base}`;
        }
        return listData;
      }, Object.create(null))
  );
}
