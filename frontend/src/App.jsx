import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import FAQs from './pages/FAQs'
import ShippingPolicy from './pages/ShippingPolicy'
import ReturnPolicy from './pages/ReturnPolicy'
import TermsConditions from './pages/TermsConditions'
import PrivacyPolicy from './pages/PrivacyPolicy'
import HelpCenter from './pages/HelpCenter'
import BlogPage from './pages/BlogPage'
import BlogDetail from './pages/BlogDetail'
import Shop from './pages/Shop'
import NewArrivalsPage from './pages/NewArrivalsPage'
import BestSellersPage from './pages/BestSellersPage'
import ProductDetails from './pages/ProductDetails'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import WishlistPage from './pages/WishlistPage'
import OffersPage from './pages/OffersPage'
import ProfilePage from './pages/ProfilePage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BottomNav from './components/navigation/BottomNav'
import ScrollToTop from './components/ScrollToTop'
import CartPage from './pages/CartPage'
import AddressPage from './pages/AddressPage'
import PaymentPage from './pages/PaymentPage'
import SuccessPage from './pages/SuccessPage'
import MyOrders from './pages/MyOrders'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import ReelsPage from './pages/ReelsPage'
import { API_BASE_URL } from './api'

function App() {
  useEffect(() => {
    // Silent wake-up call to spin up backend on Render
    fetch(`${API_BASE_URL}/wakeup`)
      .then(res => res.json())
      .then(data => console.log('Wake-up call successful:', data))
      .catch((err) => console.log('Wake-up call failed/ignored:', err)); // Fire and forget
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes (no navbar/footer) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Reels Route (Standalone overlay) */}
        <Route path="/reels/:id" element={<ReelsPage />} />
        <Route path="/reels" element={<ReelsPage />} />

        {/* Public Routes (with navbar/footer) */}
        <Route path="/*" element={
          <div className="min-h-screen">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/new-arrivals" element={<NewArrivalsPage />} />
              <Route path="/best-sellers" element={<BestSellersPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/checkout/address" element={<AddressPage />} />
              <Route path="/checkout/payment" element={<PaymentPage />} />
              <Route path="/checkout/success" element={<SuccessPage />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
            </Routes>
            <Footer />
            <BottomNav />
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
