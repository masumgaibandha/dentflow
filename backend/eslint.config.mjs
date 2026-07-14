import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        // Auto-discovers the right tsconfig per linted file (typescript-eslint
        // v8's recommended replacement for a hardcoded `project` path) so
        // type-aware rules below have real type information to work with.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Unused imports/variables - error, not warn, so `--max-warnings=0`
      // catches them. Leading-underscore escape hatch for intentionally
      // unused destructured/catch bindings, matching common TS convention.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-empty": ["error", { allowEmptyCatch: false }],
      "@typescript-eslint/no-empty-function": "error",
      // Type-aware correctness rules for an async/Express codebase - an
      // un-awaited promise (a forgotten `await`) is a real, recurring bug
      // class here, not just a style nit. Deliberately not pulling in the
      // full `recommendedTypeChecked` preset's `no-unsafe-*` rules, which
      // would flag mongoose's inherently loosely-typed documents and the
      // existing `as unknown as X` populate-cast pattern used throughout
      // this codebase - that's a separate, much larger cleanup than this
      // milestone's lint-infrastructure scope.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
  {
    // Test files legitimately assert against fully-typed API responses with
    // loose `expect(...).toMatchObject` shapes; no additional relaxation
    // needed today, but this block exists so future test-only exceptions
    // have an obvious place to live rather than weakening the rules above.
    files: ["src/**/*.test.ts"],
    rules: {},
  },
);
