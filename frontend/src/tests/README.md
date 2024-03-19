# README File for Testing
1. currently jest is used along with react testing library for test.
 - link to react testing library: https://testing-library.com/docs/
 - link to jest: https://jestjs.io/docs/

2. in /transforms folder, there are mocks of files with different extensions, which are referenced in package.json/jest/moduleNameMapper section.

3. in the root folder(/tests) there are tests of different components.

4. in the parent folder(i.e. /frontend), jestConfig.js contains global rules for the test.

5. commands to run tests:
 - *npm test*: run the test and log the output
 - *npm run test:ci*: run the test and give a brief review on test status(result, coverage, etc.)

6. basic concepts:
 - *describe*: describes a component or function we want to test, consists of one or many tests
 - *it*: describes a single test
 - *beforeEach* and *afterEach*: the code in beforeEach(afterEach) block will be executed before(after) each silgle test(i.e. an *it* block)
