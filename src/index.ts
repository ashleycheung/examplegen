#! /usr/bin/env node
import fs from 'fs';
import ts from 'typescript';
import commandLineArgs, { OptionDefinition } from 'command-line-args';
import path from 'path';

const cliOptions: OptionDefinition[] = [
  { name: 'in', type: String, defaultValue: './' },
  { name: 'out', type: String, defaultValue: './' },
  { name: 'ignore', type: String, defaultValue: undefined },
  { name: 'outDirName', type: String, defaultValue: 'examples' },
  { name: 'include', type: String, defaultValue: /\.test\.ts/ },
  { name: 'describePrefix', type: String, defaultValue: 'example:' },
];

const options = commandLineArgs(cliOptions);

function getDescription(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
  if (ts.isCallExpression(node)) {
    return node.arguments[0]?.getText(sourceFile).slice(1, -1);
  }
  return undefined;
}

interface Example {
  description: string;
  markdown: string;
}

// Get all children examples of a given node
function getChildExamples(node: ts.Node, sourceFile: ts.SourceFile): Example[] {
  const examples: Example[] = [];
  node.forEachChild((node) => {
    if (ts.isCallExpression(node) && node.expression.getText(sourceFile) === 'it') {
      // Get the description
      let description = getDescription(node, sourceFile);
      if (description === undefined || !description.startsWith(options['describePrefix'])) {
        return;
      }
      description = description.slice(options['describePrefix'].length);

      // Get inner text and clean it
      let innerText = node.arguments[1]?.getText(sourceFile);
      if (innerText?.startsWith('() => {')) {
        innerText = innerText.slice('() => {'.length);
      }
      if (innerText?.endsWith('}')) {
        innerText = innerText.slice(0, innerText.length - '}'.length);
      }
      const minStartSpace = innerText
        ?.split('\n')
        .filter((line) => line.trim().length !== 0)
        .map((line) => line.length - line.trimStart().length)
        .reduce(
          (min: number | undefined, currLength) => Math.min(min || currLength, currLength),
          undefined
        );
      if (minStartSpace) {
        innerText = innerText
          .split('\n')
          .map((line) => line.slice(minStartSpace))
          .join('\n');
      }

      // Create markdown
      const markdown = '```ts\n' + innerText + '\n```';
      examples.push({
        description: description,
        markdown: markdown,
      });
    }
    examples.push(...getChildExamples(node, sourceFile));
  });
  return examples;
}

// Generate markdown example given a test file path
function generateMarkdown(filePath: string, outDir: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Create AST
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest);
  // Recursively find "it" methods
  const traverse = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      if (node.expression.getText(sourceFile) === 'describe') {
        const description = getDescription(node, sourceFile);
        if (description !== undefined && description.startsWith(options['describePrefix'])) {
          // Get all children cases
          const examples = getChildExamples(node, sourceFile);
          const fileName = description.slice(options['describePrefix'].length) + '.md';
          const outContent = examples
            .map((example) => example.description + '\n' + example.markdown)
            .join('\n');
          if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
          }
          console.log(`Generated file ${fileName}`);
          fs.writeFileSync(path.join(outDir, fileName), outContent);
        }
      }
    }
    node.forEachChild(traverse);
  };
  traverse(sourceFile);
}

function recursiveSearch(
  inDir: string,
  outDir: string,
  include: string,
  ignore: string | undefined
) {
  fs.readdirSync(inDir).forEach((fileName) => {
    const filePath = path.join(inDir, fileName);
    // Matches ignore so exclude
    if (ignore !== undefined && new RegExp(ignore).test(filePath)) {
      return;
    }
    if (fs.lstatSync(filePath).isDirectory()) {
      recursiveSearch(filePath, path.join(outDir, fileName), include, ignore);
    } else if (new RegExp(include).test(filePath)) {
      generateMarkdown(filePath, outDir);
    }
  });
}
recursiveSearch(
  options['in'],
  path.join(options['out'], options['outDirName']),
  options['include'],
  options['ignore']
);
