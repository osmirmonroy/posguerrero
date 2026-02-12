package com.taqueria.backend.service;

import com.taqueria.backend.model.Shift;
import com.taqueria.backend.model.User;
import com.taqueria.backend.repository.ShiftRepository;
import com.taqueria.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ShiftServiceTest {

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ShiftService shiftService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testOpenShift() {
        User user = new User();
        user.setId(1);
        user.setUsername("admin");
        user.setRole(com.taqueria.backend.model.Role.ADMIN);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(shiftRepository.findByUserAndStatus(user, "OPEN")).thenReturn(Optional.empty());
        when(shiftRepository.save(any(Shift.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Shift shift = shiftService.openShift(1, 100.0, null);

        assertNotNull(shift);
        assertEquals(100.0, shift.getInitialCash());
        assertNotNull(shift.getStartTime());
        assertEquals("OPEN", shift.getStatus());
        verify(shiftRepository, times(1)).save(any(Shift.class));
    }

    @Test
    void testCloseShift() {
        User user = new User();
        user.setId(1);
        user.setRole(com.taqueria.backend.model.Role.ADMIN);

        Shift openShift = new Shift();
        openShift.setId(1L);
        openShift.setUser(user);
        openShift.setInitialCash(100.0);
        openShift.setStartTime(LocalDateTime.now().minusHours(8));
        openShift.setStatus("OPEN");

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(shiftRepository.findByUserAndStatus(user, "OPEN")).thenReturn(Optional.of(openShift));
        when(shiftRepository.save(any(Shift.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Mocking logic for sales calculation if ShiftService uses it
        // For now, assuming simple close

        Shift closedShift = shiftService.closeShift(1, 500.0, "All good");

        assertNotNull(closedShift);
        assertEquals("CLOSED", closedShift.getStatus());
        assertNotNull(closedShift.getEndTime());
        assertEquals(500.0, closedShift.getFinalCashDeclared());
    }
}
