export const scrollToTopSmoothly = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};
export const scrollToTopInstantly = () => {
  window.scrollTo({
    top: 0,
  });
};
