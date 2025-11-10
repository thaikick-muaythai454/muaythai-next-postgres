import Link from "next/link";

export const metadata = {
  title: "Coming Soon | Thai Kick Muay Thai",
};

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 text-center text-white">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Coming Soon
      </h1>
      <p className="max-w-xl text-base text-slate-300 sm:text-lg">
        เรากำลังเตรียมเว็บไซต์ใหม่สำหรับค่าย Thai Kick MuayThai
        <br />ติดตามข่าวสาร และเตรียมพบกับประสบการณ์การจองและจัดการค่ายมวยที่ดีกว่าเดิมเร็ว ๆ นี้!
      </p>
      <Link
        href="mailto:thaikickmuaythai@gmail.com"
        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
      >
        ติดต่อเรา
      </Link>
    </main>
  );
}
