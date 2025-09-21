import React, { useEffect, useState } from 'react';

const quotes = [
  'Simplicity is the soul of efficiency. – Austin Freeman',
  'Code is like humor. When you have to explain it, it’s bad. – Cory House',
  'Any sufficiently advanced technology is indistinguishable from magic. – Arthur C. Clarke'
];

const QuoteWidget: React.FC = () => {
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return <blockquote style={{ padding: '4px' }}>{quote}</blockquote>;
};

export default QuoteWidget;
