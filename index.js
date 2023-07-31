const fs = require('fs');
const less = require('less');
const postless = require('postcss-less');

const syncRender = function (lessCode, options = {}) {
  options.syncImport = true;
  let render = null;
  less.render(lessCode, options, (err, result) => {
    if (err) {
      throw err;
    }
    render = result;
  });
  return render;
};

const syncParse = function (lessCode, options = {}) {
  options.syncImport = true;
  let parse = null;
  less.parse(lessCode, options, (err, result) => {
    if (err) {
      throw err;
    }
    parse = result;
  });
  return parse;
};

const getFileColor = (fileName) => {
  // 读取文件
  const lessCode = fs.readFileSync(fileName, 'utf-8');
  // 获取less颜色变量AST
  const lessAst = postless.parse(lessCode)
  let colorNames = [];
  // 获取颜色变量名，遍历所有的声明节点// @ 开头
  lessAst.walkAtRules((rule) => {
    if (rule.type === 'atrule') {
      colorNames.push(`@${rule.name}`)
    }
  })
  // 拼接css颜色字符串
  const cssColorInfo = `.color{
    ${colorNames.map((color) => `${color.split('@')[1]}: ${color};`).join('\n')}
  }`;
  // css渲染信息
  const cssRenderColorInfo = syncRender(lessCode + '\n' + cssColorInfo).css;
  // cssAST
  const cssAst = postless.parse(cssRenderColorInfo);
  let cssNameAst = []
  cssAst.walkDecls((rule) => {
    if (rule.type === 'decl') {
      cssNameAst.push(rule)
    }
  })
  const cssNameMap = cssNameAst.reduce((pre, cur) => {
    pre[`@${cur.prop}`] = cur.value;
    return pre;
  }, {});
  return cssNameMap;
};

function lessColorToConst(config) {
  const { fileName, debug = false } = config;
  const cssNameMap = getFileColor(fileName);
  return function ({ types: t }) {
    return {
      visitor: {
        StringLiteral(path) {
          const value = path.node.value;
          if (cssNameMap.hasOwnProperty(value)) {
            debug && console.log('lessColorToConst', cssNameMap[value]);
            path.replaceWith(t.stringLiteral(cssNameMap[value]));
          }
        },
      },
    };
  };
}

module.exports = lessColorToConst;
