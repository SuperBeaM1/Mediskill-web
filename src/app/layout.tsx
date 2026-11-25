import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Kanit } from "next/font/google";
import "./globals.css";

const heading = Kanit({
  variable: "--font-heading",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
});

const body = IBM_Plex_Sans_Thai({
  variable: "--font-body",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "MeditSkill", template: "%s · MeditSkill" },
  description: "สมาธิ คือ นวัตกรรมของชีวิต · ศูนย์พัฒนาทักษะสมาธิสำหรับทุกวัย ด้วยหลักสูตร PAC'C จากผลการวิจัยระดับโลกจากญี่ปุ่น พร้อมรายงานพัฒนาการ 6-I ทุกเดือน",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
