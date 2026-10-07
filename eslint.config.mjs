import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'dist-web/**', 'generated/**', 'release/**', '.tools/**', '.superpowers/**', 'vendor/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
