module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(markdown-table|mdast-util-gfm-table|mdast-util-gfm-.*|escape-string-regexp|find-and-replace|mdast-util-find-and-replace|mdast-util-gfm-.*|unified|unified-.*|trim-lines|mdast-util-.*|unist-util-.*|micromark-util-.*|hast-util-.*|react-markdown|remark-gfm|remark-.*|rehype-.*|micromark|micromark-.*|devlop|unist-.*|mdast-.*|estree-.*|hast-.*|bail|ccount|is-plain-obj|trough|vfile|vfile-message|property-information|space-separated-tokens|comma-separated-tokens|zwitch|web-namespaces|direction|longest-streak|decode-named-character-reference|character-entities-.*|html-url-attributes|html-attributes|html-void-elements|html-whitespace-sensitive-tag-names|html-tag-names|html-element-attributes|html-element-content-categories|estree-util-.*|@types/estree)/)'
  ],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
