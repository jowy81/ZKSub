// client/src/App.tsx
import { useIntMaxClient } from './hooks/useIntMaxClient';
import { CreatorDashboard } from './components/CreatorDashboard';
import { SubscriberDashboard } from './components/SubscriberDashboard';

// Main application component
function App() {
  const { client, isLoggedIn, loading, error, initializeClient, login, logout, paySubscription } = useIntMaxClient();

  if (loading) {
    return <div><p>Initializing ZKSub...</p></div>;
  }

  return (
    <div>
      {error && <div><p>Error: {error}</p></div>}
      {!client ? (
        <div>
          <h2>Welcome to ZKSub</h2>
          <button onClick={initializeClient} disabled={loading}>
            {loading ? 'Initializing...' : 'Initialize Client'}
          </button>
        </div>
      ) : !isLoggedIn ? (
        <div>
          <h2>Login to ZKSub</h2>
          <button onClick={login} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Metamask'}
          </button>
        </div>
      ) : (
        <div>
          <button onClick={logout}>Logout</button>
          <CreatorDashboard client={client} />
          <SubscriberDashboard client={client} paySubscription={paySubscription} />
        </div>
      )}
    </div>
  );
}

export default App;