export default function LoginPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Owner Login</h1>
      <form>
        <input type="email" placeholder="Email" style={{ display: 'block', width: '100%', marginBottom: '1rem' }} />
        <input type="password" placeholder="Password" style={{ display: 'block', width: '100%', marginBottom: '1rem' }} />
        <button type="submit">Login</button>
      </form>
    </main>
  );
}
