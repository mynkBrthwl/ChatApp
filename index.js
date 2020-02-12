const express = require('express');
const app = express();
const PORT = process.env.PORT || 8888;
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/login.html');
});

var name;
app.post('/', (req, res) => {
	//console.log(req.body.name);
	name = req.body.name;
	res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', (socket) => {
	socket.name = name;
	socket.emit('greet', `Hello ${socket.name}`);
	socket.broadcast.emit('greet', `${socket.name} connected`);
	socket.on('chat', (msg) => {
		socket.broadcast.emit('chat', {name: socket.name, msg});
		socket.broadcast.emit('donetyping');
		socket.emit('greet', `you: ${msg}`);
	});
	socket.on('disconnect', () => {
		socket.broadcast.emit('greet', `${socket.name} disconnected`);
	});
	socket.on('typing', () => {
		socket.broadcast.emit('typing', `${socket.name} is typing`);
	});
});

app.use((req, res) => {
	res.sendFile(__dirname + '/views/nofile.html');
});

server.listen(PORT, () => {
	console.log(`server is up and running on port: ${PORT}`);
});
