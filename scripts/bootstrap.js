// 自动生成组件库的package.json和readme文件
const { existsSync, writeFileSync, readdirSync } = require('fs')
const { join } = require('path')
const { yParser } = require('@umijs/utils')
const { name: groupName } = require('../package.json')(async () => {
  const args = yParser(process.argv)
  const version = '1.0.0-beta.1'

  const pkgs = readdirSync(join(__dirname, '../packages')).filter((pkg) => pkg.charAt(0) !== '.')

  pkgs.forEach((shortName) => {
    const name = `${shortName}`

    const pkgJSONPath = join(__dirname, '..', 'packages', shortName, 'package.json')
    const pkgJSONExists = existsSync(pkgJSONPath)
    let json
    if (args.force || !pkgJSONExists) {
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
          url: `http://10.215.171.199:7800/fe-pkgs/awaited/packages/${name}`,
        },
        browserslist: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 11'],
        keywords: ['antd', 'admin', 'ant-design', 'ant-design-pro', name, `@${groupName}/${name}`],
        authors: [],
        license: 'MIT',
        bugs: 'http://10.215.171.199:7800/fe-pkgs/awaited/-/issues',
        homepage: `http://10.215.171.199:7800/fe-pkgs/awaited/-/issues`,
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
    }

    const readmePath = join(__dirname, '..', 'packages', shortName, 'README.md')
    if (args.force || !existsSync(readmePath)) {
      writeFileSync(
        readmePath,
        `# ${name}

> ${json.description}.

See our website [@${groupName}/${name}](https://umijs.org/plugins/${shortName}) for more information.

## Install

Using npm:

\`\`\`bash
$ npm install --save @${groupName}/${name}]
\`\`\`

or using yarn:

\`\`\`bash
$ yarn add @${groupName}/${name}]
\`\`\`
`,
      )
    }
  })
})()
