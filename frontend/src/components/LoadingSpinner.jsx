export default function LoadingSpinner({ fullPage = false }) {
  return (
    <div className={`spinner-container ${fullPage ? "full-page" : ""}`}>
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}