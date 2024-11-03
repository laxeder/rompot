import type { AdvancedCommandNextOptions } from './AdvancedCommandNext';
import type { AdvancedCommandStopOptions } from './AdvancedCommandStop';
import type {
  AdvancedCommandStartOptions,
  PartialAdvancedCommandStartOptions,
} from './AdvancedCommandStart';
import type {
  AdvancedCommandNextJob,
  AdvancedCommandSaveJob,
  AdvancedCommandStopJob,
} from './AdvancedCommandJob';

import type { AdvancedCommandData } from './AdvancedCommandData';
import type { AdvancedCommandTask } from './AdvancedCommandTask';
import type { AdvancedCommandOptions } from './AdvancedCommandOptions';
import type { AdvancedCommandContext } from './AdvancedCommandContext';

import type AdvancedCommandController from './AdvancedCommandController';

import { getMessageFromJSON } from '../../../utils/MessageUtils';
import nonce from '../../../utils/nonce';

export default class AdvancedCommand<T extends object = object> {
  public id: string;
  public clientId: string;
  public controller: AdvancedCommandController;
  public initialContext: AdvancedCommandContext<T>;
  public tasks: Record<string, AdvancedCommandTask<T>>;
  public options: Partial<AdvancedCommandOptions>;

  constructor(data: AdvancedCommandData<T>) {
    this.id = nonce();
    this.initialContext = {} as AdvancedCommandContext<T>;
    this.tasks = {};
    this.options = {};

    if (data?.context) {
      Object.assign(this.initialContext, data.context);
    }

    this.injectContext(data);
  }

  public injectContext(data: Partial<AdvancedCommandData<T>>) {
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be an object');
    }

    if (data.controller) {
      this.controller = data.controller;
    }

    if (data.options) {
      this.options = { ...this.options, ...data.options };
    }

    if (data.initialContext) {
      this.initialContext = { ...this.initialContext, ...data.initialContext };
    }

    if (data.tasks) {
      this.tasks = { ...this.tasks, ...data.tasks };
    }

    if (data.id) {
      this.id = data.id;
    }

    this.clientId = this.controller.clientId;

    this.initialContext.clientId = this.clientId;
    this.initialContext.commandId = this.id;

    if (this.initialContext.message) {
      this.initialContext.message = getMessageFromJSON(
        this.initialContext.message,
      );
      this.initialContext.message.clientId = this.clientId;
    }
  }

  public async saveContext(
    nowContext: AdvancedCommandContext<T>,
    data?: T,
  ): Promise<void> {
    const context = { ...nowContext, ...data };

    await this.controller.saveContext(this, context);
  }

  public addTask(id: string, task: AdvancedCommandTask<T>): void {
    this.tasks[id] = task;
  }

  public async start(
    options: PartialAdvancedCommandStartOptions<T>,
  ): Promise<void> {
    const taskId =
      options.taskId ||
      options.context?.taskId ||
      Object.keys(this.tasks).shift() ||
      '';
    const context =
      (await this.controller.getContext<T>(this, options.chatId)) ||
      this.initialContext;

    if (options.context && typeof options.context === 'object') {
      Object.assign(context, options.context);
    }

    if (taskId) {
      context.taskId = taskId;
    }

    context.isRun = true;
    context.commandId = this.id;
    context.chatId = options.chatId;
    context.clientId = this.clientId;

    const task = this.tasks[taskId];

    if (!task) {
      throw new Error('Task not found');
    }

    await this.saveContext(context);

    const saveTaskContext: AdvancedCommandSaveJob<T> = async (data?: T) => {
      await this.saveContext(context, data);
    };

    const nextTask: AdvancedCommandNextJob<T> = async (
      options?: Partial<AdvancedCommandNextOptions<T>>,
    ) => {
      if (options?.context && typeof options.context === 'object') {
        Object.assign(context, options.context);
      }

      if (options?.taskId) {
        context.taskId = options.taskId;
      }

      await this.next(context, options);
    };

    const stopTask: AdvancedCommandStopJob = async (
      options?: Partial<AdvancedCommandStopOptions>,
    ) => {
      await this.stop(context, options);
    };

    const job = {
      context,
      saveTaskContext,
      nextTask,
      stopTask,
    };

    task(job);
  }

  public async next(
    nowContext: AdvancedCommandContext<T>,
    options?: Partial<AdvancedCommandNextOptions<T>>,
  ): Promise<void> {
    let taskId = options?.taskId;

    if (!taskId) {
      const nowTaskIndex = Object.keys(this.tasks).findIndex(
        (t) => t === nowContext.taskId,
      );

      if (nowTaskIndex === -1) {
        throw new Error('Task not found');
      }

      const newTaskId = Object.keys(this.tasks)[nowTaskIndex + 1];

      // Stop command, no many tasks
      if (!newTaskId) return;

      taskId = newTaskId;
    }

    const context = { ...nowContext };

    if (options?.context && typeof options.context === 'object') {
      Object.assign(context, options.context);
    }

    const chatId: string = context.chatId;

    const startOptions: AdvancedCommandStartOptions<T> = {
      chatId,
      taskId,
      context,
    };

    await this.controller.execCommand<T>(
      this.id,
      nowContext.message,
      startOptions,
    );
  }

  public async stop(
    nowContext: AdvancedCommandContext<T>,
    options?: Partial<AdvancedCommandStopOptions>,
  ): Promise<void> {
    if (options?.noRemove === true) return;

    await this.controller.clearContext(this, nowContext.chatId);
  }
}
