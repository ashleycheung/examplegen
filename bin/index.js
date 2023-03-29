#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var typescript_1 = __importDefault(require("typescript"));
var command_line_args_1 = __importDefault(require("command-line-args"));
var path_1 = __importDefault(require("path"));
var cliOptions = [
    { name: 'in', type: String, defaultValue: './' },
    { name: 'out', type: String, defaultValue: './' },
    { name: 'ignore', type: String, defaultValue: undefined },
    { name: 'outDirName', type: String, defaultValue: 'examples' },
    { name: 'include', type: String, defaultValue: /\.test\.ts/ },
    { name: 'describePrefix', type: String, defaultValue: 'example:' },
];
var options = (0, command_line_args_1.default)(cliOptions);
function getDescription(node, sourceFile) {
    var _a;
    if (typescript_1.default.isCallExpression(node)) {
        return (_a = node.arguments[0]) === null || _a === void 0 ? void 0 : _a.getText(sourceFile).slice(1, -1);
    }
    return undefined;
}
// Get all children examples of a given node
function getChildExamples(node, sourceFile) {
    var examples = [];
    node.forEachChild(function (node) {
        var _a;
        if (typescript_1.default.isCallExpression(node) && node.expression.getText(sourceFile) === 'it') {
            // Get the description
            var description = getDescription(node, sourceFile);
            if (description === undefined || !description.startsWith(options['describePrefix'])) {
                return;
            }
            description = description.slice(options['describePrefix'].length);
            // Get inner text and clean it
            var innerText = (_a = node.arguments[1]) === null || _a === void 0 ? void 0 : _a.getText(sourceFile);
            if (innerText === null || innerText === void 0 ? void 0 : innerText.startsWith('() => {')) {
                innerText = innerText.slice('() => {'.length);
            }
            if (innerText === null || innerText === void 0 ? void 0 : innerText.endsWith('}')) {
                innerText = innerText.slice(0, innerText.length - '}'.length);
            }
            var minStartSpace_1 = innerText === null || innerText === void 0 ? void 0 : innerText.split('\n').filter(function (line) { return line.trim().length !== 0; }).map(function (line) { return line.length - line.trimStart().length; }).reduce(function (min, currLength) { return Math.min(min || currLength, currLength); }, undefined);
            if (minStartSpace_1) {
                innerText = innerText
                    .split('\n')
                    .map(function (line) { return line.slice(minStartSpace_1); })
                    .join('\n');
            }
            // Create markdown
            var markdown = '```ts\n' + innerText + '\n```';
            examples.push({
                description: description,
                markdown: markdown,
            });
        }
        examples.push.apply(examples, getChildExamples(node, sourceFile));
    });
    return examples;
}
// Generate markdown example given a test file path
function generateMarkdown(filePath, outDir) {
    var content = fs_1.default.readFileSync(filePath, 'utf8');
    // Create AST
    var sourceFile = typescript_1.default.createSourceFile(filePath, content, typescript_1.default.ScriptTarget.Latest);
    // Recursively find "it" methods
    var traverse = function (node) {
        if (typescript_1.default.isCallExpression(node)) {
            if (node.expression.getText(sourceFile) === 'describe') {
                var description = getDescription(node, sourceFile);
                if (description !== undefined && description.startsWith(options['describePrefix'])) {
                    // Get all children cases
                    var examples = getChildExamples(node, sourceFile);
                    var fileName = description.slice(options['describePrefix'].length) + '.md';
                    var outContent = examples
                        .map(function (example) { return example.description + '\n' + example.markdown; })
                        .join('\n');
                    if (!fs_1.default.existsSync(outDir)) {
                        fs_1.default.mkdirSync(outDir, { recursive: true });
                    }
                    console.log("Generated file ".concat(fileName));
                    fs_1.default.writeFileSync(path_1.default.join(outDir, fileName), outContent);
                }
            }
        }
        node.forEachChild(traverse);
    };
    traverse(sourceFile);
}
function recursiveSearch(inDir, outDir, include, ignore) {
    fs_1.default.readdirSync(inDir).forEach(function (fileName) {
        var filePath = path_1.default.join(inDir, fileName);
        // Matches ignore so exclude
        if (ignore !== undefined && new RegExp(ignore).test(filePath)) {
            return;
        }
        if (fs_1.default.lstatSync(filePath).isDirectory()) {
            recursiveSearch(filePath, path_1.default.join(outDir, fileName), include, ignore);
        }
        else if (new RegExp(include).test(filePath)) {
            generateMarkdown(filePath, outDir);
        }
    });
}
recursiveSearch(options['in'], path_1.default.join(options['out'], options['outDirName']), options['include'], options['ignore']);
