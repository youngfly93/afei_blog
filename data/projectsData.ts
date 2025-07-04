interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'Airchat ',
    description: `Airchat is a macOS floating chat window application built with SwiftUI and an MVVM architecture. `,
    imgSrc: '/static/images/project-1751642185912.png',
    href: 'https://github.com/youngfly93/Airchat.git',
  }
]

export default projectsData