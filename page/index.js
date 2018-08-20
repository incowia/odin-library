// imports
var fs = require('fs');
var LeafDoc = require('leafdoc');
var Handlebars = require('handlebars');

var FILE_ENCODING = 'UTF8';

// parsing cli options
var args = process.argv.slice(2);
var copyFiles = args.indexOf('-copy') > -1;

// search for files that must be included
var includes = [];

// read manifest file and parse the json to determine the component directories
var manifest = JSON.parse(fs.readFileSync('../webpackages/odin-library/manifest.webpackage'));
// extract all component names we need
var compNames = manifest.artifacts.elementaryComponents.map(function (e) {
		return e.artifactId;
	});
// add odin utilities
compNames.push(manifest.artifacts.utilities[0].artifactId);
// search for '.js' and '.leafdoc' files in component directories
compNames.forEach(function (compName) {
	var basePath = '../webpackages/odin-library/' + compName;
	if (!fs.existsSync(basePath)) {
		return;
	}
	var baseFiles = fs.readdirSync(basePath);
	var fileFilter = function (file) {
		return file.endsWith('.js') || file.endsWith('.leafdoc');
	};
	// some files are in the root
	baseFiles.filter(fileFilter).forEach(function (file) {
		includes.push(basePath + '/' + file);
	});
	// some are in a sub directory 'js'
	baseFiles.forEach(function (dir) {
		if (dir !== 'js') {
			return;
		}
		fs.readdirSync(basePath + '/' + dir).filter(fileFilter).forEach(function (file) {
			includes.push(basePath + '/js/' + file);
		});
	});
});

// create leafdoc
var doc = new LeafDoc({
		templateDir: 'src/api-doc/templates',
		showInheritancesWhenEmpty: true,
		leadingCharacter: '@',
		verbose: true
	});
// add custom handlebar templates & helpers
doc.getTemplateEngine().registerPartial('menu', fs.readFileSync('src/api-doc/menu.hbs', FILE_ENCODING));
doc.getTemplateEngine().registerPartial('menuItem', fs.readFileSync('src/api-doc/menuItem.hbs', FILE_ENCODING));
doc.getTemplateEngine().registerPartial('menuItemList', fs.readFileSync('src/api-doc/menuItemList.hbs', FILE_ENCODING));
doc.getTemplateEngine().registerHelper('menuItemHelper', function (contentId) {
	// 1. load the content we want to show from file
	var content = JSON.parse(fs.readFileSync('src/api-doc/' + contentId + '.json', FILE_ENCODING));
	// 2. create the template
	var template = Handlebars.compile('{{> menuItemList}}', {
			noEscape: true
		});
	// 3. generate the HTML with the content
	return new Handlebars.SafeString(template({
			content: content
		}));
});
doc.getTemplateEngine().registerPartial('backtotop', fs.readFileSync('src/api-doc/templates/backtotop.hbs', FILE_ENCODING));
// add custom documentables
doc.registerDocumentable('synchronization', 'Process synchronization', false);
doc.registerDocumentable('component', 'List of components', false);
doc.registerDocumentable('input', 'Input slots', true);
doc.registerDocumentable('output', 'Output slots', true);
doc.registerDocumentable('slotOption', 'Slot options', true);
// add global leafdoc files
var globalLeafdocFiles = fs.readdirSync('src/api-doc/').filter(function (file) {
		return file.endsWith('.leafdoc') && file !== 'docs-index.leafdoc';
	});
// add doc index first
doc.addFile('src/api-doc/docs-index.leafdoc', false);
globalLeafdocFiles.forEach(function (e) {
	doc.addFile('src/api-doc/' + e, false);
});

// add all included files
includes.forEach(function (e) {
	// second param must be true if 'e' is a source code file aka '.js' file
	doc.addFile(e, e.endsWith('.js'));
});

// write dist folder
deleteFolderRecursive('dist');
fs.mkdirSync('dist');
fs.writeFile('dist/api-doc.html', doc.outputStr(), function (err) {
	if (err) {
		console.log(err);
		return;
	}
	// copy content
	fs.mkdirSync('dist/css');
	fs.mkdirSync('dist/image');
	fs.copyFileSync('src/css/main.css', 'dist/css/main.css');
	fs.copyFileSync('src/image/benefits.png', 'dist/image/benefits.png');
	fs.copyFileSync('src/image/flowOfODIN.png', 'dist/image/flowOfODIN.png');
	fs.copyFileSync('src/image/usage.png', 'dist/image/usage.png');
	fs.copyFileSync('src/image/workOfOdinComponents.png', 'dist/image/workOfOdinComponents.png');
	fs.copyFileSync('src/index.html', 'dist/index.html');
	fs.copyFileSync('src/getting-started.html', 'dist/getting-started.html');
	console.log('dist folder created.');
	if (!copyFiles) {
		return;
	}
	// copy the files from dist to the docs folder
	copyFolder('dist', '../docs');
});

// from https://geedew.com/remove-a-directory-that-is-not-empty-in-nodejs/
function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file, index) {
			var curPath = path + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};

function copyFolder(from, to) {
	if (fs.existsSync(from)) {
		deleteFolderRecursive(to);
		fs.mkdirSync(to);
		fs.readdirSync(from).forEach(function (file) {
			var curPath = from + '/' + file;
			var toPath = to + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				copyFolder(curPath, toPath);
			} else {
				fs.copyFileSync(curPath, toPath);
			}
		});
	}
};
