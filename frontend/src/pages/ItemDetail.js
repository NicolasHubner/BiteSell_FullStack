import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    //Had to add the http://localhost:3001/api/items/ to make it work
    fetch('http://localhost:3001/api/items/' + id)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setItem)
      .catch((error) => {
        console.error('Error fetching item:', error);
        navigate('/');
      });
  }, [id, navigate]);

  if (!item) return <p>Loading...</p>;

  return (
    <div style={{padding: 16}}>
      <h2>{item.name}</h2>
      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Price:</strong> ${item.price}</p>
    </div>
  );
}

export default ItemDetail;