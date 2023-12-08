import React from 'react'
import PortfolioCard from './portfoliocard'
import { dataPortfolio } from './dataPortfolio'

const Portfolio = () => {
  return (
    <section id='portfolio'>
        <h1 className="mb-10 text-5xl md:text-8xl font-bold underline underline-offset-8 decoration-wavy text-gray-100 decoration-red-400">My Portfolios</h1>
        <h2 className='text-md md:text-2xl mb-10 font-semibold'>Here's some of my portfolios!!</h2>
        <div className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 justify-items-center justify-center gap-y-20 gap-x-14 mt-10 mb-5">            
            <PortfolioCard dataPortfolio={dataPortfolio}/>
        </div>
       

    </section>
  )
}

export default Portfolio
