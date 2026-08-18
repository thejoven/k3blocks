/**
 * prismjs 语言组件子路径只有副作用（向全局 Prism 注册语法），官方未提供类型。
 * 动态 import 这些子路径时按 unknown 处理。
 */
declare module "prismjs/components/*";
