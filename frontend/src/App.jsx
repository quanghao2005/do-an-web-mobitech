import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart"; 
import { CartProvider } from './context/CartContext'; 
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import ChatBot from "./components/ChatBot";
import AdminCustomer from './pages/AdminCustomer'; 
import AdminCategory from './pages/AdminCategory';
import AdminBanner from './pages/AdminBanner';
import AdminReview from './pages/AdminReview';
import OrderHistory from './pages/OrderHistory';
import Contact from './pages/Contact';
import AdminContact from './pages/AdminContact';
// Đã sửa lại đường dẫn import cho đúng thư mục pages
import PromoPage from './pages/PromoPage'; 
import WelcomePopup from './pages/WelcomePopup';
import ForgotPassword from './pages/ForgotPassword';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Wishlist from './pages/Wishlist';

function Layout({ children }) {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/admin');
  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}
function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Layout>
          
          {/* Đặt WelcomePopup ở đây để nó tự động chạy ngầm và bật lên khi khách vào web */}
          <WelcomePopup />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin/customers" element={<AdminCustomer />} />
            <Route path="/admin/categories" element={<AdminCategory />} />
            <Route path="/admin/banners" element={<AdminBanner />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin/reviews" element={<AdminReview />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/contacts" element={<AdminContact />} />
            
            {/* Trang săn Voucher */}
            <Route path="/promotions" element={<PromoPage />} />
            
            {/* Tin tức (Blog) */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />

            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
          </Routes>
          
          <ChatBot />
        </Layout>
      </BrowserRouter>
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
            color: '#1f2937',
            padding: '16px 24px',
            borderRadius: '16px',
            fontSize: '15px',
            fontWeight: '600',
            letterSpacing: '0.3px',
            fontFamily: '"Inter", sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </CartProvider>
  );
}
export default App;