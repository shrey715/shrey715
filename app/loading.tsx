"use client";
import React from 'react'
import { motion } from 'framer-motion'

const Loading = () => {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-primary space-y-8">
            <motion.div
                className="relative w-16 h-16"
            >
                <motion.div
                    className="absolute inset-0 border-4 border-t-4 border-t-transparent border-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-2 border-4 border-b-4 border-b-transparent border-white rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
            </motion.div>
            <motion.div
                className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: '90%' }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
                <motion.div
                    className="h-full bg-white"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
            </motion.div>
            <motion.div
                className="text-3xl font-bold text-white"
                animate={{ color: ['#ffffff', '#ff7f50', '#87ceeb', '#ffffff'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
                Welcoming....
            </motion.div>
        </div>
    )
}

export default Loading