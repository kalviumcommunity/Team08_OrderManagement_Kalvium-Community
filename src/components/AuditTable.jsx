export default function AuditTable({ logs = [] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Reason</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>Change</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <tr key={index}>
            <td style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>{log.reason}</td>
            <td style={{ borderBottom: '1px solid #ddd', padding: '0.5rem' }}>{log.change}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
