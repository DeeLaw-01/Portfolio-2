export default function Socials () {
  const socialLinks = [
    { name: 'Instagram', url: 'https://www.instagram.com/_dee_law_' },
    { name: 'Github', url: 'https://github.com/DeeLaw-01' },
    {
      name: 'Linkedin',
      url: 'https://www.linkedin.com/in/waleed-ahmed-284392203'
    }
  ]

  return (
    <div className='bg-white/[0.08] rounded-[20px] p-4 h-[84px] flex items-center justify-center'>
      <div className='flex gap-12'>
        {socialLinks.map(social => (
          <a
            key={social.name}
            href={social.url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-[13px] text-[#dadada] hover:text-[#7203a9] transition-colors cursor-pointer'
          >
            {social.name}
          </a>
        ))}
      </div>
    </div>
  )
}
