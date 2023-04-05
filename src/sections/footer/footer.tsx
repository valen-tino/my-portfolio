import React from 'react'

const Footer = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content rounded-b-2xl">
        <div>
            <p>Copyright © {(new Date().getFullYear())} - All right reserved by Valen Jehaut</p>
        </div>
    </footer>
  )
}

export default Footer
