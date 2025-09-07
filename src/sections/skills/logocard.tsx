import React from 'react';

interface Props {
  title: string;
  imageURL: string;
  kunci: number;
}

const LogoCard = ({ title, imageURL, kunci }: Props) => {
  // Use imageURL directly since CMS now provides full URLs
  const imageLink = imageURL;
  const titleAlt = title + ' logo';

  return (
    <div
      className="tooltip tooltip-bottom block rounded-2xl shadow-lg transform transition duration-300 hover:scale-110 bg-white/10 backdrop-blur-sm"
      data-tip={title}
    >
      <div className="aspect-square w-20 h-20 md:w-24 md:h-24 flex items-center justify-center p-3 bg-white rounded-2xl mx-auto">
        <img
          className="max-w-full max-h-full object-contain filter drop-shadow-sm"
          alt={titleAlt}
          src={imageLink}
        />
      </div>
    </div>
  );
};

export default LogoCard;
