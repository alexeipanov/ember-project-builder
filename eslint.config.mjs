import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { files: ["**/*.cjs"], languageOptions: { sourceType: "script" }},
  { languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
];
