const fs = require('fs');
const less = require('less');
const postcss = require('postcss');

const syncRender = function (lessCode, options = {}) {
  options.syncImport = true;
  let render = null;
  less.render(lessCode, options, (err, result) => {
    if (err) {throw err;}
    render = result;
  });
  return render;
};
const syncParse = function (lessCode, options = {}) {
  options.syncImport = true;
  let parse = null;
  less.parse(lessCode, options, (err, result) => {
    if (err) {throw err;}
    parse = result;
  });
  return parse;
};

const getFileColor = (fileName) => {
  // 读取文件
  const lessCode = fs.readFileSync(fileName, 'utf-8');
  // 获取less颜色变量AST
  const colorData = syncParse(lessCode);
  const rules = colorData.rules;
  // 获取颜色变量名
  const colorNames = rules.filter((rule) => rule.name).map((rule) => rule.name);
  // 拼接css颜色字符串
  const cssColorInfo = `.color{
    ${colorNames.map((color) => `${color.split('@')[1]}: ${color};`).join('\n')}
  }`;
  // css渲染信息
  const cssRenderColorInfo = syncRender(
    lessCode + '\n' + cssColorInfo
  ).css;
  // cssAST
  const cssAst = postcss.parse(cssRenderColorInfo);
  const cssNameAst = cssAst.nodes.filter((node) => node.type === 'rule')[0]
    .nodes;
  const cssNameMap = cssNameAst.reduce((pre, cur) => {
    pre[`@${cur.prop}`] = cur.value;
    return pre;
  }, {});
  return cssNameMap;
};

function lessColorToConst (config) {
  const { fileName, debug = false } = config;
  const cssNameMap = getFileColor(fileName);
  return function({ types: t }) {
    return {
      visitor: {
        StringLiteral(path) {
          const value = path.node.value;
          if (cssNameMap[value]) {
            debug && console.log('lessColorToConst', cssNameMap[value])
            path.replaceWith(t.stringLiteral(cssNameMap[value]));
          }
        },
      }
    };
  };
}


module.exports = lessColorToConst;