package com.example.backend.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.Entity.Product;
import com.example.backend.Entity.User;
import com.example.backend.Entity.Wishlist;
import com.example.backend.Repository.ProductRepository;
import com.example.backend.Repository.UserRepository;
import com.example.backend.Repository.WishlistRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Wishlist> getWishlistByUser(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    public Wishlist addProductToWishlist(Long userId, Long productId) {
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            return existing.get(); // Đã có trong wishlist thì không thêm nữa
        }

        User user = userRepository.findById(userId).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);

        if (user != null && product != null) {
            Wishlist wishlist = new Wishlist();
            wishlist.setUser(user);
            wishlist.setProduct(product);
            return wishlistRepository.save(wishlist);
        }
        return null;
    }

    @Transactional
    public void removeProductFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }
}
