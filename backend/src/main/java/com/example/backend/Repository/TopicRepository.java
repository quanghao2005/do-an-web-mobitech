package com.example.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.Topic;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
}
