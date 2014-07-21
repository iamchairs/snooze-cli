module.exports = function(tpl) {
	this.name = 'TemplateNotFoundException';
	this.message = 'Template ' + tpl + ' not found at [snooze-cli root]/tpl/' + tpl;
};