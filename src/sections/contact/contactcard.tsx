import React from 'react'

interface Props {
    title: string;
    desc: string;
    short: string;
    linkTo: string;
    imageURL: string;
    color: string;
    id: number;
  }

const ContactCard = ({title,desc,short,linkTo,color,imageURL,id}: Props) =>  {
  const imageLink = "images/logos/" + imageURL;
  let style = "card w-full h-full " + color + " shadow-2xl transform transition duration-300 hover:scale-105";

    return (
      <div className={style}>
          <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <img src={imageLink} alt={title} className="w-8 h-8 object-contain"/>
                {title}
              </h2>
              <p className="text-sm opacity-90">{desc}</p>
              <div className="card-actions justify-end mt-auto">
                <a href={linkTo} target="_blank" rel="noreferrer">
                  <button className="btn btn-sm">{short}</button>
                </a>
              </div>
          </div>
      </div>
    )
}

export default ContactCard