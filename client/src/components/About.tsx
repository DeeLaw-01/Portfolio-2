import circleIcon from '../assets/CIRCLE ICON.png'
import FallingText from './FallingText'
import CurvedLoop from './CurvedLoop'

export default function About () {
  return (
    <div className='bg-white/[0.08] backdrop-blur-sm border border-white/[0.05] rounded-[20px] p-5 h-[235px] flex flex-col w-full relative group hover:bg-white/[0.12] transition-all duration-300 overflow-hidden'>
      {/* Subtle gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-tr from-[#7203a9]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]'></div>

      {/* Top Section - Circle Icon and CurvedLoop */}
      <div className='flex justify-between items-start mb-4 relative z-10'>
        {/* CurvedLoop Tech Stack - Top Right */}
        <div className='absolute -top-10 -left-16 w-48 h-16 -mr-2 -mt-2'>
          <CurvedLoop
            marqueeText='MERN ✦ Next.js ✦ FastAPI ✦ Framer ✦ Tailwind ✦ TypeScript ✦ Framer ✦ Tailwind ✦ TypeScript ✦'
            speed={1.5}
            curveAmount={1050}
            direction='right'
            interactive={true}
            className='text-[10rem] text-[#dadada] opacity-60 group-hover:opacity-100 transition-opacity duration-300'
          />
        </div>
      </div>

      {/* Falling Text */}
      <div className='flex-1 flex items-center relative mt-8 z-10'>
        <div className='w-full h-full'>
          <FallingText
            text="Hi, I'm Waleed Ahmed, a 7th semester CS student and full-stack developer. I build with MERN, Next.js, and Tailwind CSS, and enjoy backend work with Node.js, Express, FastAPI, and ASP.NET."
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
