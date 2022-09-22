module.exports = {
  ...require("ory-prettier-styles"),
  importOrder: ["^\\.\\./(?!.*\\.[a-z]+$)(.*)$", "^\\./(?!.*\\.[a-z]+$)(.*)$"],
  importOrderSeparation: false,
  importOrderParserPlugins: ["jsx", "typescript"],
}
