import { readdirSync } from 'fs';
import chalk from 'chalk';
import { join } from 'path';

const {name: groupName, git} = require('./package.json')

const headPkgList = [];
// utils must build before core
// runtime must build before renderer-react
const pkgList = readdirSync(join(__dirname, 'packages')).filter(
  (pkg) => pkg.charAt(0) !== '.' && !headPkgList.includes(pkg),
);

const alias = pkgList.reduce((pre, pkg) => {
  pre[`@${groupName}/${pkg}`] = join(__dirname, 'packages', pkg, 'src/index.tsx');
  return {
    ...pre,
  };
}, {});

console.log(`🌼 alias list \n${chalk.blue(Object.keys(alias).join('\n'))}`);

const tailPkgList = pkgList
  .map((path) => [join('packages', path, 'src'), join('packages', path, 'src', 'components')])
  .reduce((acc, val) => acc.concat(val), []);

const isProduction = process.env.NODE_ENV === 'production';

const isDeploy = process.env.SITE_DEPLOY === 'TRUE';

export default {
  title: groupName,
  base: !isProduction ? '/' : `/${groupName}-pkgs/`,
  publicPath: isProduction ? `/${groupName}-pkgs/` : '/',
  mode: 'site',
  logo: 'https://s4.aconvert.com/convert/p3r68-cdx67/axyt7-0km7f.svg',
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
    ],
  ],
  metas: [
    {
      'data-rh': 'keywords',
      property: 'og:image',
      content: 'https://procomponents.ant.design/icon.png',
    },
    {
      property: 'og:description',
      content: '🏆 让中后台开发更简单',
    },
    {
      name: 'keywords',
      content: '中后台,admin,Ant Design,ant design,Table,react,hdec',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
    {
      name: 'theme-color',
      content: '#1890ff',
    },
  ],
  // alias: process.env.NODE_ENV === 'development' ? alias : {},
  alias,
  // 用于切换 antd 暗黑模式
  // antd: {
  //   dark: true,
  // },
  resolve: {
    includes: [...tailPkgList, 'docs'],
  },
  locales: [
    ['zh-CN', '中文'],
    ['en-US', 'English'],
  ],
  navs: {
    'zh-CN': [
      null,
      {
        title: 'gitlab',
        path: git,
      },
    ],
  },
  analytics: isProduction
    ? {
        ga: 'UA-173569162-1',
      }
    : false,
  hash: true,
  ssr: isDeploy ? {} : undefined,
  exportStatic: {},
  targets: {
    chrome: 80,
    firefox: false,
    safari: false,
    edge: false,
    ios: false,
  },
  theme: {
    '@s-site-menu-width': '258px',
  },
  ignoreMomentLocale: true,
  headScripts: [],
  links:
    process.env.NODE_ENV === 'development'
      ? ['https://gw.alipayobjects.com/os/lib/antd/4.6.6/dist/antd.css']
      : [],
  externals: { darkreader: 'window.DarkReader' },
  menus: {
    '/components': [
      {
        title: '快速开始',
        children: ['components.md'],
      },
      {
        title: '通用',
        children: pkgList,
      },
    ],
  },
  webpack5: {},
  mfsu: !isDeploy ? {} : undefined,
  fastRefresh: {},
};
