import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to ZKSub</h1>
        <p className="text-lg max-w-xl mx-auto">
          A privacy-first subscription platform for content creators. Connect your wallet to get started.
        </p>
      </main>
    </>
  )
}
