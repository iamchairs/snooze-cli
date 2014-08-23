#! /usr/bin/env node

var snooze;
var fs = require('fs');
var colors = require('colors');
var _ = require('lodash');
var program = require('commander');
var prompt = require('prompt');
var UT = require('../lib/SnoozeUnitTester');
var UnitTester = null;

var _conf = {};
var _params = {};

process.setMaxListeners(0);

// Loading exceptions

var files = fs.readdirSync(__dirname + '/../lib/exceptions');
for(var i = 0; i < files.length; i++) {
	var file = files[i];
	var nm = file.replace('.js', '');

	eval(nm + " = require(__dirname + '/../lib/exceptions/' + files[i]);");
}

var loadSnooze = function() {
	snooze = require(process.cwd() + '/node_modules/snooze');
	UnitTester = new UT(snooze);
};

var initFatal = function() {
	snooze.onfatal(function(err) {
		console.error('Snooze Fatal Error:'.red);
		if(err) {
			if(err.stack) {
				console.error(err.stack);
			} else if(err.name && err.message) {
				console.error(err.name + ': ' + err.message);
			} else {
				console.error(err);
			}
		} else {
			console.error(new Error('unkown runtime exception').stack);
		}

		process.exit(1);
	});
};

var start = function(startOptions) {
	var config = snooze.getConfig();

	if(config.main !== undefined) {
		var main = config.main;
		if(fs.existsSync(process.cwd() + '/' + main)) {
			require(process.cwd() + '/' + main);

			if(startOptions === undefined) {
				startOptions = {
					silent: false
				};

				var mode = config.mode;
				if(mode === undefined) {
					snooze.fatal(new NoDefaultModeException());
				} else {
					startOptions.mode = mode;
				}
			}
		
			if(snooze.module(config.name).isAwake()) {
				snooze.fatal(new StartConflictException());
			} else {
				snooze.module(config.name).wakeup(startOptions);
			}
		} else {
			snooze.fatal(new MainNotFoundException(main));
		}

	} else {
		snooze.fatal(new NoMainDefinedException());
	}
};

var _normalizeOptions = function(options) {
	var normalizedObj = {};
	var parent = options;
	while(parent !== undefined) {
		var _options = parent.options;
		for(var i = 0; i < _options.length; i++) {
			var _option = _options[i];
			var re = /[<\[](.*)[>\]]/;
			var matches = re.exec(_option.flags);
			if(matches !== null) {
				var prop = matches[1];
			} else {
				parts = _option.flags.split(', ');
				for(var k = 0; k < parts.length; k++) {
					var part = parts[k];
					if(part.substr(0, 2) === '--') {
						var prop = part.substr(2);
					} else {
						var prop = part.substr(1).toUpperCase;
					}
				}
			}

			if(parent[prop] !== undefined) {
				normalizedObj[prop] = parent[prop];
			}
		}

		parent = parent.parent;
	}

	return normalizedObj;
};

var getRealModule = function(module) {
	if(module === undefined) {
		if(snooze.getConfig().name !== undefined) {
			return snooze.getConfig().name;
		} else {
			snooze.fatal(new NoModuleDefinedException());
		}
	} else {
		if(snooze.moduleExists(module) === true) {
			return module;
		} else {
			snooze.fatal(new ModuleNotFoundException());
		}
	}
};

var printRoutes = function(options) {
	var prepend = '';

	var module = getRealModule(options.module);
	if(options.routes) {
		var routes = options.routes;
	} else {
		var routes = snooze.module(module).getRoutes(options.type);
	}

	if(options.prepend) {
		prepend = options.prepend;
	}

	routes = _.sortBy(routes, function(route) {
		return route.getMethod();
	});

	_.each(routes, function(route) {
		var out = prepend + route.getMethod().toUpperCase() + ' => ' + route.getPath();

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

var printControllers = function(options) {
	var module = getRealModule(options.module);
	var controllers = snooze.module(module).getControllers();

	controllers = _.sortBy(controllers, function(ctrl) {
		return ctrl.getName();
	});

	var routes = snooze.module(module).getRoutes();
	var services = snooze.module(module).getServices();
	var dtos = snooze.module(module).getDTOs();

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
			printRoutes({routes: ctrlRoutes, prepend: '\t'});
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

var printServices = function(options) {
	var module = getRealModule(options.module);
	var services = snooze.module(module).getDTOs();

	services = _.sortBy(services, function(srv) {
		return srv.getName();
	});

	var services = snooze.module(module).getServices();
	var dtos = snooze.module(module).getDTOs();

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

var printValidators = function(options) {
	var module = getRealModule(options.module);
	var validators = snooze.module(module).getValidators();

	validators = _.sortBy(validators, function(vd) {
		return vd.getName();
	});

	var services = snooze.module(module).getServices();
	var dtos = snooze.module(module).getDTOs();

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

var printDTOs = function(options) {
	var module = getRealModule(options.module);
	var dtos = snooze.module(module).getDTOs();

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

var getValidatorErrors = function(module, response, validators) {
	_.each(validators, function(vd) {
		if(typeof vd === 'object' && vd.length !== undefined) {
			getValidatorErrors(module, response, vd)
		} else if (vd !== undefined && vd !== 'OR') {
			var validator = snooze.module(module).getValidator(vd);
			if(validator !== undefined) {
				var errors = validator.getErrors();
				for(var code in errors) {
					response[code] = errors[code];
				}
			}
		}
	});
};

var generateAPI = function(options) {
	var module = getRealModule(options.module);

	if(fs.existsSync(process.cwd() + '/api') === false) {
		fs.mkdirSync(process.cwd() + '/api');
	}

	var api = {
		module: module,
		modules: [],
		routes: [],
		services: [],
		controllers: [],
		validators: [],
		dtos: []
	};

	var routes = snooze.module(module).getRoutes();
	_.each(routes, function(route) {
		var response = route.getResponse();
		var validators = route.getValidators();

		getValidatorErrors(module, response, validators);

		var rt = {
			description: route.getDescription(),
			method: route.getMethod(),
			path: route.getPath(),
			response: response,
			request: route.getRequest()
		};

		api.routes.push(rt);
	});

	var dtos = snooze.module(module).getDTOs();
	_.each(dtos, function(dto) {
		var dto = {
			name: dto.getName(),
			properties: dto.getProperties(),
			strict: dto.isStrict()
		};

		api.dtos.push(dto);
	});

	fs.writeFileSync(process.cwd() + '/api/' + module + '.api.json', JSON.stringify(api, null, 2));
};

var sync = function(options) {
	var config = snooze.getConfig();
	var module = getRealModule(options.module);
	var $conn = snooze.module(module).getService('$conn');
	var force = false;
	var toSync = 0;
	var synced = 0;

	var tryFinish = function() {
		if(toSync === synced) {
			process.exit(0);
		}
	}

	var _finish = function() {
		if($conn !== undefined) {
			$conn.$get().sync({force: force}).then(function(x) {
				console.log('sync finished');
				synced++;
				tryFinish();
			}).error(function(err) {
				console.log('sync err');
				console.log(err);
				synced++;
				tryFinish();
			});
		} else {
			snooze.fatal(new SequelizeNotFoundException());
		}
	}
	
	// TODO Add Prompt Here

	if(options.F === true || options.force === true) {
		force = true;
	}

	var connections = config.db.connections;
	for(var connNm in connections) {
		var connection = connections[connNm];

		var mode = connection.mode;
		$conn.connect(mode);

		console.log('synchronizing ' + connNm);
		toSync++;

		snooze.module(module).EntityManager.compileDAOs();
		snooze.module(module).EntityManager.associateDAOs();

		_finish();
	}
};

var env = function(options) {
	var module = getRealModule(options.module);
	var $conn = snooze.module(module).getService('$conn');

	if($conn !== undefined) {
		var conf = snooze.getConfig();
		
		if(conf.db !== undefined) {
			for(var connection in conf.db.connections) {
				var con = conf.db.connections[connection];

				console.log(connection.yellow)
				console.log('\tengine: ' + con.engine);
				console.log('\thost: ' + con.host);
				console.log('\tuser: ' + con.user);
				console.log('\tdb: ' + con.database);
				console.log('\n');
			}

			console.log('Main (default): ' + conf.main);
			console.log('Dev: ' + conf.dev);
		} else {
			snooze.fatal(new DBNotDefinedException());
		}
	} else {
		snooze.fatal(new SequelizeNotFoundException());
	}
};

var init = function(options) {
	prompt.get([
	{
		name: 'module',
		description: 'Module Name',     // Prompt displayed to the user. If not supplied name will be used.
		type: 'string',                 // Specify the type of input to expect.
		pattern: /^\w+$/,                  // Regular expression that input must be valid against.
		message: 'Password must be letters', // Warning message to display if validation fails.
		default: 'MyApp',             // Default value to use if no value is entered.
		required: true                        // If true, value entered must be non-empty.
	}], function(err, result) {
		var template = {modname: result.module};

		initDirectories();
		initJSON(template);
		initMain(template);
		initRoutes(template);
	});
};

var initDirectories = function(options) {
	var directories = ['controllers', 'services', 'validators', 'dtos', 'daos', 'routes', 'assets', 'api', 'tests', 'tests/unit', 'tests/unit/mock'];
	for(var i = 0; i < directories.length; i++) {
		var directory = directories[i];
		if(fs.existsSync(process.cwd() + '/' + directory) === false) {
			fs.mkdirSync(process.cwd() + '/' + directory)
		}
	}
};

var initMain = function(template) {
	var finish = function(template) {
		if(!fs.existsSync(__dirname + '/../tpl/main.js.tpl')) {
			snooze.fatal(new TemplateNotFoundException('main.js.tpl'));
		} else {
			var main = fs.readFileSync(__dirname + '/../tpl/main.js.tpl', 'utf8');
			var compiled = _.template(main, template);
			fs.writeFileSync(process.cwd() + '/main.js', compiled);
		}
	};

	if(template === undefined) {
		prompt.get([
		{
			name: 'module',
			description: 'Module Name',     // Prompt displayed to the user. If not supplied name will be used.
			type: 'string',                 // Specify the type of input to expect.
			pattern: /^\w+$/,                  // Regular expression that input must be valid against.
			message: 'Password must be letters', // Warning message to display if validation fails.
			default: 'MyApp',             // Default value to use if no value is entered.
			required: true                        // If true, value entered must be non-empty.
		}], function(err, result) {
			finish({modnam: result.module});
		});
	} else {
		finish(template);
	}
};

var initRoutes = function(template) {
	var finish = function(template) {
		if(!fs.existsSync(__dirname + '/../tpl/Assets.js.tpl')) {
			snooze.fatal(new TemplateNotFoundException('Assets.js.tpl'));
		} else {
			var main = fs.readFileSync(__dirname + '/../tpl/Assets.js.tpl', 'utf8');
			var compiled = _.template(main, template);
			fs.writeFileSync(process.cwd() + '/routes/Assets.js', compiled);
		}
	};

	if(template === undefined) {
		prompt.get([
		{
			name: 'module',
			description: 'Module Name',     // Prompt displayed to the user. If not supplied name will be used.
			type: 'string',                 // Specify the type of input to expect.
			pattern: /^\w+$/,                  // Regular expression that input must be valid against.
			message: 'Password must be letters', // Warning message to display if validation fails.
			default: 'MyApp',             // Default value to use if no value is entered.
			required: true                        // If true, value entered must be non-empty.
		}], function(err, result) {
			finish({modnam: result.module});
		});
	} else {
		finish(template);
	}
};

var initJSON = function(template) {
	var finish = function(template) {
		if(!fs.existsSync(__dirname + '/../tpl/snooze.json.tpl')) {
			snooze.fatal(new TemplateNotFoundException('snooze.json.tpl'));
		} else {
			var main = fs.readFileSync(__dirname + '/../tpl/snooze.json.tpl', 'utf8');
			var compiled = _.template(main, template);
			fs.writeFileSync(process.cwd() + '/snooze.json', compiled);
		}
	};

	if(template === undefined) {
		prompt.get([
		{
			name: 'module',
			description: 'Module Name',     // Prompt displayed to the user. If not supplied name will be used.
			type: 'string',                 // Specify the type of input to expect.
			pattern: /^\w+$/,                  // Regular expression that input must be valid against.
			message: 'Password must be letters', // Warning message to display if validation fails.
			default: 'MyApp',             // Default value to use if no value is entered.
			required: true                        // If true, value entered must be non-empty.
		}], function(err, result) {
			finish({modnam: result.module});
		});
	} else {
		finish(template);
	}
};

var runUnitTests = function() {
	var config = snooze.getConfig();

	UnitTester.setConfig(config);
	UnitTester.start().then(function() {
		var _numTests = UnitTester.getNumTests();
		var _passedTests = UnitTester.getNumPassedTests();

		console.log('');
		console.log('(' + _passedTests + ' of ' + _numTests + ') tests passed.');

		process.exit(0);
	});
};

var runIntegrationTests = function() {

};

program
	.version('0.0.3')
	.option('-m, --module <module>', 'Set the module');

program
	.command('routes')
	.description('Lists the routes in the snooze application.')
	.option('-t, --type <type>', 'GET, POST, PUT, DELETE, RESOURCE')
	.action(function(options) {
		loadSnooze();
		start({silent: true});
		printRoutes(_normalizeOptions(options));
		process.exit(0);
	});

program
	.command('controllers')
	.description('Lists the controllers in the snooze application, their injectables, and routes that point to them.')
	.action(function(options) {
		loadSnooze();
		start({silent: true});
		printControllers(_normalizeOptions(options));
		process.exit(0);
	});

program
	.command('services')
	.description('Lists the services in the snooze application and their injectables.')
	.action(function(options) {
		loadSnooze();
		start({silent: true});
		printServices(_normalizeOptions(options));
		process.exit(0);
	});

program
	.command('dtos')
	.description('Lists the dtos in the snooze application, their injectables, and properties.')
	.action(function(options) {
		loadSnooze();
		start({silent: true});
		printDTOs(_normalizeOptions(options));
		process.exit(0);
	});

program
	.command('validators')
	.description('Lists the validators in the snooze application and their injectables.')
	.action(function(options) {
		loadSnooze();
		start({silent: true});
		printValidators(_normalizeOptions(options));
		process.exit(0);
	});

program
	.command('api')
	.description('Generates a [module].api.json API File in the api directory.')
	.action(function(options) {
		loadSnooze();
		start({silent: true});
		generateAPI(_normalizeOptions(options));
		process.exit(0);
	});

program
	.command('db')
	.description('Database management using Sequelize. snooze-stb requiried.')
	.option('-s, --sync', 'Sync. Synchronize local models to remove database.')
	.option('-f, --force', 'Forces sync. Warning: This drops tables and recreates them.')
	.option('-e, --env', 'View Available Environments')
	.action(function(options) {
		loadSnooze();
		start({silent: true});
		options = _normalizeOptions(options);

		if(options.sync === true) {
			sync(options);
		} else if(options.env === true) {
			env(options);
		}
	});

program
	.command('init')
	.description('initializes the current directory with a snooze project including main.js file and snooze.json')
	.option('-d', '--directories', 'Only initialize directories')
	.option('-m', '--main', 'Only initialize the main.js file')
	.option('-j', '--json', 'Only initialize the snooze.json file')
	.option('-r', '--routes', 'Only initialize routes (default asset routes)')
	.action(function(options) {
		options = _normalizeOptions(options);

		if(options.directories === true) {
			initDirectories(options);
		} else if(options.main === true) {
			initMain(options);
		} else if(options.json === true) {
			initJSON(options);
		} else if(options.routes === true) {
			initRoutes(options);
		} else {
			init(options);
		}
	});

program
	.command('start')
	.description('starts your snooze application')
	.option('-s', '--silent', 'starts your snooze application silently without load information')
	.option('-M', '--mode', 'starts your snooze application in a mode. defaults to snooze.json mode. options are `test`, `development`, and `production`.' )
	.action(function(options) {
		options = _normalizeOptions(options);
		
		loadSnooze();
		initFatal();

		var startOptions = {
			silent: false
		};

		if(options.silent) {
			startOptions.silent = true;
		}

		if(!options.mode) {
			startOptions.mode = snooze.getConfig().mode;
		}

		start(startOptions);
	});

program
	.command('test')
	.description('run unit and integration tests')
	.option('-u', '--unit', 'only run unit tests')
	.option('-i', '--integration', 'only run integration tests')
	.action(function(options) {
		options = _normalizeOptions(options);
		
		loadSnooze();
		initFatal();

		var startOptions = {
			silent: true,
			mode: 'development'
		};

		var config = snooze.getConfig();
		if(config.unitTesting && config.unitTesting.mode) {
			startOptions.mode = config.unitTesting.mode;
		}

		start(startOptions);

		if(options.integration === true && options.unit === undefined) {
			runIntegrationTests();
		} else if(options.unit === true && options.integration === undefined) {
			runUnitTests();
		} else {
			runUnitTests();
			runIntegrationTests();
		}
	});

program
	.command('*')
	.action(function(options) {
		loadSnooze();
		snooze.fatal(new UnknownCommandException(options));
	});

program
	.parse(process.argv);
