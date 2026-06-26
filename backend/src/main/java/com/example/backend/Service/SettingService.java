package com.example.backend.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.DTO.SettingDTO;
import com.example.backend.Entity.Setting;
import com.example.backend.Repository.SettingRepository;

@Service
public class SettingService {

    @Autowired
    private SettingRepository settingRepository;

    public List<Setting> getAllSettings() {
        return settingRepository.findAll();
    }

    @Transactional
    public void updateSettings(List<SettingDTO> settings) {
        for (SettingDTO dto : settings) {
            Optional<Setting> existing = settingRepository.findByKeyName(dto.getKeyName());
            
            if (existing.isPresent()) {
                // Nếu Key đã tồn tại -> Cập nhật giá trị
                Setting setting = existing.get();
                setting.setValueContent(dto.getValueContent());
                settingRepository.save(setting);
            } else {
                // Nếu Key chưa tồn tại -> Tạo mới
                Setting newSetting = new Setting();
                newSetting.setKeyName(dto.getKeyName());
                newSetting.setValueContent(dto.getValueContent());
                settingRepository.save(newSetting);
            }
        }
    }
}