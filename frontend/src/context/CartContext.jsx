import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const userId = localStorage.getItem("userId");
    const userCartKey = userId ? `cart_${userId}` : "cart";
    const guestCartKey = "cart";
    
    let currentCart = [];
    
    if (userId) {
      const savedUserCart = localStorage.getItem(userCartKey);
      const userItems = savedUserCart ? JSON.parse(savedUserCart) : [];
      
      const savedGuestCart = localStorage.getItem(guestCartKey);
      const guestItems = savedGuestCart ? JSON.parse(savedGuestCart) : [];
      
      if (guestItems.length > 0) {
        // Hợp nhất giỏ hàng khách vào giỏ hàng của user
        const mergedMap = new Map();
        [...userItems, ...guestItems].forEach(item => {
           const key = `${item.id}-${item.selectedColorName}`;
           if (mergedMap.has(key)) {
              mergedMap.get(key).quantity += item.quantity;
           } else {
              mergedMap.set(key, { ...item });
           }
        });
        currentCart = Array.from(mergedMap.values());
        
        // Xóa giỏ hàng khách vì đã hợp nhất thành công
        localStorage.removeItem(guestCartKey);
      } else {
        currentCart = userItems;
      }
    } else {
      // Khách vãng lai
      const savedGuestCart = localStorage.getItem(guestCartKey);
      currentCart = savedGuestCart ? JSON.parse(savedGuestCart) : [];
    }
    
    return currentCart;
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const cartKey = userId ? `cart_${userId}` : "cart";
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Hàm thêm vào giỏ (Đã nâng cấp)
   * @param product: Thông tin sp gốc
   * @param selectedColor: Object chứa { name: "Titan", image: "/images/iptitan.jpg" }
   */
  const addToCart = (product, selectedColor) => {
    // 1. Kiểm tra an toàn: Nếu selectedColor bị rỗng (do lỗi logic ở trang Detail)
    if (!selectedColor || !selectedColor.name) {
      console.error("Lỗi: Thông tin màu sắc bị thiếu!", selectedColor);
      alert("Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng!");
      return;
    }

    // Kiểm tra tổng tồn kho trước khi thêm
    const totalQuantityInCart = cartItems
      .filter(item => item.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
      
    const currentStock = product.stock || 0;
    if (totalQuantityInCart + 1 > currentStock) {
      alert(`Không thể thêm! Sản phẩm "${product.name}" chỉ còn ${currentStock} máy trong kho.`);
      return;
    }

    setCartItems(prev => {
      // 2. Tìm sản phẩm dựa trên ID và Tên Màu
      const isExist = prev.find(item => 
        item.id === product.id && item.selectedColorName === selectedColor.name
      );

      if (isExist) {
        return prev.map(item =>
          (item.id === product.id && item.selectedColorName === selectedColor.name)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }

      // 3. Thêm mới: Ưu tiên lấy ảnh màu sắc, nếu không có lấy ảnh sản phẩm chung
      return [...prev, { 
        ...product, 
        quantity: 1,
        selectedColorName: selectedColor.name,
        selectedColorImage: selectedColor.image || product.imageUrl || product.image_url
      }];
    });
    
    alert(`✅ Đã thêm ${product.name} (Màu ${selectedColor.name}) vào giỏ hàng!`);
  };

  // Cập nhật hàm xóa (Xóa phải dựa trên cả ID và Màu)
  const removeFromCart = (id, colorName) => {
    setCartItems(prev => prev.filter(item => 
      !(item.id === id && item.selectedColorName === colorName)
    ));
  };

  // Cập nhật hàm tăng giảm số lượng
  const updateQuantity = (id, colorName, amount) => {
    const targetItem = cartItems.find(item => item.id === id && item.selectedColorName === colorName);
    if (!targetItem) return;

    if (amount > 0) {
      const totalQuantityInCart = cartItems
        .filter(item => item.id === id)
        .reduce((sum, item) => sum + item.quantity, 0);
        
      const currentStock = targetItem.stock || 0;
      if (totalQuantityInCart + amount > currentStock) {
        alert(`Không thể tăng thêm! Sản phẩm "${targetItem.name}" chỉ còn ${currentStock} máy trong kho.`);
        return;
      }
    }

    setCartItems(prev => prev.map(item => 
      (item.id === id && item.selectedColorName === colorName)
        ? { ...item, quantity: Math.max(1, item.quantity + amount) } 
        : item
    ));
  };

  // Thêm hàm clearCart để xóa giỏ hàng sau khi thanh toán
  const clearCart = () => {
    setCartItems([]);
  };

  // Hàm xóa nhiều sản phẩm (đã chọn) sau khi thanh toán
  const removeMultipleFromCart = (identifiers) => {
    setCartItems(prev => prev.filter(item => 
      !identifiers.includes(`${item.id}-${item.selectedColorName}`)
    ));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, removeMultipleFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);