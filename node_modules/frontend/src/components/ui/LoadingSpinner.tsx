import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  color = "primary",
  fullScreen = false,
}) => {
  const spinnerClasses = [
    "spinner",
    `spinner-${size}`,
    `spinner-${color}`,
    fullScreen ? "spinner-fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Ajout des styles en ligne pour assurer l'affichage
  const spinnerStyle = {
    display: "inline-block",
    width: size === "small" ? "20px" : size === "medium" ? "40px" : "60px",
    height: size === "small" ? "20px" : size === "medium" ? "40px" : "60px",
    border: `4px solid ${color === "primary" ? "#3b82f6" : color}`,
    borderRadius: "50%",
    borderTopColor: "transparent",
    animation: "spin 1s linear infinite",
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: fullScreen ? "100vw" : "100%",
    height: fullScreen ? "100vh" : "100%",
    position: fullScreen ? "fixed" : "relative",
    top: fullScreen ? 0 : undefined,
    left: fullScreen ? 0 : undefined,
    background: fullScreen ? "rgba(255, 255, 255, 0.8)" : "transparent",
    zIndex: fullScreen ? 9999 : undefined,
  } as React.CSSProperties;

  // Ajouter une règle CSS pour l'animation
  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className={spinnerClasses} style={spinnerStyle}></div>
    </div>
  );
};
