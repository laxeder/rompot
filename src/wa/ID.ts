export function fixID(id: string) {
  return id.replace(/:(.*)@/, "@");
}

export function getPhoneNumber(id: string): string {
  return id?.replace(/\D+/g, "") || "0";
}

/** * Obter o id de um número */
export function getID(id: string): string {
  id = String(`${id}`);

  if (!id.includes("@")) id = `${id}@s.whatsapp.net`;

  return id.trim();
}
