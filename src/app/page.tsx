import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/react-flow");
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Link href={"react-flow"}>View React Flow Graph</Link>
    </div>
  );
}
