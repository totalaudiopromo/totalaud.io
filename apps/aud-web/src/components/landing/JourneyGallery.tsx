'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const GALLERY_ITEMS = [
  {
    image: '/images/journey/chris1992.png',
    alt: 'Chris Schofield as a child in 1988, asleep with headphones on',
    label: 'The Dream',
    year: '1988',
    description: 'Headphones on before I could talk. The obsession started early.',
  },
  {
    image: '/images/journey/chrisdj2022.JPG',
    alt: 'Chris Schofield DJing at Gold Soundz in 2012',
    label: 'The Hustle',
    year: '2012',
    description: 'Gold Soundz. Learning that business is 90% logistics and showing up.',
  },
  {
    image: '/images/journey/hisandhersfloor.JPG',
    alt: 'Chris Schofield performing with His & Hers hardcore band in 2015',
    label: 'The Scene',
    year: '2015',
    description: 'DIY or die. Touring with His & Hers taught me the reality of the grind.',
  },
  {
    image: '/images/journey/sadactpromopic2021.JPG',
    alt: 'Chris Schofield as a radio promoter in 2021',
    label: 'The Catalyst',
    year: '2021',
    description: "Five years of radio promotion. Seeing why most 'luck' is just good data.",
  },
  {
    image: '/images/journey/sadact2023studio.jpg',
    alt: 'Chris Schofield producing music as sadact in 2023',
    label: 'Studio',
    year: '2023',
    description: 'Back in the studio as sadact. Building tools that respect the craft.',
    link: 'https://sadact.uk',
  },
  {
    image: '/images/journey/chrisdecadance2024.JPG',
    alt: 'Chris Schofield at Decadance UK radio station in 2024',
    label: 'Radio',
    year: '2024',
    description: 'On the air at Decadance UK. Learning the other side of the desk.',
  },
  {
    image: '/images/journey/chris-sadact-portrait.jpg',
    alt: 'Chris Schofield, founder of Totalaud.io, 2026',
    label: 'The System',
    year: 'Present',
    description: "Distilling thirty years of noise into the system I wish I'd had on day one.",
  },
]

export function JourneyGallery() {
  const containerRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={containerRef}
      className="py-32 bg-ta-black border-y border-ta-border/50 relative overflow-hidden"
    >
      {/* Background Cinematic Texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-ta-cyan/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1700px] mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ta-cyan/10 border border-ta-cyan/20 text-ta-cyan text-[11px] font-black uppercase tracking-[0.2em] mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-ta-cyan animate-pulse" />
              Music Native
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-bold text-ta-white mb-8 tracking-tighter"
            >
              Three decades{' '}
              <span className="italic text-ta-cyan/90 font-serif underline decoration-ta-cyan/30 underline-offset-8">
                of noise.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl text-ta-muted leading-relaxed font-medium max-w-2xl"
            >
              I've been the kid asleep next to the speakers, the artist in the van, and the promoter
              behind the desk. Totalaud.io is the toolkit I needed at every step of that journey.
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-5">
          {GALLERY_ITEMS.map((item, index) => (
            <GalleryCard key={item.label} item={item} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 pt-10 border-t border-ta-border/40 flex flex-col items-center gap-8"
        >
          <Link href="/dashboard" className="group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-3 px-10 py-4 bg-ta-cyan text-ta-black rounded-ta font-bold text-lg hover:bg-ta-cyan/90 transition-all shadow-[0_0_30px_rgba(58,169,190,0.3)] hover:shadow-[0_0_40px_rgba(58,169,190,0.5)]"
            >
              Get Started
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </motion.div>
          </Link>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
            <div className="text-lg text-ta-muted font-medium tracking-tight">
              <span className="text-ta-cyan italic font-serif">Authenticity</span> is our baseline.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="px-6 py-2 rounded-ta-pill bg-ta-cyan/5 border border-ta-cyan/10 text-ta-cyan text-[12px] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(58,169,190,0.05)]">
                EST. 1988
              </div>
              <div className="px-6 py-2 rounded-ta-pill bg-ta-white/5 border border-white/10 text-ta-white text-[12px] font-black tracking-widest uppercase">
                BRIGHTON, UK
              </div>
              <a
                href="https://sadact.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 rounded-ta-pill bg-ta-cyan/5 border border-ta-cyan/20 text-ta-cyan text-[12px] font-black tracking-widest uppercase hover:bg-ta-cyan/10 transition-colors"
              >
                SADACT.UK
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function GalleryCard({ item, index }: { item: any; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const imageX = useTransform(mouseXSpring, [-0.5, 0.5], ['-5%', '5%'])
  const imageY = useTransform(mouseYSpring, [-0.5, 0.5], ['-5%', '5%'])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  function handleMouseLeave() {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.08,
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col bg-ta-panel rounded-ta border border-ta-border hover:border-ta-cyan/40 transition-colors duration-500 overflow-hidden shadow-ta active:scale-[0.98]"
    >
      <div className="aspect-[4/5] relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
        <motion.div
          style={{
            x: imageX,
            y: imageY,
            scale: 1.15,
          }}
          className="absolute inset-0"
        >
          <Image
            src={item.image}
            alt={item.alt}
            fill
            className="object-cover"
            priority={index < 3}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 14vw"
          />
        </motion.div>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-ta-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-all duration-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* RGB Shift Effect Placeholder via Shadow/Border */}
        <div className="absolute inset-0 border-[0px] group-hover:border-[1px] border-ta-cyan/20 transition-all pointer-events-none" />
      </div>

      <div className="p-6 flex flex-col flex-grow relative z-10">
        <div className="flex justify-between items-start mb-4">
          <motion.span
            animate={{ color: isHovered ? '#3AA9BE' : 'rgba(255,255,255,0.7)' }}
            className="font-bold text-2xl tracking-tighter"
          >
            {item.year}
          </motion.span>
          <span className="text-[11px] font-black tracking-[0.3em] text-ta-muted opacity-50">
            0{index + 1}
          </span>
        </div>
        <h3 className="text-ta-white font-bold text-2xl mb-3 tracking-tight group-hover:text-ta-cyan transition-colors">
          {item.label}
        </h3>
        <p className="text-[15px] text-ta-muted leading-relaxed font-medium">{item.description}</p>
      </div>

      {/* Modern Accent Line */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: isHovered ? '100%' : '0%' }}
        className="absolute bottom-0 left-0 h-[3px] bg-ta-cyan shadow-[0_0_10px_rgba(58,169,190,0.5)]"
      />
    </motion.div>
  )
}
