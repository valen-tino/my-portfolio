import React from 'react'
import { dataPortfolio } from '../portfolios/dataPortfolio'

const PortfolioCard = () =>  {

  return (
    <>
      {dataPortfolio.Portfolio.map((item, key) => {
                return(
                  <div className="card bg-base-100 shadow-xl transform transition duration-500 hover:scale-90" key={key}>
                      <figure><img src={"images/portfolios/" + item.imageURL} alt={item.title} /></figure>
                          <div className="card-body">
                              <h2 className="card-title">{item.title}</h2>
                              <p className='text-sm text-left'>{item.desc}</p>
                              <div className="badge">{item.tech + ""}</div> 
                              <div className="card-actions justify-end">
                                {/* Conditionally render the button only if linkTo is not empty */}
                                {item.linkTo && (
                                  <a href={item.linkTo} target="_blank" rel="noreferrer">
                                    <button className="btn btn-primary">Click Here</button>
                                  </a>
                                )}
                              </div>
                          </div>
                  </div>
                )
            })}
    </>
       
  )
}

export default PortfolioCard
