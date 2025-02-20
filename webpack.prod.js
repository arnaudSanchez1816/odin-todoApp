const { mergeWithRules } = require("webpack-merge");
const common = require("./webpack.common.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const prod = {
    mode: "production",
    devtool: 'source-map',
    plugins: [
        new MiniCssExtractPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader]
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
})(common, prod);