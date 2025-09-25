export default function Header () {
  return (
    <header className='bg-white/[0.08] rounded-[20px] px-5 py-5'>
      <nav className='flex justify-between items-center'>
        {/* Logo */}
        <div className='text-[21px] italic font-normal text-[#dadada]'>
          Waleed Ahmed
        </div>

        {/* Navigation Links */}
        <div className='flex gap-8'>
          <a
            href='#projects'
            className='text-[14px] text-[#dadada] hover:text-[#7203a9] transition-colors cursor-pointer'
          >
            PROJECTS
          </a>
          <a
            href='#about'
            className='text-[14px] text-[#dadada] hover:text-[#7203a9] transition-colors cursor-pointer'
          >
            ABOUT
          </a>
          <a
            href='#contact'
            className='text-[14px] text-[#dadada] hover:text-[#7203a9] transition-colors cursor-pointer'
          >
            CONTACT
          </a>
        </div>
      </nav>
    </header>
  )
}
