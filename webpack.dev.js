const { mergeWithRules } = require("webpack-merge");
const common = require("./webpack.common.js");

const dev = {
    mode: "development",
    devtool: "eval-source-map",
    devServer: {
        watchFiles: ["./src/template.html"]
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader"]
            }
        ]
    },
};

module.exports = mergeWithRules({
    module: {
        rules: {
            test:"match",
            use:"prepend"
        }
    }
})(common, dev);