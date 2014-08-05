var fs = require('fs');
var _ = require('lodash');
var q = require('q');

var files = fs.readdirSync(__dirname + '/exceptions');
for(var i = 0; i < files.length; i++) {
	var file = files[i];
	var nm = file.replace('.js', '');

	eval(nm + " = require(__dirname + '/exceptions/' + files[i]);");
}

var _new = function(snooze, mode) {
	var _config = null;
	var _path = '';
	var _files = [];
	var _unitTests = [];
	var _defer = q.defer();
	var _numTests = 0;
	var _passedTests = 0;

	var _loadBaseMocks = function() {

	};

	var _clearMocks = function() {
		snooze.module(_config.name).MockEntityManager.clearEntities();
	};

	var _clearUnits = function() {
		snooze.module(_config.name).getUnitTests().splice(0);
	};

	var _runNextFile = function() {
		_unitTests.splice(0);
		_clearMocks();
		_loadBaseMocks();
		_clearUnits();

		var file = _files.shift();

		if(file) {
			snooze.onfatal(function(err) {
				if(err.stack) {
					console.err(err.stack);
				} else {
					console.error(err.name + ': ' + err.message);
				}
				
				process.exit(0);
			});

			require(_path + file);
			
			var unitTests = snooze.module(_config.name).getUnitTests();
			_.each(unitTests, function(unitTest) {
				_unitTests.push(unitTest);
			});

			snooze.module(_config.name).EntityManager.compile();
			snooze.module(_config.name).MockEntityManager.compile();
			
			_runNextUnitTest();
		} else {
			_defer.resolve();
		}
	};

	var _runNextUnitTest = function() {
		unitTest = _unitTests.shift();
		if(unitTest) {
			unitTest.test().then(function() {
				_numTests += unitTest.getNumTests();
				_passedTests += unitTest.getNumPassedTests();

				_runNextUnitTest();
			});
		} else {
			_runNextFile();
		}
	};

	this.setConfig = function(cfg) {
		_config = cfg;

		if(cfg.unitTesting) {
			if(cfg.unitTesting.path) {
				_path = process.cwd() + '/' + cfg.unitTesting.path;
				if(_path[_path.length-1] !== '/') {
					_path =  + _path + '/';
				}
			} else {
				throw new NoUnitTestingPathDefinedException();
			}
		} else {
			throw new NoUnitTestingConfigException();
		}
	};

	this.start = function() {
		if(fs.existsSync(_path)) {
			_files = fs.readdirSync(_path);
			_runNextFile();
		} else {
			throw new NoUnitTestDirectoryFoundException(_path);
		}

		return _defer.promise;
	};

	this.getNumTests = function() {
		return _numTests;
	};

	this.getNumPassedTests = function() {
		return _passedTests;
	};
};

module.exports = _new;