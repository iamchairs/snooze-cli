module.exports = function(path) {
	this.name = 'NoUnitTestDirectoryFoundException';
	this.message = 'No unit tests directory was found. Place your unit tests in ' + path + ' from your base server directory. ';
};