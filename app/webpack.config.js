/*!
 * @author smailsky
 */
var path = require("path");
var config={
    entry:{
        "index":"./index.js"
    },
    output:{
        path:path.join(__dirname, "../electron"),
        publicPath:"",
        filename:"renderer.js"
    },
    target: 'electron-main',
    module: {
        loaders: []
    },
    plugins: []
};
module.exports = config;