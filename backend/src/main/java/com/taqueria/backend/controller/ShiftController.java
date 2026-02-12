package com.taqueria.backend.controller;

import com.taqueria.backend.model.CashCut;
import com.taqueria.backend.model.Shift;
import com.taqueria.backend.service.ShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.taqueria.backend.model.User;
import com.taqueria.backend.repository.UserRepository;
import java.security.Principal;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/open")
    public Shift openShift(@RequestBody java.util.Map<String, Object> payload, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Double initialCash = Double.valueOf(payload.get("initialCash").toString());
        Long branchId = payload.get("branchId") != null ? Long.valueOf(payload.get("branchId").toString()) : null;
        return shiftService.openShift(user.getId(), initialCash, branchId);
    }

    @PostMapping("/close")
    public Shift closeShift(@RequestBody java.util.Map<String, Object> payload, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Double finalCashDeclared = Double.valueOf(payload.get("finalCashDeclared").toString());
        String comments = (String) payload.get("comments");
        return shiftService.closeShift(user.getId(), finalCashDeclared, comments);
    }

    @GetMapping("/current")
    public Shift getCurrentShift(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return shiftService.getCurrentShift(user.getId()).orElse(null);
    }

    @PostMapping("/{shiftId}/cut")
    public CashCut performCashCut(@PathVariable Long shiftId, @RequestBody java.util.Map<String, Object> payload) {
        Double declaredAmount = Double.valueOf(payload.get("declaredAmount").toString());
        String notes = (String) payload.get("notes");
        return shiftService.performCashCut(shiftId, declaredAmount, notes);
    }
}
