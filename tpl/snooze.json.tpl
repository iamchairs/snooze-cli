{
	"main": "main.js",
	"name": "<%=modname %>",
	"mode": "development",
	"db": {
		"main": "production",
		"dev": "development",
		"connections": {
			"development": {
				"engine": "mysql",
				"host": "localhost",
				"user": "admin",
				"password": "password",
				"database": "db",
				"logging": true
			},
			"production": {
				"engine": "mysql",
				"host": "localhost",
				"user": "admin",
				"password": "password",
				"database": "db"
			}
		}
	}
}
