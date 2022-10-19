module.exports = {
    extends: [
        '@lcooper/eslint-config-typescript',
        '@lcooper/eslint-config-jest',
    ],
    parserOptions: {
        project: 'tsconfig.json',
    },
};