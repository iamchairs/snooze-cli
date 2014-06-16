#! /usr/bin/env node

var fs = require('fs');
var colors = require('colors');
var snooze = require(process.cwd() + '/node_modules/snooze');
var _ = require('lodash');
var modname;

var _fatal = function(str) {
	console.log(str.red);
	process.exit(1);
};

var printRoutes = function(routes, options) {
	routes = _.sortBy(routes, function(route) {
		return route.getMethod();
	});

	_.each(routes, function(route) {
		var out = route.getMethod().toUpperCase() + ' => ' + route.getPath();

		if(options === undefined) {
			options = {};
		}

		if(options.prepend) {
			out = options.prepend + out;
		}

		switch(route.getMethod()) {
			case 'get':
				console.log(out.green);
				break;
			case 'post':
				console.log(out.blue);
				break;
			case 'put':
				console.log(out.yellow);
				break;
			case 'delete':
				console.log(out.red);
				break;
			case 'resource':
				console.log(out.cyan);
				break;
		}
	});
};

var printControllers = function(controllers) {
	controllers = _.sortBy(controllers, function(ctrl) {
		return ctrl.getName();
	});

	var routes = snooze.module(modname).getRoutes();
	var services = snooze.module(modname).getServices();
	var dtos = snooze.module(modname).getDTOs();

	_.each(controllers, function(ctrl) {
		console.log(ctrl.getName().green);

		var ctrlRoutes = [];
		var ctrlServices = ctrl.__getServices();
		var ctrlDTOs = ctrl.__getDTOs();

		_.each(routes, function(rt) {
			if(rt.getController() === ctrl.getName()) {
				ctrlRoutes.push(rt);
			}
		});

		if(ctrlRoutes.length > 0) {
			console.log('\t@Routes');
			printRoutes(ctrlRoutes, {prepend: '\t'});
		}

		if(ctrlServices.length > 0) {
			console.log('\t@Services');
			_.each(ctrlServices, function(srv) {
				console.log(('\t'+srv).yellow);
			});
		}

		if(ctrlDTOs.length > 0) {
			console.log('\t@DTOs');
			_.each(ctrlDTOs, function(dto) {
				console.log(('\t'+dto).yellow);
			});
		}
	});
};

var printServices = function(services) {
	services = _.sortBy(services, function(srv) {
		return srv.getName();
	});

	var services = snooze.module(modname).getServices();
	var dtos = snooze.module(modname).getDTOs();

	_.each(services, function(srv) {
		console.log(srv.getName().green);

		var srvServices = srv.__getServices();
		var srvDTOs = srv.__getDTOs();

		if(srvServices.length > 0) {
			console.log('\t@Services');
			_.each(srvServices, function(s) {
				console.log(('\t'+s).yellow);
			});
		}

		if(srvDTOs.length > 0) {
			console.log('\t@DTOs');
			_.each(srvDTOs, function(dto) {
				console.log(('\t'+dto).yellow);
			});
		}
	});
};

var printValidators = function(validators) {
	validators = _.sortBy(validators, function(vd) {
		return vd.getName();
	});

	var services = snooze.module(modname).getServices();
	var dtos = snooze.module(modname).getDTOs();

	_.each(validators, function(vd) {
		console.log(vd.getName().green);

		var vdServices = vd.__getServices();
		var vdDTOs = vd.__getDTOs();

		if(vdServices.length > 0) {
			console.log('\t@Services');
			_.each(vdServices, function(srv) {
				console.log(('\t'+srv).yellow);
			});
		}

		if(vdDTOs.length > 0) {
			console.log('\t@DTOs');
			_.each(vdDTOs, function(dto) {
				console.log(('\t'+dto).yellow);
			});
		}
	});
};

var printDTOs = function(dtos) {
	_.each(dtos, function(dto) {
		console.log(dto.getName().green);

		var dtoServices = dto.__getServices();
		var dtoDTOs = dto.__getDTOs();

		if(dtoServices.length > 0) {
			console.log('\t@Services');
			_.each(dtoServices, function(srv) {
				console.log(('\t'+srv).yellow);
			});
		}

		if(dtoDTOs.length > 0) {
			console.log('\t@DTOs');
			_.each(dtoDTOs, function(dto) {
				console.log(('\t'+dto).yellow);
			});
		}

		for(var key in dto.__json) {
			if(key !== '__methods') {
				var param = dto.__json[key];
				console.log(('\t- '+key).yellow);

				if(param.type !== undefined) {
					console.log('\t\tType: '+param.type);
				}

				if(param.default !== undefined) {
					console.log('\t\tDefault: '+param.default);
				}

				if(param.description !== undefined) {
					console.log('\t\tDescription: '+param.description);
				}

				if(param.example !== undefined) {
					console.log('\t\tExample: '+param.example);
				}
			}
		};
	});
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
	if(fs.existsSync(process.cwd() + '/node_modules/snooze/tpl/main.js.tpl')) {
		_fatal('Snooze not found in node_modules. Be sure to run npm `install snooze -g`')
		var main = fs.readFileSync(process.cwd() + '/node_modules/snooze/tpl/main.js.tpl');
		console.log(main);
	}
};

var methods = {
	'controllers': function() {
		printControllers(snooze.module(modname).getControllers());
	},
	'services': function() {
		printServices(snooze.module(modname).getServices());
	},
	'validators': function() {
		printValidators(snooze.module(modname).getValidators());
	},
	'dtos': function() {
		printDTOs(snooze.module(modname).getDTOs());
	},
	'routes.get': function() {
		printRoutes(snooze.module(modname).getRoutes('get'));
	},
	'routes.post': function() {
		printRoutes(snooze.module(modname).getRoutes('post'));
	},
	'routes.put': function() {
		printRoutes(snooze.module(modname).getRoutes('put'));
	},
	'routes.delete': function() {
		printRoutes(snooze.module(modname).getRoutes('delete'));
	},
	'routes.resource': function() {
		printRoutes(snooze.module(modname).getRoutes('resource'));
	},
	'routes': function() {
		printRoutes(snooze.module(modname).getRoutes());
	},
	'help': function() {
		console.log('snooze Help Page'.red);
		console.log();
		console.log('=== Commands ==='.green);
		console.log();

		for(var flag in flags) {
			var flagData = flags[flag];
			var parameters = flagData.methods;
			var paramStr = '';

			var keys = _.without(Object.keys(parameters), $end);
			if(parameters.$end !== undefined) {
				delete keys.$end;
			}

			if(keys.length > 0) {
				paramStr = ' [' + keys.join(', ') + ']';
			}

			console.log(('\tsnooze [module] ' + flag + paramStr).yellow);
			//console.log(('\tAliases: ' + flagData.aliases.join(', ')).yellow);
			console.log('\t-' + flagData.description);
			console.log();
		}
	},
	'api': function() {
		if(fs.existsSync(process.cwd() + '/api') === false) {
			fs.mkdirSync(process.cwd() + '/api');
		}

		var api = {
			module: modname,
			modules: [],
			routes: [],
			services: [],
			controllers: [],
			validators: [],
			dtos: []
		};

		var routes = snooze.module(modname).getRoutes();
		_.each(routes, function(route) {
			var rt = {
				method: route.getMethod(),
				path: route.getPath(),
				response: route.getResponse(),
				request: route.getRequest()
			};

			api.routes.push(rt);
		});

		var dtos = snooze.module(modname).getDTOs();
		_.each(dtos, function(dto) {
			var dto = {
				name: dto.getName(),
				properties: dto.getProperties(),
				strict: dto.isStrict()
			};

			api.dtos.push(dto);
		});

		fs.writeFileSync(process.cwd() + '/api/' + modname + '.api.json', JSON.stringify(api, null, 2));
	},
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
var flags = {
	'help': {
		methods: {
			$end: 'help'
		},
		aliases: ['-h', '--help'],
		description: 'Display the command line help page.'
	},
	'-r': {
		methods: {
			'get': 'routes.get',
			'post': 'routes.post',
			'put':  'routes.put',
			'delete': 'routes.delete',
			'resource': 'routes.resource',
			$end: 'routes'
		},
		aliases: ['--routes'],
		description: 'Lists the routes in the snooze application.'
	},
	'-c': {
		methods: {
			$end: 'controllers'
		},
		description: 'Lists the controllers in the snooze application, their injectables, and routes that point to them.',
		aliases: ['--controllers']
	},
	'-s': {
		methods: {
			$end: 'services'
		},
		aliases: ['--services'],
		description: 'Lists the services in the snooze application and their injectables.'
	},
	'-d': {
		methods: {
			$end: 'dtos'
		},
		aliases: ['--dtos'],
		description: 'Lists the dtos in the snooze application, their injectables, and properties.'
	},
	'-v': {
		methods: {
			$end: 'validators'
		},
		aliases: ['--validators'],
		description: 'Lists the validators in the snooze application and their injectables.'
	},
	'api': {
		methods: {
			$end: 'api'
		},
		description: 'Generates a [module].api.json API File in the api directory.'
	}/*,
	'init': {
		methods: {
			HelloWorld: 'init.helloworld',
			$end: 'init'
		},
		description: 'Initializes a new flint module with empty directories and a main.js file.'
	}*/
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

if(fs.existsSync('./main.js')) {
	var modname = process.argv[2];
	var args = process.argv.splice(3);

	var hand = console.log;
	console.log = function() {};

	require(process.cwd() + '/main.js');

	if(snooze.moduleExists(modname)) {
		console.log = hand;

		if(args.length < 1) {
			args.push('help');
		}

		// running params

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

		// End the server

		process.exit(0);

	} else {
		console.log = hand;
		if(modname === undefined) {
			_fatal('Use: snooze [module] help');
		} else {
			_fatal('Module ' + modname + ' doesn\'t exist');
		}
	}
} else {
	_fatal('Unable to find server\'s main.js file in the current directory.');
}
