import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Prescriptions from './pages/Prescriptions';
import Orders from './pages/Orders';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import AdminDashboard from './pages/Admin/Dashboard';
import ManageDrugs from './pages/Admin/ManageDrugs';
import ManageBranches from './pages/Admin/ManageBranches';
import ManageCategories from './pages/Admin/ManageCategories';
import ManageCompanies from './pages/Admin/ManageCompanies';
import InventoryManagement from './pages/Admin/InventoryManagement';
import BranchDashboard from './pages/Branch/Dashboard';
import CompanyDashboard from './pages/Company/Dashboard';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Wishlist from './components/Wishlist';
import { CartItem, Product, User } from './types';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth === 'true';
  });
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'branch' | 'company'>(() => {
    const savedRole = localStorage.getItem('userRole');
    return (savedRole as 'user' | 'admin' | 'branch' | 'company') || 'user';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Update localStorage when auth state changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    localStorage.setItem('userRole', userRole);
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [isAuthenticated, userRole, currentUser]);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const storedRole = localStorage.getItem('userRole');
    const storedUser = localStorage.getItem('currentUser');

    if (isAuth && storedRole && storedUser) {
      setIsAuthenticated(true);
      setUserRole(storedRole as 'user' | 'admin' | 'branch' | 'company');
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const toggleWishlist = (product: Product) => {
    setWishlistItems(prevItems => {
      const isInWishlist = prevItems.some(item => item.id === product.id);
      if (isInWishlist) {
        return prevItems.filter(item => item.id !== product.id);
      }
      return [...prevItems, product];
    });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setIsCheckoutOpen(false);
    setCartItems([]);
  };

  const handleSignIn = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setUserRole(user.role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserRole('user');
    setCartItems([]);
    setWishlistItems([]);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/signin" />;
  };

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated && userRole === 'admin' ? (
      <>{children}</>
    ) : (
      <Navigate to="/" />
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
          onWishlistClick={() => setIsWishlistOpen(true)}
          wishlistCount={wishlistItems.length}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          onSignOut={handleSignOut}
          currentUser={currentUser}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                searchQuery={searchQuery}
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleWishlist}
                wishlistItems={wishlistItems}
              />
            } 
          />
          <Route path="/categories" element={<Categories />} />
          <Route 
            path="/products/:categoryId" 
            element={
              <Products 
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleWishlist}
                wishlistItems={wishlistItems}
              />
            } 
          />
          <Route 
            path="/prescriptions" 
            element={
              <PrivateRoute>
                <Prescriptions />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            } 
          />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/signin" 
            element={
              isAuthenticated ? 
                <Navigate to="/profile" /> : 
                <SignIn onSignIn={handleSignIn} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? 
                <Navigate to="/profile" /> : 
                <SignUp onSignIn={handleSignIn} />
            } 
          />

          {/* ADMIN ROUTES */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/manage-drugs" 
            element={
              <AdminRoute>
                <ManageDrugs />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/manage-branches" 
            element={
              <AdminRoute>
                <ManageBranches />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/manage-categories" 
            element={
              <AdminRoute>
                <ManageCategories />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/manage-companies" 
            element={
              <AdminRoute>
                <ManageCompanies />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/inventory" 
            element={
              <AdminRoute>
                <InventoryManagement />
              </AdminRoute>
            } 
          />

          {/* OTHER DASHBOARDS */}
          <Route 
            path="/branch" 
            element={
              isAuthenticated && userRole === 'branch' ? (
                <BranchDashboard />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/company" 
            element={
              isAuthenticated && userRole === 'company' ? (
                <CompanyDashboard />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          total={cartTotal}
          onCheckout={handleCheckout}
          isAuthenticated={isAuthenticated}
        />

        {isCheckoutOpen && (
          <Checkout
            items={cartItems}
            total={cartTotal}
            onClose={() => setIsCheckoutOpen(false)}
            onComplete={handleOrderComplete}
          />
        )}

        <Wishlist
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          items={wishlistItems}
          onRemove={(productId) => {
            setWishlistItems(prev => prev.filter(item => item.id !== productId));
          }}
          onAddToCart={handleAddToCart}
        />
      </div>
    </Router>
  );
}

export default App;
