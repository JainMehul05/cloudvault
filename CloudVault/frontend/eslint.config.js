import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(js.configs.recommended,...tseslint.configs.recommended,{files:['src/**/*.{ts,tsx}'],languageOptions:{globals:{window:'readonly',document:'readonly',fetch:'readonly',FormData:'readonly',XMLHttpRequest:'readonly',File:'readonly',URLSearchParams:'readonly',AbortSignal:'readonly',setTimeout:'readonly',clearTimeout:'readonly'}}});
