import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Container,
  SearchContainer,
  SearchInput,
  Item,
  Loading,
  LoadingMore,
  ListWrapper,
  ListWrapperItem,
  SkeletonItem
} from './Items.styles';
import { useDebounce } from '../../hooks/useDebounce';

const ITEM_HEIGHT = 64; 

function Items() {
  const { 
    items, 
    pagination, 
    fetchItems, 
    searchItems, 
    isLoading, 
    error 
  } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset items when search changes
  useEffect(() => {
    if (debouncedSearch !== null) {
      searchItems(debouncedSearch);
    }
  }, [debouncedSearch, searchItems]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !pagination.hasMore) return;
    
    try {
      setIsLoadingMore(true);
      await fetchItems(pagination.page + 1, searchQuery);
    } catch (err) {
      console.error('Error loading more items:', err);
    } finally {
      setIsLoadingMore(false);
    } 
  }, [fetchItems, isLoadingMore, pagination.hasMore, searchQuery, pagination.page]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Check if an item is loaded
  const isItemLoaded = useCallback((index) => {
    return index < items.length;
  }, [items.length]);

  // Render each row
  const Row = useCallback(({ index, style }) => {
    if (!items[index]) {
      return null;
    }
    
    const item = items[index];
    
    // Apply margin to create space between items
    const itemStyle = {
      ...style,
      top: `${parseFloat(style.top) + 12}px`, // Add 12px to top (half of 24px spacing)
      height: `${parseFloat(style.height) - 12}px`, // Reduce height to account for spacing
    };
    
    return (
      <div style={itemStyle}>
        <Item>
          <Link to={`/items/${item.id}`}>
            {item.name}
          </Link>
        </Item>
      </div>
    );
  }, [items]);

  // Calculate the total number of items (including those not yet loaded)
  const itemCount = pagination.hasMore ? items.length + 1 : items.length;

  if (error) {
    return <Container>Error: {error.message}</Container>;
  }

  return (
    <Container>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </SearchContainer>

      {isLoading && !items.length ? (
        <Loading>
          {[...Array(12)].map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </Loading>
      ) : (
        <ListWrapper>
          <AutoSizer>
            {({ height, width }) => (
              <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={loadMore}
                threshold={5} // Load more items when user scrolls within 5 items from the bottom
              >
                {({ onItemsRendered, ref }) => (
                  <List
                    className="List"
                    height={height || 600} // Fallback height if AutoSizer fails
                    itemCount={itemCount}
                    itemSize={ITEM_HEIGHT}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    width={width || '100%'} // Fallback width if AutoSizer fails
                  >
                    {Row}
                  </List>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
          {isLoadingMore && <LoadingMore />}
        </ListWrapper>
      )}
    </Container>
  );
}

export default Items;
