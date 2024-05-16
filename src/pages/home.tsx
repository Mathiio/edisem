import { EmblaOptionsType } from 'embla-carousel'
import { EmblaCarousel } from '@/components/EmblaCarousel'
import { Navbar } from '@/components/Navbar'
import { NavKeyWords } from '@/components/NavKeyWords'
import { useDisclosure } from '@nextui-org/react'

/*
const OPTIONS: EmblaOptionsType = { containScroll: false, align: 'start' }
const SLIDES = [
  'https://www.booska-p.com/wp-content/uploads/2023/06/Damso-Succes-Visu-News.jpg',
  'https://www.booska-p.com/wp-content/uploads/2023/06/Damso-Succes-Visu-News.jpg',
  // Add more image URLs as needed
]
*/

export const Home = () => {
  return (
    <div className=' bg-default-50 flex flex-col items-start gap-md p-md'>
      <Navbar />
      <NavKeyWords />
    </div>
  )
}

// <EmblaCarousel slides={SLIDES} options={OPTIONS} /> 