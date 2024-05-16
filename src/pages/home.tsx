import { EmblaOptionsType } from 'embla-carousel'
import { EmblaCarousel } from '@/components/EmblaCarousel'
import { Navbar } from '@/components/Navbar'
import { useDisclosure } from '@nextui-org/react'

const OPTIONS: EmblaOptionsType = { containScroll: false, align: 'start' }
const SLIDES = [
  'https://www.booska-p.com/wp-content/uploads/2023/06/Damso-Succes-Visu-News.jpg',
  'https://www.booska-p.com/wp-content/uploads/2023/06/Damso-Succes-Visu-News.jpg',
  // Add more image URLs as needed
]

export const Home = () => {
  return (
    <div className='container mx-auto flex flex-col items-start gap-6 my-6'>
      <Navbar />
      <div className='flex space-x-4'>
        <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      </div>
    </div>
  )
}
