/**
 * Thai PromptPay QR payload (EMVCo merchant-presented, BOT spec).
 * Target: mobile number (10 digits, starts with 0) or national/tax ID (13 digits).
 */
const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF), upper-case hex. */
export function crc16(s: string) {
  let crc = 0xffff;
  for (const ch of new TextEncoder().encode(s)) {
    crc ^= ch << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Returns null when the target is not a valid PromptPay ID. */
export function promptPayPayload(target: string, amount?: number) {
  const id = target.replace(/\D/g, "");
  let account: string;
  if (/^0\d{9}$/.test(id)) account = tlv("01", `0066${id.slice(1)}`.padStart(13, "0"));
  else if (/^\d{13}$/.test(id)) account = tlv("02", id);
  else return null;

  const body =
    tlv("00", "01") +
    tlv("01", amount ? "12" : "11") +
    tlv("29", tlv("00", "A000000677010111") + account) +
    tlv("53", "764") +
    (amount ? tlv("54", amount.toFixed(2)) : "") +
    tlv("58", "TH") +
    "6304";
  return body + crc16(body);
}
