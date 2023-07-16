import CommandPermission from "@modules/command/models/CommandPermission";

export function CMDPerm(id: string, isPermited?: boolean) {
  return new CommandPermission(id, isPermited);
}
