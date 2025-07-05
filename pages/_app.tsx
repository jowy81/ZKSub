// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import {
  WagmiConfig,
  createConfig,
  http
} from 'wagmi'
import { sepolia } from 'wagmi/chains'

// 1. Wallet configuration (can be expanded with Intmax later)
const { connectors } = getDefaultWallets({
  appName: 'ZKSub',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // You can use a demo ID for testing
  chains: [sepolia],
})

// 2. Wagmi config
const config = createConfig({
  connectors,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true, // good for Next.js rendering
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        chains={[sepolia]}
        theme={darkTheme()}
        modalSize="compact"
      >
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
