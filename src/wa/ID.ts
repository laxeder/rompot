export function replaceID(id: string): string {
  id = String(`${id}`).replace(/:(.*)@/, "@");

  if (id.includes("@s")) id = id.split("@")[0];

  return id.trim();
}

export function getID(id: string): string {
  id = String(`${id}`);

  if (!id.includes("@")) id = `${id}@s.whatsapp.net`;

  return id.trim();
}
