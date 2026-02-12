package com.taqueria.backend.dto;

import com.taqueria.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Integer id;
    private String username;
    private String password; // Only for creation/update
    private Role role;
    private Long branchId;
    private String branchName;
}
