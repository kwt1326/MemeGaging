"use client"

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { WalletConnector } from "./wagmi/WalletConnector";
import { useCreatorContext } from "@/contexts/CreatorContext";

export function Header() {
  const pathname = usePathname();
  const isLeaderboard = pathname === '/';
  const isDashboard = pathname === '/dashboard';

  const { user } = useCreatorContext();

  return (
    <header className="border-b px-8 py-4">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        <Link href="/" className="text-gray-900">
          MemeGaging
        </Link>
        
        <div className="flex items-center gap-3">
          <Link href="/">
            <button
              className={`px-4 py-2 rounded ${
                isLeaderboard
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              LeaderBoard
            </button>
          </Link>
          <Link href="/dashboard">
            <button
              className={`px-4 py-2 rounded ${
                isDashboard
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              My Dashboard
            </button>
          </Link>
          <WalletConnector />
          {user?.profileImageUrl ? 
            <img className="w-10 h-10 rounded-full" src={user.profileImageUrl} /> : 
            <div className="w-10 h-10 rounded-full bg-gray-300" />
          }
        </div>
      </div>
    </header>
  );
}
