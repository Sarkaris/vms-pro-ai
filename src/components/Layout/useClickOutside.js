import { useEffect, useRef } from 'react';

const useClickOutside = (callback) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the ref exists and the click is not on the ref's element or its children
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
};

export default useClickOutside;