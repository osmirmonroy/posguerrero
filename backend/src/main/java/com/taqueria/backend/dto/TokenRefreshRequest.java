package com.taqueria.backend.dto;

import lombok.Data;

@Data
public class TokenRefreshRequest {
    private String refreshToken;
}
