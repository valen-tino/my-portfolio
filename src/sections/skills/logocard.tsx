import React from 'react'

interface Props {
    title: string;
    imageURL: string;
    kunci: number;
  }

const LogoCard = ({title,imageURL,kunci}: Props) =>  {
const imageLink = "images/logos/" + imageURL;

  return (
        <div className="tooltip tooltip-bottom w-24 md:w-48 mx-auto rounded-2xl md:shadow-lg object-center transform transition duration-500 hover:scale-110" key={kunci} data-tip={title}>
                <div className="py-5 w-fit m-auto">
                    <img src={imageLink} className="w-28 " alt={title}/>
                </div>
        </div>
  )
}

export default LogoCard
