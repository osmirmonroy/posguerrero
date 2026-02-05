package com.taqueria.backend.service;

import com.taqueria.backend.model.Shift;
import com.taqueria.backend.model.CashCut;
import com.taqueria.backend.model.User;
import com.taqueria.backend.repository.ShiftRepository;
import com.taqueria.backend.repository.CashCutRepository;
import com.taqueria.backend.repository.OrderRepository;
import com.taqueria.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ShiftService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private CashCutRepository cashCutRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public Shift openShift(Integer userId, Double initialCash) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Shift> existingShift = shiftRepository.findByUserAndStatus(user, "OPEN");
        if (existingShift.isPresent()) {
            throw new RuntimeException("User already has an open shift");
        }

        Shift shift = new Shift();
        shift.setUser(user);
        shift.setStartTime(LocalDateTime.now());
        shift.setInitialCash(initialCash);
        shift.setStatus("OPEN");

        return shiftRepository.save(shift);
    }

    public Shift closeShift(Integer userId, Double finalCashDeclared, String comments) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Shift shift = shiftRepository.findByUserAndStatus(user, "OPEN")
                .orElseThrow(() -> new RuntimeException("No open shift found for user"));

        shift.setEndTime(LocalDateTime.now());
        shift.setFinalCashDeclared(finalCashDeclared);
        shift.setComments(comments);

        Double systemSales = orderRepository.sumTotalByUserAndDateBetween(user, shift.getStartTime(),
                shift.getEndTime());
        shift.setFinalCashSystem(shift.getInitialCash() + systemSales); // Assuming all sales are cash for now. If mixed
                                                                        // payments, need filtering.

        shift.setStatus("CLOSED");

        return shiftRepository.save(shift);
    }

    public CashCut performCashCut(Long shiftId, Double declaredAmount, String notes) {
        Shift shift = shiftRepository.findById(shiftId).orElseThrow(() -> new RuntimeException("Shift not found"));

        // Calculate system amount up to now
        Double systemSales = orderRepository.sumTotalByUserAndDateBetween(shift.getUser(), shift.getStartTime(),
                LocalDateTime.now());
        Double expectedCash = shift.getInitialCash() + systemSales;

        CashCut cut = new CashCut();
        cut.setShift(shift);
        cut.setCutTime(LocalDateTime.now());
        cut.setDeclaredAmount(declaredAmount);
        cut.setSystemAmount(expectedCash);
        cut.setDifference(declaredAmount - expectedCash);
        cut.setNotes(notes);

        return cashCutRepository.save(cut);
    }

    public Optional<Shift> getCurrentShift(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return shiftRepository.findByUserAndStatus(user, "OPEN");
    }
}
