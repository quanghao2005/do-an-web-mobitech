package com.example.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.Entity.Wishlist;
import com.example.backend.Service.WishlistService;

@RestController
@RequestMapping("/api/wishlists")
@CrossOrigin(origins = "*") // Cho phép frontend gọi API
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/user/{userId}")
    public List<Wishlist> getWishlistByUser(@PathVariable Long userId) {
        return wishlistService.getWishlistByUser(userId);
    }

    @PostMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<Wishlist> addProductToWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        Wishlist wishlist = wishlistService.addProductToWishlist(userId, productId);
        if (wishlist != null) {
            return ResponseEntity.ok(wishlist);
        }
        return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<Void> removeProductFromWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        wishlistService.removeProductFromWishlist(userId, productId);
        return ResponseEntity.ok().build();
    }
}
