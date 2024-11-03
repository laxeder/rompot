import type { AdvancedCommandData } from './AdvancedCommandData';
import type { AdvancedCommandContext } from './AdvancedCommandContext';
import type { AdvancedCommandStartOptions } from './AdvancedCommandStart';

import type { Message } from '../../../messages';

import NodeCache from 'node-cache';

import AdvancedCommand from './AdvancedCommand';

export default class AdvancedCommandController {
  public clientId: string;
  public cache: NodeCache;
  public commands: Record<string, AdvancedCommand> = {};

  constructor(clientId: string) {
    this.clientId = clientId;
    this.cache = new NodeCache({
      useClones: false,
      stdTTL: 3600,
      checkperiod: 3600,
    });
  }

  public prepareCommand<T extends object>(
    command: AdvancedCommand<T>,
  ): AdvancedCommand<T> {
    command.clientId = this.clientId;
    command.controller = this;

    command.initialContext.commandId = command.id;

    if (command.initialContext.message) {
      command.initialContext.message.clientId = this.clientId;
    }

    return command;
  }

  public createCommand<T extends object>(
    commandData: Partial<AdvancedCommandData<T>> & { context: T },
  ): AdvancedCommand<T> {
    const command = new AdvancedCommand<T>({
      ...commandData,
      controller: this,
    });

    this.addCommand(command);

    return command;
  }

  public setCommands(...commands: AdvancedCommand[]): void {
    this.commands = {};

    for (const command of commands) {
      this.addCommand(command);
    }
  }

  public addCommand<T extends object = object>(
    command: AdvancedCommand<T>,
  ): void {
    if (!command) throw new Error('Command is required');
    if (!command.id) throw new Error('Command id is required');

    this.commands[command.id] = this.prepareCommand(command);
  }

  public addCommands(...commands: AdvancedCommand[]): void {
    for (const command of commands) {
      this.addCommand(command);
    }
  }

  public removeCommand(command: AdvancedCommand | string): boolean {
    const id = typeof command === 'string' ? command : command?.id;

    if (!id) throw new Error('Command id is required');

    if (!this.commands[id]) return false;

    delete this.commands[id];

    return true;
  }

  public removeCommands(...commands: AdvancedCommand[]): void {
    for (const command of commands) {
      this.removeCommand(command);
    }
  }

  public getCommand<T extends object = object>(
    id: string,
  ): AdvancedCommand<T> | undefined {
    if (!this.commands[id]) return undefined;

    return this.prepareCommand<T>(this.commands[id] as AdvancedCommand<T>);
  }

  public getCommands(): AdvancedCommand[] {
    return Object.values(this.commands);
  }

  public hasCommand(id: string): boolean {
    return !!this.commands[id];
  }

  public async execCommand<T extends object = object>(
    commandId: string,
    message: Message,
    options: Partial<AdvancedCommandStartOptions<T>> = {},
  ): Promise<void> {
    const command = this.getCommand<T>(commandId);

    if (!command) throw new Error('Command not found');

    const chatId = message.chat.id;

    const data = await this.getContext(command, chatId);

    const startOptions: AdvancedCommandStartOptions<T> = {
      chatId,
      context: { ...command.initialContext, chatId },
      taskId:
        command.initialContext.taskId ||
        Object.keys(command.tasks).shift() ||
        '',
    };

    if (data) {
      Object.assign(startOptions.context, data);
    }

    if (options.context) {
      Object.assign(startOptions.context, options.context);
    }

    startOptions.context.message = message;

    if (options.taskId) {
      startOptions.taskId = options.taskId;
      startOptions.context.taskId = options.taskId;
    }

    await command.start(startOptions);
  }

  public saveContext<T extends object>(
    command: AdvancedCommand<T>,
    context: AdvancedCommandContext<T>,
  ): Promise<void> | void {
    this.cache.set(this.getCacheKey(command.id, context.chatId), context);
  }

  public clearContext<T extends object>(
    command: AdvancedCommand<T>,
    chatId: string,
  ): Promise<void> | void {
    this.cache.del(this.getCacheKey(command.id, chatId));
  }

  public getContext<T extends object>(
    command: AdvancedCommand,
    chatId: string,
  ):
    | Promise<AdvancedCommandContext<T> | undefined>
    | (AdvancedCommandContext<T> | undefined) {
    return this.cache.get<AdvancedCommandContext<T>>(
      this.getCacheKey(command.id, chatId),
    );
  }

  public getCacheKey(commandId: string, chatId: string): string {
    return `bot-${this.clientId}-advanced-command-${commandId}-in-${chatId}`;
  }
}
