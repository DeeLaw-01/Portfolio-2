import FallingText from './FallingText'
import CurvedLoop from './CurvedLoop'

interface AboutProps {
  isLargeScreen?: boolean
  is4K?: boolean
}

export default function About ({
  isLargeScreen = false,
  is4K = false
}: AboutProps) {
  return (
    <div
      className={`bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] flex flex-col w-full relative group hover:bg-white/[0.12] transition-all duration-300 overflow-hidden ${
        isLargeScreen ? 'h-full min-h-[235px]' : 'h-[235px]'
      } ${is4K ? 'p-8' : 'p-5'}`}
    >
      {/* Subtle gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-tr from-[#7203a9]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]'></div>

      {/* Top Section - Circle Icon and CurvedLoop */}
      <div className='flex justify-between items-start mb-4 relative z-10'>
        {/* CurvedLoop Tech Stack - Top Right */}
        <div
          className={`absolute -mr-2 -mt-2 ${
            is4K ? '-top-12 -left-20 w-64 h-20' : '-top-10 -left-16 w-48 h-16'
          }`}
        >
          <CurvedLoop
            marqueeText='MERN ✦ Next.js ✦ FastAPI ✦ Framer ✦ Tailwind ✦ TypeScript ✦ Prisma ✦ Supabase ✦ PostgreSQL ✦ MongoDB ✦ Redis ✦ WebSockets ✦ CORS ✦ JWT ✦ Axios ✦ Zustand ✦ React Query ✦ Vite ✦ Docker ✦ GraphQL ✦ tRPC ✦ Zod ✦ Three.js ✦ GSAP ✦ Shadcn/UI ✦ Radix UI'
            speed={1.5}
            curveAmount={1050}
            direction='right'
            interactive={true}
            className={`text-[#dadada] opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${
              is4K ? 'text-[15rem]' : 'text-[10rem]'
            }`}
          />
        </div>
      </div>

      {/* Falling Text */}
      <div className='flex-1 flex items-center relative mt-8 z-10'>
        <div className='w-full h-full'>
          <FallingText
            text="Hi, I'm Waleed Ahmed, a final year CS student and full-stack developer. I build with MERN, Next.js, and Tailwind CSS, and enjoy backend work with Node.js, Express, FastAPI, and ASP.NET."
            highlightWords={[
              'Waleed',
              'Ahmed',
              'CS',
              'full-stack',
              'MERN',
              'Next.js',
              'Tailwind',
              'Node.js',
              'Express',
              'FastAPI',
              'ASP.NET',
              'developer'
            ]}
            trigger='hover'
            backgroundColor='transparent'
            wireframes={false}
            gravity={0.8}
            fontSize='14px'
            mouseConstraintStiffness={0.6}
          />
        </div>
      </div>
    </div>
  )
}
