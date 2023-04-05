import React from 'react'
import ContactCard from './contactcard'
import { dataContact } from './contactdata'

const Contact = () => {
  return (
    <section id="contact">
            <div className="hero min-h-screen footer-bg rounded-tr-2xl rounded-tl-2xl ">
        <div className="hero-content flex-col lg:flex-row-reverse">
            <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                <div className="card-body">
                <h1 className="text-6xl font-bold text-left">Lets get in touch!</h1>
                <form target="_blank" action="https://formsubmit.co/7000729890d176e2700b8aa469567282" method="POST">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Name</span>
                        </label>
                        <input type="text" placeholder="Ex: John Appleseed" className="input input-bordered" required/>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input type="email" placeholder="Ex: johnappleseed@apple.com" className="input input-bordered" required/>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Your Message</span>
                        </label>
                        <textarea className="textarea textarea-bordered h-24" name="message" placeholder="The person who write this is awesome" required></textarea>
                    </div>
                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary">Send Now!</button>
                    </div>
                </form>
                    
                </div>
            </div>
            &nbsp;

            <div className='grid grid-rows-4 md:grid-rows-2 grid-flow-col gap-4 text-left'>
                {dataContact.Contact.map((item, key) => {
                    return(
                        <ContactCard 
                        title={item.title} 
                        color={item.color} 
                        short={item.short} 
                        desc={item.desc} 
                        linkTo={item.linkTo} 
                        imageURL={item.imageURL} 
                        key={key}/>
                    )
                })}
                
            </div>
            
        </div>
    </div>
    </section>

  )
}

export default Contact
