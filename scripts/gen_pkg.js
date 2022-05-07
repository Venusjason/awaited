// 自动生成组件库的package.json和readme文件
const { existsSync, writeFileSync, readdirSync, mkdirSync } = require('fs')
const chalk = require('chalk')
const { join } = require('path')
const { yParser } = require('@umijs/utils')
const { name: groupName, repository } = require('../package.json')
const _ = require('lodash')

const version = '0.1.0-beta.1'

const [, , shortName] = process.argv

const pkgDirname = join(__dirname, '..', 'packages', shortName)

/** 校验小写 字母开头 字母 数字 连接符 */
const reg = /^[a-z0-9-]+$/
if (!reg.test(shortName)) {
  console.error(`${shortName} 不符合npm包命名规范`)
  process.exit(1)
  return
}

if (!existsSync(join(__dirname, '..', 'packages', shortName))) {
  mkdirSync(join(__dirname, '..', 'packages', shortName))
}

const name = `@${groupName}/${shortName}`

const pkgJSONPath = join(__dirname, '..', 'packages', shortName, 'package.json')
const pkgJSONExists = existsSync(pkgJSONPath)
let json
if (!pkgJSONExists) {
  json = {
    name,
    version,
    description: name,
    module: 'es/index.js',
    main: 'lib/index.js',
    types: 'lib/index.d.ts',
    files: ['lib', 'src', 'dist', 'es'],
    repository: {
      type: 'git',
      url: `${repository.url}/packages/${shortName}`,
    },
    dependencies: {},
    devDependencies: {},
    browserslist: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 11'],
    keywords: ['antd', 'admin', 'ant-design', 'ant-design-pro', shortName, name],
    authors: [],
    license: 'MIT',
    bugs: `${repository.url}/-/issues`,
    homepage: `${repository.url}/-/issues`,
    peerDependencies: {
      antd: '4.x',
      react: '^16.8.0',
    },
    publishConfig: {
      access: 'public',
    },
  }
  if (pkgJSONExists) {
    const pkg = require(pkgJSONPath)
    ;[
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'bin',
      'version',
      'files',
      'authors',
      'types',
      'sideEffects',
      'main',
      'module',
      'description',
    ].forEach((key) => {
      if (pkg[key]) json[key] = pkg[key]
    })
  }
  writeFileSync(pkgJSONPath, `${JSON.stringify(json, null, 2)}\n`)
  console.log(chalk.blue(`gen file success:${pkgJSONPath}`))
}

const readmePath = join(__dirname, '..', 'packages', shortName, 'README.md')
if (!existsSync(readmePath)) {
  writeFileSync(
    readmePath,
    `# ${name}

> ${json.description}.

See our website [${name}](https://venusjin.gitee.io/awaited-pkgs/components/${shortName}/${shortName}) for more information.

## Install

Using npm:

\`\`\`bash
$ npm install --save ${name}
\`\`\`

or using yarn:

\`\`\`bash
$ yarn add ${name}
\`\`\`
`,
  )

  console.log(chalk.blue(`gen file success:${readmePath}`))
}

if (!existsSync(pkgDirname + '/src')) mkdirSync(pkgDirname + '/src')

if (!existsSync(pkgDirname + '/src/index.ts')) {
  writeFileSync(
    pkgDirname + '/src/index.ts',
    `
    /**
    * 组件导出口
    * /
    `,
  )
  console.log(chalk.blue(`gen file success:${pkgDirname + '/src/index.ts'}`))
}

if (!existsSync(`${pkgDirname}/src/${shortName}.md`)) {
  writeFileSync(
    `${pkgDirname}/src/${shortName}.md`,
    `
---
title: ${shortName}
group:
  path: /${shortName}
nav:
  title: 组件
  path: /components
---

    # ${name}

> ${json.description}

### 组件背景

### 组件功能

### 组件实现

### 作者

## Install

Using npm:

\`\`\`bash
$ npm install --save ${name}
\`\`\`

or using yarn:

\`\`\`bash
$ yarn add ${name}
\`\`\`
### 使用示例
\`\`\`tsx
import React from 'react';
import ${_.upperFirst(_.camelCase(shortName))} from '@awaited/${shortName}'

export default () => {
  return <${_.upperFirst(_.camelCase(shortName))} />
}
\`\`\`
### API说明
|  api   | 描述    | 数据类型 | 默认值 |
|  ----  | ----  | ----  |----  |
|  - | - | - | -  |
`.trim(),
  )

  console.log(chalk.blue(`gen file success:${pkgDirname}/src/${shortName}.md`))
}
