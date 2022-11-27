const { Command } = require("rompot");

const hello = new Command("hello", "Manda um simples Hello");
hello.setSend("Hello There!");

module.exports = { hello };
