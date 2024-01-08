export default function (length: number = 15): string {
  const now = Math.pow(10, 2) * +new Date();

  if (now == global["rompot-last-nonce-id"]) {
    global["rompot-last-nonce-repeat"] = (global["rompot-last-nonce-repeat"] || 0) + 1;
  } else {
    global["rompot-last-nonce-id"] = now;
    global["rompot-last-nonce-repeat"] = 0;
  }

  const s = (now + (global["rompot-last-nonce-repeat"] || 0)).toString();

  return s.substr(s.length - length);
}
