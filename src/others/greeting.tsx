import React from 'react';

export function getGreetingText(date: Date = new Date()): 'Good Morning' | 'Good Afternoon' | 'Good Evening' {
  const hours = date.getHours();
  if (hours < 12) return 'Good Morning';
  if (hours >= 12 && hours <= 17) return 'Good Afternoon';
  return 'Good Evening';
}

export const Greeting: React.FC = () => {
  const greeting = getGreetingText();
  return <h1 className="mb-5 text-5xl md:text-8xl font-bold text-center">{greeting}!</h1>;
};
