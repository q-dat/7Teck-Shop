'use client';
import GridLoader from 'react-spinners/GridLoader';

const LoadingLocal = () => {
  return <GridLoader size={48} className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]" loading color="#e00303" />;
};
export default LoadingLocal;
