/**
 * Main App Component with Routing
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Ingest } from './pages/Ingest';
import { Processing } from './pages/Processing';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Review } from './pages/Review';
import { Sources } from './pages/Sources';
import { Analytics } from './pages/Analytics';
import { Output } from './pages/Output';
import { Settings } from './pages/Settings';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ingest" element={<Ingest />} />
      <Route path="/processing" element={<Processing />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/review" element={<Review />} />
      <Route path="/sources" element={<Sources />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/output" element={<Output />} />
      <Route path="/settings" element={<Settings />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
