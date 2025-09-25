import flowerIcon from '../assets/FLOWER ICON.png'
export default function Hero () {
  return (
    <div className='bg-white/[0.08] rounded-[20px] p-5 h-[355px] flex flex-col justify-between group'>
      {/* Flower Icon with Spinning Animation */}
      <div className='flex justify-end'>
        <div className='w-[119px] h-[119px] flex items-center justify-center'>
          <img
            src={flowerIcon}
            alt='Flower Icon'
            className='w-[119px] h-[119px] animate-spin-slow group-hover:animate-none'
            style={{
              animation: 'spin 8s linear infinite'
            }}
          />
        </div>
      </div>

      {/* Main Slogan - Exact Figma Typography */}
      <div className='mt-auto'>
        <div
          className='text-[#dadada]'
          style={{
            letterSpacing: '0px',
            textAlign: 'left'
          }}
        >
          <div className='text-4xl leading-[64px] font-normal'>
            Design Meets
          </div>
          <div className='text-6xl leading-[64px] font-extralight italic'>
            Efficiency
          </div>
          <div className='text-2xl ml-32 leading-[48px] font-bold  mt-2'>
            -Beautifully Coded.
          </div>
        </div>
      </div>
    </div>
  )
}
