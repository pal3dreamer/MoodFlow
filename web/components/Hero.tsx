'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center z-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-3xl mx-auto text-center"
      >
         <motion.h1
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
         >
           <span className="text-white">Your work has a pattern.</span>
           <br />
           <span className="text-white/60">Your emotions reveal it.</span>
         </motion.h1>

         <motion.p
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10"
         >
           Record short voice check-ins and discover how your emotional state changes during your work or study sessions.
         </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-black hover:bg-gray-200 font-medium text-lg px-8 py-3 rounded-full transition-colors"
            >
              Start Free Trial
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            className="bg-transparent border border-white/20 text-white font-medium text-lg px-8 py-3 rounded-full transition-colors"
          >
            Watch Demo
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  )
}
