# examplegen

A markdown example generator based off your tests

```bash
examplegen --in ./src --out ./ --ignore *node_modules*
```

| **Option**     | **Description**                                        |
| -------------- | ------------------------------------------------------ |
| in             | The starting directory to search files in              |
| out            | The out directory to place the generated files         |
| ignore         | A regex expression of files to ignore                  |
| outDirName     | The generated directory name                           |
| include        | A regex expression of files to include                 |
| describePrefix | The prefix in the the describe description to look for |
