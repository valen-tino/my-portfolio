import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content rounded-t-2xl bg-stone-950">
        <div>
            <p className='text-white'>Copyright © {(new Date().getFullYear())} - All right reserved by Valentino Jehaut</p>
            <p className='text-white'>Built with 💖 using MERN Stack + DaisyUI + Vite, and hosted on Vercel</p>
        </div>
    </footer>
  )
}

export default Footer
