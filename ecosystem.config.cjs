module.exports = {
	apps: [
		{
			name: "Bald-Eagle-bot",
            script: "./dist/index.js",
			interpreter_args: "--env-file=.env",
		}
	]
}