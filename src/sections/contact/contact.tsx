import React, { useState } from 'react'
import ContactCard from './contactcard'
import { dataContact } from './contactdata'
import { CMSStorage } from '../../cms/apiStorage'

const Contact = () => {
  const [formStatus, setFormStatus] = useState<{ type: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Save to API storage
    const contactEntry = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string
    };
    
    try {
      await CMSStorage.addContactEntry(contactEntry);
      setFormStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      });
      form.reset();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setFormStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      setFormStatus({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again.'
      });
    }
  };

  return (
    <div className="footer-gradient rounded-2xl">
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Contact Cards */}
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {dataContact.Contact.map((item, index) => (
                  <ContactCard 
                    key={index}
                    id={index}
                    title={item.title} 
                    color={item.color} 
                    short={item.short} 
                    desc={item.desc} 
                    linkTo={item.linkTo} 
                    imageURL={item.imageURL} 
                  />
                ))}
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="order-1 lg:order-2">
              <div className="card w-full shadow-2xl bg-base-100">
                <div className="card-body">
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-left mb-6">
                    Want me to help code your <span className='text-info'>next project?</span> Or just want to say hi? <span className='text-info'>Let's talk!</span>
                  </h3>
              {formStatus && (
                <div className={`alert mb-4 ${
                  formStatus.type === 'success' ? 'alert-success' : 'alert-error'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={formStatus.type === 'success' ? 
                        "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
                        "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      } 
                    />
                  </svg>
                    <span>{formStatus.message}</span>
                  </div>
                )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Name</span>
                      </label>
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Ex: John Appleseed" 
                        className="input input-bordered focus:input-info w-full" 
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Email</span>
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Ex: johnappleseed@apple.com" 
                        className="input input-bordered focus:input-info w-full" 
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Your Message</span>
                      </label>
                      <textarea 
                        className="textarea textarea-bordered h-32 focus:textarea-info resize-none w-full" 
                        name="message" 
                        placeholder="The person who wrote this is awesome!" 
                        required
                      ></textarea>
                    </div>
                    <div className="form-control mt-8">
                      <button type="submit" className="btn btn-info btn-lg w-full">
                        Send Message!
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
