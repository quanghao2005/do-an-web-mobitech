package com.example.backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.Entity.Topic;
import com.example.backend.Repository.TopicRepository;

@Service
public class TopicService {

    @Autowired
    private TopicRepository topicRepository;

    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }

    public Topic getTopicById(Long id) {
        return topicRepository.findById(id).orElse(null);
    }

    public Topic createTopic(Topic topic) {
        return topicRepository.save(topic);
    }

    public Topic updateTopic(Long id, Topic topicDetails) {
        Topic topic = topicRepository.findById(id).orElse(null);
        if (topic != null) {
            topic.setName(topicDetails.getName());
            return topicRepository.save(topic);
        }
        return null;
    }

    public void deleteTopic(Long id) {
        topicRepository.deleteById(id);
    }
}
