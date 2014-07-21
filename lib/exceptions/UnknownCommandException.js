module.exports = function(command) {
	this.name = 'UnknownCommandException';
	this.message = 'Unknown Command: ' + command;
};