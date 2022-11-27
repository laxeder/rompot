import { Command } from "rompot";

export const hello = new Command("hello", "Manda um simples Hello");
hello.setSend("Hello There!");