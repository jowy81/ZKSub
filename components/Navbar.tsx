import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-100 shadow">
      <div className="text-xl font-bold">ZKSub</div>
      <div className="flex gap-4 items-center">
        <Link href="/creator" className="hover:underline">For Creators</Link>
        <Link href="/viewer" className="hover:underline">For Viewers</Link>
        <ConnectButton />
      </div>
    </nav>
  )
}
