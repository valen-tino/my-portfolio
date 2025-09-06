import React from 'react';

export const Greeting: React.FC = () => {
  const myDate = new Date();
  const hours = myDate.getHours();
  let greet;

  if (hours < 12) greet = 'morning';
  else if (hours >= 12 && hours <= 17) greet = 'afternoon';
  else greet = 'evening';

  return <h1 className="mb-5 text-5xl md:text-8xl font-bold">Good {greet}!</h1>;
};

