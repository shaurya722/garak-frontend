import MainLayout from '@/components/layout/main-layout'
import React from 'react'
// import { useRouter } from 'next/navigation';
import star from '@/assets/Sparkle.svg'
import downArrow from '@/assets/Line 612.svg'
import Image from 'next/image'
import {
  Shield,
  Settings,
  Activity,
  Home,
  FileText,
  Radar,
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const GettingStarted = () => {
  // const router = useRouter()
  return (
    <MainLayout>
           <div className='pt-20 pb-15'>
            <p className='text-center text-text font-dm text-3xl font-bold'>Welcome to the <span className='text-[#31B79D] font-bold'>Aynigma Security</span> Platform!</p>
        <p className='text-center text-[#A1A1A1] pt-3 font-dm text-xs font-normal'>To get started, check out the suggested steps below</p>
        </div>
    <div className="flex items-center justify-center p-4 md:p-8 bg-dark">
      
      <div className="w-full max-w-4xl bg-card border border-border rounded-lg overflow-hidden">
        {/* Header Section */}

        <div className="border-b border-border">
          <div className="flex flex-col">
            {/* Title and Steps Info */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0 px-6 md:px-10 py-6 md:py-6">
              <div className="flex items-center gap-2">
               <Image src={star} alt='star' />
                <h1 className="text-2xl font-bold font-inter text-text">Getting Started</h1>
              </div>
              {/* <div className="flex items-center gap-3">
                <span className="text-base font-dm text-secondary">4 Steps Left</span>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.354 6.35354L8.35403 11.3535C8.30759 11.4 8.25245 11.4369 8.19175 11.4621C8.13105 11.4872 8.06599 11.5002 8.00028 11.5002C7.93457 11.5002 7.86951 11.4872 7.80881 11.4621C7.74811 11.4369 7.69296 11.4 7.64653 11.3535L2.64653 6.35354C2.55271 6.25972 2.5 6.13247 2.5 5.99979C2.5 5.86711 2.55271 5.73986 2.64653 5.64604C2.74035 5.55222 2.8676 5.49951 3.00028 5.49951C3.13296 5.49951 3.26021 5.55222 3.35403 5.64604L8.00028 10.2929L12.6465 5.64604C12.693 5.59958 12.7481 5.56273 12.8088 5.53759C12.8695 5.51245 12.9346 5.49951 13.0003 5.49951C13.066 5.49951 13.131 5.51245 13.1917 5.53759C13.2524 5.56273 13.3076 5.59958 13.354 5.64604C13.4005 5.69249 13.4373 5.74764 13.4625 5.80834C13.4876 5.86904 13.5006 5.93409 13.5006 5.99979C13.5006 6.06549 13.4876 6.13054 13.4625 6.19124C13.4373 6.25193 13.4005 6.30708 13.354 6.35354Z" fill="currentColor"/>
                </svg>
              </div> */}
            </div>
            
            {/* Progress Bar */}
            {/* <div className="relative w-full h-0.5">
              <div className="absolute w-full h-px bg-secondary top-1"></div>
              <div className="absolute h-0.5 bg-accent" style={{width: '247px', top: '0'}}></div>
            </div> */}
          </div>
        </div>


        {/* Steps Section */}
        <div className="flex flex-col gap-10 p-4 md:p-12">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-6">
            <div className="flex items-start gap-6 flex-1">
              <div className="flex w-14 h-14 min-w-fit flex-shrink-0 justify-center items-center rounded-2xl border border-[#296459] border-opacity-44">
                <Shield />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="text-lg font-dm text-text">Check out the tutorial</h3>
                <p className="text-sm font-dm text-muted-foreground">The best way to get started is to watch a tutorial for easy user experience throughout your starting journey with aynigma security</p>
              </div>
            </div>
            {/* <button className="min-w-max px-4 h-10 flex justify-center items-center rounded bg-accent hover:bg-accentHover active:bg-accentActive transition-colors text-dark font-dm text-sm font-normal">View Tutorial</button> */}
            <Button variant='secondary' className='bg-[#31B79D]/90 px-7' >View Tutorial</Button>
          </div>


          {/* Connector Arrow 1 */}
          <div className="pl-8 md:pl-20 -my-5">
          {/* <Image src={downArrow} alt="navigation" /> */}
          </div>


          {/* Step 2 */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-6">
            <div className="flex items-start gap-6 flex-1">
              <div className="flex w-14 h-14 min-w-fit flex-shrink-0 justify-center items-center rounded-2xl border border-[#296459] border-opacity-44">
            <Settings />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="text-lg font-dm text-text">Create a Project</h3>
                <p className="text-sm font-dm text-muted-foreground">Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste, dignissimos!</p>
              </div>
            </div>
            {/* <button className="min-w-max px-4 h-10 flex justify-center items-center rounded bg-accent hover:bg-accentHover active:bg-accentActive transition-colors text-dark font-dm text-sm font-normal">Create Project</button> */}
            <Button variant='secondary' className='bg-[#31B79D]/90 px-5'>Create Project</Button>
          </div>


          {/* Connector Arrow 2 */}
          <div className="pl-8 md:pl-20 -my-5">
                  {/* <Image src={downArrow} alt="navigation" /> */}

          </div>


          {/* Step 3 */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-6">
            <div className="flex items-start gap-6 flex-1">
              <div className="flex w-14 h-14 min-w-fit flex-shrink-0 justify-center items-center rounded-2xl border border-[#296459] border-opacity-44">
                          <FileText />

              </div>
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="text-lg font-dm text-text">Create a Custom Policy</h3>
                <p className="text-sm font-dm text-muted-foreground">Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias, autem.</p>
              </div>
            </div>
            {/* <button className="min-w-max px-4 h-10 flex justify-center items-center rounded bg-accent hover:bg-accentHover active:bg-accentActive transition-colors text-dark font-dm text-sm font-normal">Create Policy</button> */}
            <Button variant='secondary' className='bg-[#31B79D]/90 px-6'>Create Policy</Button>
          </div>


          {/* Connector Arrow 3 */}
          <div className="pl-8 md:pl-20 -my-5">
                     {/* <Image src={downArrow} alt="navigation" /> */}

          </div>


          {/* Step 4 */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-6">
            <div className="flex items-start gap-6 flex-1">
              <div className="flex w-14 h-14 min-w-fit flex-shrink-0 justify-center items-center rounded-2xl border border-[#296459] border-opacity-44">
                <Radar />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="text-lg font-dm text-text">Scan the Project</h3>
                <p className="text-sm font-dm text-muted-foreground">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Doloribus, consectetur?</p>
              </div>
            </div>
            {/* <button className="min-w-max px-4 h-10 flex justify-center items-center rounded bg-accent hover:bg-accentHover active:bg-accentActive transition-colors text-dark font-dm text-sm font-normal">Assign</button> */}
            <Button variant='secondary' className='bg-[#31B79D] px-5' >Start The Scan</Button>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  )
}


export default GettingStarted
