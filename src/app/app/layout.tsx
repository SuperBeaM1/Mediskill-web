import { Logo } from "@/components/Logo";
import { signOut } from "../(auth)/actions";
import { AppNav } from "./AppNav";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
        <div className="wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
          <Logo href="/app" />
          <div className="ml-auto flex items-center gap-4">
            <AppNav />
            <form action={signOut}>
              <button type="submit" className="btn-ghost min-h-10 px-3.5 text-sm">ออกจากระบบ</button>
            </form>
          </div>
        </div>
      </header>
      <main className="wrap grid gap-5 py-8">{children}</main>
    </>
  );
}
