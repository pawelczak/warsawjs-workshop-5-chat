// server.js
const http = require('http');
const io = require('socket.io');
const uuidV1 = require('uuid/v1');

const users = [];
const sessions = [];

const helpMessage = `
Possible commands:

/REGISTER user pass

/LOGIN user pass

`;

const needToLog = `You need to be logged to write message. use /help`;

function createServer() {

	return new Promise((resolve, reject) => {
		var server = http.createServer();

		server.on('listening', () => resolve(server));

		server.on('error', reject);

		server.listen(3001);
	});

}

createServer()
	.then((server) => {
		console.log('The chat server has started');
		const socket = io(server);

		socket.on('connection', (socket) => {
			console.log(`new user ${socket.id}`);

			socket.on('message', (message) => {

				console.log(message);

				if(!message.line.startsWith('/')) {
					if (isOpenSession(message.token)) {
						socket.broadcast.emit('messageClient', {line: message.line, userName: message.userName});
					} else {
						socket.emit('messageClient', {line: needToLog});
					}
				} else {

					const command = message.line.slice(1, message.line.length);
					console.log(command);
					const commandArgs = command.split(' ');

					const cmd = commandArgs.shift();

					handleCommand(socket, cmd, commandArgs);
				}

			});

			socket.emit('hello', 'Welcome! You need to register & login to be able to speak');

			socket.on('welcomeMessage', (userName) => {
				console.log(`Welcome new User ${userName}`);
				socket.broadcast.emit('newUser', userName);
			});

		});

	})
	.catch((err) => console.log('error!', err));


function handleCommand(socket, command, args) {
	switch(command) {
		case "REGISTER":
			socket.emit('register', register(args[0], args[1]));
			break;
		case "LOGIN":
			const loginResult = socket.emit('login', login(args[0], args[1]));

			if (loginResult) {
				socket.broadcast.emit('newUser', {userName: args[0]});
			}
			break;
		case "help":
			socket.emit('messageClient', {
				line: helpMessage
			});
			break;
		default:
			socket.emit('notACommand');
			break;
	}
}

function register(user, pass) {
	if (users[user] === undefined) {
		console.log('Register success');
		users[user] = pass;
		return true;
	}
	return false;
}

function login(user, pass) {
	if (users[user] !== undefined && users[user] === pass) {
		let token = uuidV1();
		sessions.push(token);
		return {token: token, userName: user};
	}
	return false;
}

function isOpenSession(token) {
	return sessions.indexOf(token) > -1;
}

