import Image from "next/image";
import Link from "next/link";
import { Cpu } from "lucide-react";

export function Header() {
  return (
    <>
      <header className="pt-4 fixed left-0 top-0 z-50 w-full translate-y-[-1rem] animate-fade-in border-b border-base-200 backdrop-blur-[12px] [--animation-delay:600ms]">
        <div className="container flex h-[3.5rem] items-center justify-center">
          <Link
            className="flex items-center gap-2 text-xl font-semibold text-black"
            href="/"
          >
            <Cpu className="h-6 w-6" />
            <span>EdgeTech</span>
          </Link>
        </div>
      </header>
    </>
  );
}
