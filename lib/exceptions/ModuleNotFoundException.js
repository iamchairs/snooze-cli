module.exports = function(module) {
	this.name = 'ModuleNotFoundException';
	this.message = 'module `' + module + '` not found.';
};