package com.taqueria.backend.service;

import com.taqueria.backend.dto.UserDto;
import com.taqueria.backend.model.User;
import com.taqueria.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.taqueria.backend.repository.BranchRepository branchRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    public UserDto createUser(UserDto userDto) {
        var user = User.builder()
                .username(userDto.getUsername())
                .password(passwordEncoder.encode(userDto.getPassword())) // Hash password
                .role(userDto.getRole())
                .build();

        if (userDto.getBranchId() != null) {
            user.setBranch(branchRepository.findById(Long.valueOf(userDto.getBranchId())).orElse(null));
        }

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    public UserDto updateUser(Integer id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(userDto.getUsername());
        user.setRole(userDto.getRole());

        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        if (userDto.getBranchId() != null) {
            user.setBranch(branchRepository.findById(Long.valueOf(userDto.getBranchId())).orElse(null));
        } else {
            user.setBranch(null); // Allow unassigning branch
        }

        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
                // Do not return password
                .build();
    }
}
