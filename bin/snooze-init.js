#! /usr/bin/env node

var fs = require('fs');
var colors = require('colors');
var _ = require('lodash');
var modname;

var _fatal = function(str) {
	console.log(str.red);
	process.exit(1);
};

var _initDirectories = function() {
	var directories = ['controllers', 'services', 'validators', 'dtos', 'routes', 'assets', 'api'];
	for(var i = 0; i < directories.length; i++) {
		var directory = directories[i];
		if(fs.existsSync(process.cwd() + '/' + directory) === false) {
			fs.mkdirSync(process.cwd() + '/' + directory)
		}
	}
};

var _initMain = function() {
	if(!fs.existsSync(__dirname + '/../tpl/main.js.tpl')) {
		_fatal('Couldn\'t find main.js.tpl');
	} else {
		var main = fs.readFileSync(__dirname + '/../tpl/main.js.tpl', 'utf8');
		console.log(main);
	}
};

var methods = {
	'init': function() {
		_initDirectories();
		_initMain();
	},
	'init.helloworld': function() {
		_initDirectories();
		_initHelloWorld();
	}
};

$end = '$end';
$default = '$default';
var flags = {
	'help': {
		methods: {
			$end: 'help'
		},
		aliases: ['-h', '--help'],
		description: 'Display the command line help page.'
	},
	$end: {
		parameters: ['modname'],
		methods: {
			$end: 'init'
		},
		description: 'Initializes a new flint module with empty directories and a main.js file.'
	},
	$default: {}
};

var runFlag = function(flag) {
	if(flags(flag)) {

	}
};

var flagHasMethod = function(flag, method) {
	if(flags[flag].methods[method] !== undefined) {
		return true;
	};
	return false;
};

var runFlagMethod = function(flag, method) {
	var method = flags[flag].methods[method];
	methods[method]();
};

var args = process.argv.splice(2);

if(args.length > 0) {
	for(var i = 0; i < args.length; i++) {
		var argStack = [];
		var flag = args[i];
		if(flags[flag]) {
			argStack.push(flag);
			var argStackReached = false;
			var k = i+1;

			if(args.length > k) {
				var stackVal = args[k];
				if(flagHasMethod(flag, stackVal)) {
					runFlagMethod(flag, stackVal);
					i++;
				} else {
					if(flagHasMethod(flag, $end)) {
						runFlagMethod(flag, $end);
					} else {
						_fatal('Flag ' + flag + ' doesn\'t support uknown parameter ' + stackVal);
					}
				}
			} else {
				if(flagHasMethod(flag, $end)) {
					runFlagMethod(flag, $end);
				} else {
					_fatal('Flag ' + flag + ' expects additional parameters.');
				}
			}

		} else {
			_fatal('Unknown flag : ' + args[i]);
		}
	}
} else {

	if(flagHasMethod($end, $end)) {
		runFlagMethod($end, $end);
	} else {
		_fatal('Flag ' + flag + ' expects additional parameters.');
	}

}

// End the server

process.exit(0);
