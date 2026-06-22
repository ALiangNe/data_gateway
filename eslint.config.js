import tseslint from 'typescript-eslint'

export default [
    {
        ignores: ['node_modules/**/*', 'dist/**/*', 'eslint.config.js'],
    },
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.js', 'src/**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        rules: {
            // Node
            'no-console': 'off',
            // TypeScript
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            // Style
            'indent': ['error', 4, { 'SwitchCase': 1 }],
            'quotes': ['error', 'single'],
            'semi': ['error', 'never'],
            'comma-dangle': ['error', 'always-multiline'],
            'key-spacing': ['error', { beforeColon: false, afterColon: true }],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'space-before-function-paren': ['error', { named: 'never', asyncArrow: 'always' }],
            'arrow-spacing': ['error', { before: true, after: true }],
            'space-infix-ops': 'error',
            'eol-last': ['error', 'always'],
            'no-trailing-spaces': 'error',
            'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
            'no-unused-vars': 'off',
            'no-mixed-spaces-and-tabs': 'error'
        }
    }
]
