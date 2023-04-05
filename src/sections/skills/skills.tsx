import React from 'react'
import { dataLogo } from './dataLogo'
import LogoCard from './logocard'

const Skills = () => {
  return (
    <div>
        <h1 className="mb-20 text-3xl md:text-6xl font-bold  text-gray-900 ">Some tools that i'm currently using...</h1>
        <div className="w-fit mx-auto grid grid-cols-3 lg:grid-cols-7 md:grid-cols-4 justify-items-center justify-center gap-y-5 gap-x-10 md:gap-y-20 md:gap-x-14 mt-10 mb-5">            
        {dataLogo.Logo.map((item, key) => {
                return(
                    <LogoCard title={item.title} imageURL={item.imageURL} kunci={key}/>
                )
            })}
        </div>
        <br/>
    </div>
  )
}

export default Skills
