import styled from 'styled-components';

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

export const SearchContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
`;

export const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-grow: 1;
  font-size: 16px;
`;

export const ItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ListWrapper = styled.div`
  flex: 1;
  height: calc(100vh - 180px); 
  min-height: 300px;
  width: 100%;
  padding: 12px 0;
  box-sizing: border-box;
`;

export const Item = styled.div`
  padding: 24px 12px;
  border: 1.5px solid #ccc;
  border-radius: 12px;
  box-sizing: border-box;
  height: 50px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
  
  a {
    color: #333;
    text-decoration: none;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    
    &:hover {
      color: #007bff;
    }
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

export const SkeletonItem = styled.div`
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
  width: 100%;
  
  ${SkeletonItem} {
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const LoadingMore = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  width: 100%;
  
  &::after {
    content: '';
    width: 48px;
    height: 48px;
    border: 4px solid #ccc;
    border-top-color: #007AFF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
