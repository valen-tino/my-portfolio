import React from 'react'

interface Props {
    title: string;
    desc: string;
    short: string;
    linkTo: string;
    imageURL: string;
    color: string;
    key: number;
  }

const ContactCard = ({title,desc,short,linkTo,color,imageURL,key}: Props) =>  {
const imageLink = "images/logos/" + imageURL;
let style = "card md:w-96 w-full " + color + " shadow-2xl transform transition duration-500 hover:scale-90";

  return (
    <div className={style} key={key}>
        <div className="card-body">
            <h2 className="card-title"><img src={imageLink} alt={title} className="w-10"/>{title}</h2>
            <p>{desc}</p>
            <div className="card-actions justify-end">
            <a href={linkTo} target="_blank" rel="noreferrer">
              <button className="btn">{short}</button>
            </a>
            </div>
        </div>
    </div>
  )
}

export default ContactCard