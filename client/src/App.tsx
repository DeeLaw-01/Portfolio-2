import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Work from './components/Work'
import Contact from './components/Contact'
import Socials from './components/Socials'
import myImage from './assets/WaleedAhmed.png'
import dither from './assets/dither.png'

export default function App () {
  return (
    <div className='min-h-screen bg-[#0e0e14] text-[#dadada] flex items-center justify-center'>
      <div className='w-fit px-4 py-3'>
        {/* Header - matches total content width */}
        <div className='w-[1145px]'>
          <Header />
        </div>

        {/* Main Content - Custom Layout matching Figma exactly */}
        <div className='mt-4 flex gap-4'>
          {/* Left and Center columns */}
          <div className='flex flex-col gap-4'>
            {/* First Row - Hero and Profile */}
            <div className='flex gap-4'>
              {/* Hero Section - 470px width (scaled down ~17%) */}
              <div className='w-[470px]'>
                <Hero />
              </div>

              {/* Profile Image - 275px width (scaled down ~17%) */}
              <div className='w-[275px]'>
                <div className='w-full h-[355px] bg-gray-700 rounded-[20px] overflow-hidden group cursor-pointer relative'>
                  {/* Dither Image - Default state */}
                  <img
                    src={dither}
                    alt='Waleed Ahmed - Dither'
                    className='w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0'
                  />
                  {/* Real Image - Hover state */}
                  <img
                    src={myImage}
                    alt='Waleed Ahmed'
                    className='absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100'
                  />
                </div>
              </div>
            </div>

            {/* Second Row - About and Contact */}
            <div className='flex gap-4'>
              {/* About Section - 370px width (scaled down ~17%) */}
              <div className='w-[370px]'>
                <About />
              </div>

              {/* Contact Section - 370px width (scaled down ~17%) */}
              <div className='w-[370px]'>
                <Contact />
              </div>
            </div>
          </div>

          {/* Right column - Work and Socials */}
          <div className='flex flex-col gap-4'>
            {/* Work Section */}
            <div className='w-[370px]'>
              <Work />
            </div>

            {/* Socials Section */}
            <div className='w-[370px]'>
              <Socials />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
