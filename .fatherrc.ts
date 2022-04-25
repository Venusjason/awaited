import { readdirSync } from 'fs';
import { join, resolve } from 'path';

// utils must build before core
// runtime must build before renderer-react
// components dependencies order: form -> table -> list
const headPkgs: string[] = ['utils', 'skeleton'];
const tailPkgs = readdirSync(join(__dirname, 'packages')).filter(
  (pkg) => pkg.charAt(0) !== '.' && !headPkgs.includes(pkg),
);

// const pkgFilter = {
//   exclude: [resolve(__dirname, './packages/select-ant-query-table/src/example/A.tsx')]
// }

const type = process.env.BUILD_TYPE;

let config = {};

if (type === 'lib') {
  config = {
    cjs: { type: 'babel', lazy: true },
    esm: false,
    pkgs: [...headPkgs, ...tailPkgs],
    // pkgFilter
  };
}

if (type === 'es') {
  config = {
    cjs: false,
    esm: {
      type: 'babel',
      importLibToEs: true,
    },
    pkgs: [...headPkgs, ...tailPkgs],
    // pkgFilter,
    extraBabelPlugins: [
      ['babel-plugin-import', { libraryName: 'antd', libraryDirectory: 'es', style: true }, 'antd'],
      [require('./scripts/replaceLib')],
    ],
  };
}

export default config;
