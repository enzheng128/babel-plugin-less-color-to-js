# babel-plugin-less-color-to-js
[中文](./README.zh.md)

## Introduction

`babel-plugin-less-color-to-js` is a Babel plugin designed to address the issue of using LESS color variables in JavaScript. The plugin will automatically replace corresponding JavaScript string literals with color variables defined in a global LESS file. This means that you can directly use the names of LESS color variables in your JavaScript files without worrying about color values.

## Installation

To install via npm:

```bash
npm install --save-dev babel-plugin-less-color-to-js
```

## Usage

First, you need to create an instance of `BabelLessColorToJs`, providing the path of your global LESS file:

```javascript
const BabelLessColorToJs = require('babel-plugin-less-color-to-js');

const babelLessColorToJs = new BabelLessColorToJs({
  fileName: 'path/to/your/less/file.less',
});
```

Then, add this instance to the plugins array in your Babel configuration:

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    babelLessColorToJs,
    // ...
  ],
};
```

Now, the color variables defined in your global LESS file can be directly used in JavaScript. For example, if you have a color variable `@primary-color: #1DA57A;`, you can use it in your JavaScript file like this:

```javascript
const color = '@primary-color';  // This will be replaced with '#1DA57A'
```

Be aware that this plugin affects all string literals, not just those used in style properties. Therefore, you need to ensure that strings in your code that share names with color variables are not inadvertently replaced.

## Notes

- If the LESS file are updated during the build process, you may need to restart the build to ensure the accuracy of the color values.

- This plugin can only handle color variables defined in the LESS file. If your color values are defined in JavaScript or in CSS, SCSS, Stylus, or other style files, this plugin may not be able to handle them correctly.

## Contributing

Contributions to this project are welcome. If you have any questions or suggestions, you can submit them through issues or pull requests.