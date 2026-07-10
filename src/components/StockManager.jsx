export default function StockManager({ product }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
      <h3>{product?.name || 'Product'}</h3>
      <p>Stock: {product?.stock ?? 0}</p>
    </div>
  );
}
