export default function Navbar() {
  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem 2rem', background: '#111827', color: 'white' }}>
      <a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
      <a href="/customer" style={{ color: 'white', textDecoration: 'none' }}>Customer</a>
      <a href="/owner" style={{ color: 'white', textDecoration: 'none' }}>Owner</a>
      <a href="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</a>
    </nav>
  );
}
