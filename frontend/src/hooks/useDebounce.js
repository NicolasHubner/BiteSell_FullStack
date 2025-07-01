import { useState, useEffect } from "react";

export const useDebounce = (value, delay) => {
     const [debouncedSearch, setDebouncedSearch] = useState('');
    
      // Debounce search input
      useEffect(() => {
        const timerId = setTimeout(() => {
          setDebouncedSearch(value);
        }, delay);
    
        return () => {
          clearTimeout(timerId);
        };
      }, [value]);

      return debouncedSearch;
    }
