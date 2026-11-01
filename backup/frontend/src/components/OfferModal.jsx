import { useEffect, useState } from "react";
import { itemPath, popupAPI } from "../services/api";

export function OfferModal({ ctaText, onCtaClick, handleClose }) {
  const [popupData, setPopupData] = useState(null);

  const getPopups = async () => {
    try {
      const { data: res } = await popupAPI.getActive();
      setPopupData(res.data);
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getPopups();
  }, []);

  const popup = Array.isArray(popupData) ? popupData[0] : popupData;
  const imageSrc = popup?.photo;
  const imageAlt = popup?.title || "Special offer";

  if (!popup || !imageSrc) {
    return null;
  }

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      zIndex: 9999,
    },
    modal: {
      position: "relative",
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      overflow: "hidden",
      width: "100%",
      maxWidth: "480px",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
    },
    closeButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      border: "none",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      color: "#ffffff",
      fontSize: "20px",
      lineHeight: "1",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    image: {
      display: "block",
      width: "100%",
      height: "auto",
      maxHeight: "70vh",
      objectFit: "contain",
      backgroundColor: "#f3f3f3",
    },
    footer: {
      padding: "14px 16px",
      display: "flex",
      justifyContent: "center",
    },
    ctaButton: {
      width: "100%",
      padding: "12px 16px",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#d62828",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  return (
    <div
      style={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Offer"
    >
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          style={styles.closeButton}
          onClick={handleClose}
          aria-label="Close offer"
        >
          &times;
        </button>

        <img src={`${itemPath}/${imageSrc}`} alt={imageAlt} style={styles.image} />

        {ctaText && (
          <div style={styles.footer}>
            <button type="button" style={styles.ctaButton} onClick={onCtaClick}>
              {ctaText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
