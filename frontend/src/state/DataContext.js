import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

const buildURL = (page, search, limit) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...(search && { q: search }),
  });

  return `http://localhost:3001/api/items?${params}`;
};

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    searchQuery: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (page = 1, search = '', limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = buildURL(page, search, pagination.limit);
      
      console.log(url)
      const res = await fetch(url);

      
    
      if (!res.ok) throw new Error('Failed to fetch items');
      
      const data = await res.json();
      console.log(data)
      
      const totalItemsFetched = (page - 1) * limit + (data.items?.length || 0);
      const hasMore = totalItemsFetched < data.total;
      
      setItems(prevItems => {
        if (page === 1 || search !== pagination.searchQuery) {
          return data.items || [];
        }
        const existingIds = new Set(prevItems.map(item => item.id));
        const newItems = (data.items || []).filter(item => !existingIds.has(item.id));
        return [...prevItems, ...newItems];
      });
      
      const newPagination = {
        page: data.page,
        total: data.total,
        totalPages: Math.ceil(data.total / limit),
        searchQuery: search,
        hasMore,
        limit
      };
      
      setPagination(prev => ({
        ...prev,
        ...newPagination
      }));

      const result = { 
        data, 
        total: data.total, 
        currentPage: data.page, 
        totalPages: Math.ceil(data.total / limit),
        hasMore
      };
      
      return result;
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pagination.searchQuery]); // Only depend on searchQuery from pagination

  const searchItems = useCallback((query, page = 1) => {
    return fetchItems(page, query);
  }, [fetchItems]);

  return (
    <DataContext.Provider value={{ 
      items, 
      fetchItems, 
      pagination, 
      searchItems,
      isLoading,
      error
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};