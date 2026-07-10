export default function OrderCard({ order }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
      <h3>{order?.customerName || 'Customer'}</h3>
      <p>Status: {order?.status || 'Pending'}</p>
    </div>
  );
}
