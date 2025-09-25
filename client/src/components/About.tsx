import circleIcon from '../assets/CIRCLE ICON.png'

export default function About () {
  return (
    <div className='bg-white/[0.08] rounded-[20px] p-5 h-[235px] flex flex-col'>
      {/* Circle Icon */}
      <div className='mb-6'>
        <img
          src={circleIcon}
          alt='Circle Icon'
          className='w-8 h-8  animate-spin-slow ease-in-out'
        />
      </div>

      {/* About Text */}
      <div className='flex-1 flex items-center'>
        <p className='text-[17px] leading-[21px] text-[#dadada] font-normal'>
          Hi, I'm Waleed Ahmed, a 5th semester CS student at the National
          University of Modern Languages. I am a MERN stack web developer,
          currently learning Next.js to deepen my web development skills.
        </p>
      </div>
    </div>
  )
}
