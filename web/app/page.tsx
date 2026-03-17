import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ThreeScene from '@/components/ThreeScene'

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <ThreeScene />
      <Navbar />
      <Hero />
    </main>
  )
}
