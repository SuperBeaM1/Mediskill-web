import QRCode from "qrcode";
import { fmtBaht } from "@/lib/format";
import { promptPayPayload } from "@/lib/promptpay";

/** PromptPay QR with the amount filled in. Rendered on the server; the ID comes from PROMPTPAY_ID. */
export async function PromptPayQR({ amount }: { amount: number }) {
  const id = process.env.PROMPTPAY_ID ?? "";
  const payload = promptPayPayload(id, amount);
  if (!payload) return null;
  const svg = await QRCode.toString(payload, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#141d4a", light: "#ffffff" } });

  return (
    <figure className="grid justify-items-center gap-2 rounded-xl border border-line bg-white p-4 text-center text-[#141d4a]">
      <span className="rounded-md bg-[#1b3d7a] px-3 py-1 text-xs font-bold tracking-wide text-white">PromptPay</span>
      <div className="w-full max-w-[220px] [&>svg]:h-auto [&>svg]:w-full" role="img" aria-label={`QR PromptPay ยอด ${fmtBaht(amount)} บาท`} dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption className="text-sm">
        สแกนด้วยแอปธนาคาร · ยอด <b className="tabular-nums">{fmtBaht(amount)}</b> บาท
        <br />
        <span className="text-xs text-[#4e5878]">บันทึกภาพหน้าจอแล้วเปิดในแอปธนาคารได้</span>
      </figcaption>
    </figure>
  );
}
