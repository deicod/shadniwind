const path = require("node:path")

module.exports = (api) => {
  api.cache(true)

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "react-native-unistyles/plugin",
        {
          root: "app",
          autoProcessPaths: [
            path.join(__dirname, "components"),
            path.join(__dirname, "lib"),
            path.join(__dirname, "primitives"),
          ],
        },
      ],
    ],
  }
}
