import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import PostCard from "./PostCard";
import PostModal from "./PostModal";
import PromoModal from "./PromoModal";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [posts, setPosts] = useState([]); // 초기 상태를 빈 배열로 변경

  // 서버로부터 게시글 목록을 가져오는 함수
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`/board`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      // 서버에서 받은 이미지 경로에 서버 주소를 붙여서 완전한 URL로 만들어줍니다.
      const formattedPosts = result.data.map((post) => ({
        ...post,
        // post.image가 null이나 undefined가 아닐 경우에만 URL을 생성합니다.
        image: post.image
          ? post.image.startsWith("http://") ||
            post.image.startsWith("https://")
            ? post.image
            : `/${post.image.replace(/\\/g, "/")}`
          : null,
      }));
      setPosts(formattedPosts);
    } catch (error) {
      console.error("게시글을 불러오는 데 실패했습니다:", error);
    }
  }, []);

  // 컴포넌트가 처음 마운트될 때 게시글 목록과 프로모션 모달 상태를 설정합니다.
  useEffect(() => {
    fetchPosts();

    const shouldShowPromo = localStorage.getItem("hidePromo") !== "true";
    setShowPromo(shouldShowPromo);
  }, [fetchPosts]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddPost = async (newPostData) => {
    const formData = new FormData();
    formData.append("name", newPostData.name);
    formData.append("description", newPostData.description);
    formData.append("price", newPostData.price);
    formData.append("image", newPostData.image); // The file object

    try {
      const response = await fetch(`/board`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // 성공적으로 등록 후, 게시글 목록을 다시 불러와 갱신합니다.
      fetchPosts();
    } catch (error) {
      console.error("게시글을 등록하는 데 실패했습니다:", error);
    }
  };

  return (
    <div className="App">
      {showPromo && <PromoModal onClose={() => setShowPromo(false)} />}
      <header className="App-header">
        <h1>12번가</h1>
        <button className="write-post-button" onClick={openModal}>
          상품 등록
        </button>
      </header>
      <main className="post-list">
        {posts.map((post) => (
          <PostCard key={post.post_id} post={post} />
        ))}
      </main>
      <PostModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleAddPost}
      />
    </div>
  );
}

export default App;
