import React from 'react';
import './PostCard.css';

function PostCard({ post }) {
  return (
    <div className="post-card">
      <img src={post.image} alt={post.name} className="post-card-image" />
      <div className="post-card-body">
        <h2 className="post-card-title">{post.name}</h2>
        <p className="post-card-price">{post.price.toLocaleString()}원</p>
      </div>
    </div>
  );
}

export default PostCard;
