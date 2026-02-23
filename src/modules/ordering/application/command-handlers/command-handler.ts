export interface CommandHandler<TCommand> {
  execute(command: TCommand): Promise<void>;
}
