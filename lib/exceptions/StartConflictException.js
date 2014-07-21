module.exports = function() {
	this.name = 'StartConflictException';
	this.message = 'Snooze application was already started.\
Be sure your main file does not use the wakeup() command.\
The Application should be started using the snooze-cli `snooze start` command.'
};