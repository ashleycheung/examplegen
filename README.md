# examplegen

Generate markdown documentation from your tests

## Installation

```bash
yarn add examplegen
```

## How to use

Given a test file ending in `.test.ts` with the following contents

```ts
describe('example:DocName', () => {
  it('example:Hello World', () => {
    console.log('hello world!');
  });
});
```

Running the following command will generate the following markdown

```bash
examplegen --in ./src --out ./ --ignore *node_modules*
```

**DocName.md**

---

Hello World

```ts
console.log('hello world!');
```

---

## Configuration

| **Option**       | Default Value | **Description**                                         |
| ---------------- | ------------- | ------------------------------------------------------- |
| title            | Documentation | The title to display in the index page                  |
| in               | ./            | The starting directory to search files in               |
| out              | ./            | The out directory to place the generated files          |
| ignore           | undefined     | A regex expression of files to ignore                   |
| outDirName       | examples      | The generated directory name                            |
| include          | /\.test\.ts/  | A regex expression of files to include                  |
| describePrefix   | example:      | The prefix in the the describe description to look for  |
| includeIndexPage | true          | Generates an additional markdown page indexing all docs |
