import { Instagram, Github, Linkedin } from 'lucide-react'

export default function Socials () {
  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/_dee_law_',
      icon: Instagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'Github',
      url: 'https://github.com/DeeLaw-01',
      icon: Github,
      color: 'hover:text-gray-400'
    },
    {
      name: 'Linkedin',
      url: 'https://www.linkedin.com/in/waleed-ahmed-284392203',
      icon: Linkedin,
      color: 'hover:text-blue-500'
    }
  ]

  return (
    <div className='bg-white/[0.08] rounded-[20px] p-4 h-[84px] flex items-center justify-center w-full group flex-shrink-0'>
      <div className='flex gap-8'>
        {socialLinks.map(social => {
          const IconComponent = social.icon
          return (
            <a
              key={social.name}
              href={social.url}
              target='_blank'
              rel='noopener noreferrer'
              className={`flex flex-col items-center gap-1 text-[#dadada] ${social.color} transition-all duration-300 cursor-pointer group-hover:scale-105`}
            >
              <IconComponent className='w-5 h-5' />
              <span className='text-[10px] font-medium'>{social.name}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
