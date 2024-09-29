import CommandPermission from "./CommandPermission";

export function CMDPerm(id: string, isPermited?: boolean) {
  return new CommandPermission(id, isPermited);
}
