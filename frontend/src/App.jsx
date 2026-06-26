import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
    </CartProvider>
  );
}
export default App;