import React, { useState } from "react";
import "./PromoModal.css";

function PromoModal({ onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("hidePromo", "true");
    }
    onClose();
  };

  return (
    <div className="promo-modal-overlay">
      <div className="promo-modal-content">
        <h2>🎉 12번가 화이트세러데이 🎉</h2>
        <p>매월 단 한 번, 상상 초월의 할인이 찾아옵니다!</p>
        <div className="promo-modal-actions">
          <label>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            다시 보지 않기
          </label>
          <button onClick={handleClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default PromoModal;
