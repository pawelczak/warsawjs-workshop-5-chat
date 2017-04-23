const io = require('socket.io-client');
const readline = require('readline');
const os = require('os');
const socket = io('http://localhost:3001');

class Client {

	constructor() {
		this.token;
		this.cli;
		this.userName = process.argv[2] || '';
	}

	init() {

		socket.on('hello', (message) => this.writeLine({line: message}));

		socket.on('messageClient', (message) => {
			this.writeLine(message)
		});


		socket.on('newUser', (message) => {
			this.writeLine({line: `New user "${message.userName}" has joined the channel.`})
		});

		socket.on('register', (response) => {
			if (response) {
				console.log('Registration successful');
			} else {
				console.log('Registration fail');
			}
		});

		socket.on('login', (response) => {
			if (response) {
				console.log('Login successful');
				this.token = response.token;
				this.userName = response.userName;

				cli.setPrompt(this.userName + '> ');
				cli.prompt();
			} else {
				console.log('Login fail');
			}
		});

		const cli = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		this.cli = cli;

		cli.setPrompt('> ');
		cli.prompt();

		cli.on('line', (line) => {
			socket.emit('message', {
				line: line,
				token: this.token,
				userName: this.userName
			});
			cli.setPrompt(this.userName + '> ');
			cli.prompt();
		});

	}

	writeLine(message) {
		// process.stdout.clearLine();

		process.stdout.cursorTo(0);

		if (message.userName) {
			process.stdout.write(message.userName + ': ' + message.line + os.EOL);
		} else {
			process.stdout.write(message.line + os.EOL);
		}


		this.cli.prompt(true);
	}
}

const client = new Client();
client.init();

//
// class Message {
// 	constructor(line, username) {
// 		this.line = line;
// 		this.user
// 	}
// }

class Command {

	constructor(type, value) {
		this.type = type;
		this.value = value;
	}

	gtType() {
		return type;
	}
}
