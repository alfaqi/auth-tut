// eslint.config.js
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "dist/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node, // ✅ Node.js globals like __dirname, process
    },
    rules: {
      "no-unused-vars": "warn",
      eqeqeq: "error",
      "no-undef": "error", // catch undefined vars
      "no-console": "off", // you can flip to "warn" if you want to restrict logs
      "consistent-return": "off",
    },
  },
];
