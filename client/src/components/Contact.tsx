import { ArrowUpRight } from 'lucide-react'
export default function Contact () {
  return (
    <div className='bg-[#7203a9] rounded-[20px] p-5 h-[235px] flex flex-col justify-between group relative'>
      {/* Top Section */}
      <div>
        <div className='flex justify-between items-start mb-6'>
          <p className='text-[13px] leading-[15px] text-[#dadada]'>
            Have some
            <br />
            questions?
          </p>
          <div className='w-[32px] h-[32px]  flex items-center justify-center absolute top-4 right-4 group-hover:right-3 group-hover:top-3 transition-all duration-300'>
            <ArrowUpRight className='w-8 h-8  ' />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        <h2 className='text-[46px] leading-[54px] text-[#dadada] font-normal'>
          Contact me
        </h2>
      </div>
    </div>
  )
}
