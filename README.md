## 背景

在开发大型项目时, 我们通常会遇到同一工程依赖不同组件包, 同时不同的组件包之间还会相互依赖的问题, 那么如何管理组织这些依赖包就是一个迫在眉睫的问题.

![image.png](http://cdn.dooring.cn/dr/1633425666915.png)

我们目前已有的方案有: **Multirepo**(多个依赖包独立进行 git 管理) 和 **Monorepo**(所有依赖库完全放入一个项目工程).

**Multirepo**的缺点在于每个库变更之后，需要发布到线上，然后在项目中重新安装, 打包, 发布, 最后才能更新，这样如果依赖关系越复杂就越难以维护。**Monorepo**最大的缺点就是不便于代码的复用和共享。

为了解决上述的问题, **lerna** 这款工具诞生了, 它可以方便的管理具有多个包的 **JavaScript** 项目。同时对于组件包的开发者和维护者, 为了让团队其他成员更好的理解和使用我们开发的组件, 搭建组件文档和 **demo** 就显得格外重要.

![image.png](http://cdn.dooring.cn/dr/1633426696834.png)

我们对以上提到的几点问题做一个总结:

- 大型项目中如何管理组织依赖包及其版本问题
- 如何高效低成本的搭建简单易用的组件文档
- 如何配置 eslint 代码规范和代码提交规范

接下来我将针对以上问题一一来给出解答. 如果大家想看实际的案例, 可以参考:

- [best-cps | 基于 lerna + dumi 搭建的多包管理实践](https://github.com/MrXujiang/best-cps)

相关采用 lerna 的项目:

| home🏠 | demo✨ | doc📦 | tutorial | wiki |
| --- | --- | --- | --- | --- |
| [website](http://h5.dooring.cn) | [Demo](http://h5.dooring.cn/h5_plus) | [Document](http://h5.dooring.cn/doc) | [视频&Video](https://www.zhihu.com/zvideo/1406394315950653440) | [wiki](https://github.com/MrXujiang/h5-Dooring/wiki) |

## 大型项目中如何管理组织依赖包及其版本问题

这个问题主要用我上面的提到的 **lerna** 工具来解决. 目前我们比较熟悉的 **babel**, **create-react-app**, **vue-cli** 等都使用了 **lerna**.

在没使用 **lerna** 时, 我们不同库的组织形式可能如下:

![image.png](http://cdn.dooring.cn/dr/1633429548344.png)

使用 **lerna** 之后的库组织结构:

![image.png](http://cdn.dooring.cn/dr/1633429780559.png)

以上两个是我做的简图, 基本可以对比出使用 **lerna** 前后的差异, **lerna** 的作用是把多个项目或模块拆分为多个 **packages** 放入一个 git 仓库进行管理。我们可以使用它提供的命令轻松的对不同项目进行管理 , 如下:

- lerna boostrap 自动解决 packages 之间的依赖关系，对于 packages 内部的依赖会直接采用 symlink 的方式关联
- lerna publish 依赖 git 检测文件改动，自动发布，管理版本号
- lerna create 创建一个 lerna 管理的 package 包
- lerna clean 删除所有包下面的 node_modules 目录，也可以删除指定包下面的 node_modules

同时 **lerna** 还会根据 git 提交记录，自动生成 changelog. 当然 **lerna** 还提供了很多有用的命令, 大家感兴趣可以在官网学习.
