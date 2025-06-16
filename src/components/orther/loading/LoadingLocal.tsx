'use client';
import { useState, useEffect } from 'react';
import GridLoader from 'react-spinners/GridLoader';

const LoadingLocal: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  return <GridLoader size={48} className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]" loading color="#e00303" />;
};
export default LoadingLocal;
