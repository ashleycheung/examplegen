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

| **Option**     | **Description**                                        |
| -------------- | ------------------------------------------------------ |
| in             | The starting directory to search files in              |
| out            | The out directory to place the generated files         |
| ignore         | A regex expression of files to ignore                  |
| outDirName     | The generated directory name                           |
| include        | A regex expression of files to include                 |
| describePrefix | The prefix in the the describe description to look for |
