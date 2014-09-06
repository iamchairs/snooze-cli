var snooze = require('snooze');

snooze.module('<%= modname %>').dto('Test', {
	'message': {
		type: 'string',
		example: 'Hello World!',
		required: true
	},
	__methods: {
		fromString: function() {
			return function(str) {
				return {
					message: str
				};
			};
		}
	}
});