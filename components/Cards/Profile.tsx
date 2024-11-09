"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const picture_path = '/shreyas.png';

const Profile = () => {
  return (
    <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] rounded-full overflow-hidden bg-gray-200 before:inset-profile1 before:absolute before:bg-primary before:transition-all before:duration-500 before:custom-animate hover:before:-inset-5 after:absolute after:inset-2 after:bg-gray-200 after:rounded-full after:z-10">
      <div className="absolute inset-5 sm:inset-6 md:inset-7 border-4 border-primary rounded-full z-30 overflow-hidden">
        <Image
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={picture_path}
          alt="Shreyas"
          width={150}
          height={150}
        />
      </div>
    </div>
  )
}

export default Profile