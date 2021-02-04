const fs = require("fs");
const path = require("path");

/**
 * ファイルを再帰的に全取得
 * @see https://stackoverflow.com/a/5827895
 *
 * @param {string} dir
 * @param {(err: Error|null, result?: string[])=> any} done
 */
function walk(dir, done) {
  /** @type {string[]} */
  let results = [];

  // fs.Dirent requires node.js v10.10.0 or higher
  // https://nodejs.org/api/fs.html#fs_class_fs_dirent
  fs.readdir(dir, { withFileTypes: true }, function (err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);

    list.forEach((dirent) => {
      const file = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        walk(file, (_err, res) => {
          if (res) results = results.concat(res);
          if (!--pending) done(null, results);
        });
      } else {
        results.push(file);
        if (!--pending) done(null, results);
      }
    });
  });
}

/**
 * ファイル全取得（非同期）
 * @param {string} dir
 */
exports.getFiles = function (dir) {
  return new Promise((resolve, reject) => {
    walk(dir, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * 文字列が"fooDir/bar" のようなディレクトリ区切り文字を含んでいるかどうかを簡易的にチェック
 * （OSによる差異吸収）
 * 具体的にはpath.parse後にdirが空かどうかをチェック
 * "fooDir/bar" => true
 * "fooDir/bar/baz" => true
 * "fooDir/bar.jpg" => true
 * "bar" => false
 * "bar/" => false
 *
 * @param {string} pathStr
 */
exports.hasDir = function (pathStr) {
  return path.parse(pathStr).dir != "";
};
