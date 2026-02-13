package com.taqueria.backend.service;

import com.taqueria.backend.dto.PaymentMethodStatsDTO;
import com.taqueria.backend.dto.SalesReportDTO;
import com.taqueria.backend.dto.TopProductDTO;
import com.taqueria.backend.model.Order;
import com.taqueria.backend.model.OrderItem;
import com.taqueria.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Chunk;
import com.lowagie.text.FontFactory;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class ReportService {

        @Autowired
        private OrderRepository orderRepository;

        public List<SalesReportDTO> getSalesReport(LocalDate startDate, LocalDate endDate, List<String> categories,
                        List<String> products, Long branchId) {
                // ... (Keep existing implementation logic but reuse filter)
                // For efficiency, better to use JPQL, but keeping existing Java stream logic if
                // acceptable for MVP
                // Let's duplicate the existing logic here for now, or assume it's fine.
                // Actually, I'll just restore the previous content and add new methods.
                // Wait, I am overwriting the file. I need to put back the logic code.
                // I will re-implement the existing getSalesReport based on previous `view_file`
                // content.

                List<Order> orders;
                if (branchId != null) {
                        orders = orderRepository.findByBranchIdAndIsActiveTrue(branchId);
                } else {
                        orders = orderRepository.findAllByIsActiveTrue();
                }

                // Only consider PAID orders for sales report
                orders = orders.stream()
                                .filter(o -> o.getStatus() == com.taqueria.backend.model.OrderStatus.PAID)
                                .collect(Collectors.toList());

                if (startDate != null) {
                        orders = orders.stream()
                                        .filter(o -> o.getDate() != null
                                                        && !o.getDate().toLocalDate().isBefore(startDate))
                                        .collect(Collectors.toList());
                }
                if (endDate != null) {
                        orders = orders.stream()
                                        .filter(o -> o.getDate() != null && !o.getDate().toLocalDate().isAfter(endDate))
                                        .collect(Collectors.toList());
                }

                List<SalesReportDTO> report = new ArrayList<>();

                var flattenedItems = orders.stream()
                                .flatMap(order -> order.getItems().stream()
                                                .map(item -> new ItemWithDate(order.getDate().toLocalDate(), item)))
                                .collect(Collectors.toList());

                if (categories != null && !categories.isEmpty()) {
                        flattenedItems = flattenedItems.stream()
                                        .filter(wrapper -> wrapper.item.getProduct().getCategory() != null
                                                        && categories.contains(wrapper.item.getProduct().getCategory()))
                                        .collect(Collectors.toList());
                }
                if (products != null && !products.isEmpty()) {
                        flattenedItems = flattenedItems.stream()
                                        .filter(wrapper -> products.contains(wrapper.item.getProduct().getName()))
                                        .collect(Collectors.toList());
                }

                Map<LocalDate, Map<String, List<ItemWithDate>>> grouped = flattenedItems.stream()
                                .collect(Collectors.groupingBy(
                                                w -> w.date,
                                                Collectors.groupingBy(
                                                                w -> w.item.getProduct().getCategory() != null
                                                                                ? w.item.getProduct().getCategory()
                                                                                : "Uncategorized")));

                grouped.forEach((date, catMap) -> {
                        catMap.forEach((category, items) -> {
                                long quantity = items.stream().mapToLong(w -> w.item.getQuantity()).sum();
                                double total = items.stream()
                                                .mapToDouble(w -> w.item.getProduct().getPrice() * w.item.getQuantity())
                                                .sum();
                                report.add(new SalesReportDTO(date, category, quantity, total));
                        });
                });

                return report;
        }

        private static class ItemWithDate {
                LocalDate date;
                OrderItem item;

                public ItemWithDate(LocalDate date, OrderItem item) {
                        this.date = date;
                        this.item = item;
                }
        }

        // NEW METHODS
        public List<TopProductDTO> getTopSellingProducts(LocalDate startDate, LocalDate endDate, Long branchId) {
                LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.MIN;
                LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.MAX;
                return orderRepository.findTopSellingProducts(start, end, branchId);
        }

        public List<PaymentMethodStatsDTO> getPaymentMethodStats(LocalDate startDate, LocalDate endDate,
                        Long branchId) {
                LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.MIN;
                LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.MAX;
                return orderRepository.findPaymentMethodStats(start, end, branchId);
        }

        // PDF Export
        public ByteArrayInputStream exportSalesToPdf(List<SalesReportDTO> sales) {
                Document document = new Document();
                ByteArrayOutputStream out = new ByteArrayOutputStream();

                try {
                        PdfWriter.getInstance(document, out);
                        document.open();

                        com.lowagie.text.Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
                        font.setSize(18);
                        Paragraph p = new Paragraph("Sales Report", font);
                        p.setAlignment(Paragraph.ALIGN_CENTER);
                        document.add(p);

                        document.add(Chunk.NEWLINE);

                        PdfPTable table = new PdfPTable(4);
                        table.setWidthPercentage(100);
                        table.addCell("Date");
                        table.addCell("Category");
                        table.addCell("Quantity");
                        table.addCell("Total");

                        for (SalesReportDTO sale : sales) {
                                table.addCell(sale.getDate().toString());
                                table.addCell(sale.getCategory());
                                table.addCell(sale.getQuantity().toString());
                                table.addCell(String.valueOf(sale.getTotalSales()));
                        }

                        document.add(table);
                        document.close();

                } catch (DocumentException ex) {
                        ex.printStackTrace();
                }

                return new ByteArrayInputStream(out.toByteArray());
        }

        // Excel Export
        public ByteArrayInputStream exportSalesToExcel(List<SalesReportDTO> sales) {
                try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                        Sheet sheet = workbook.createSheet("Sales");

                        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
                        String[] columns = { "Date", "Category", "Quantity", "Total" };
                        for (int i = 0; i < columns.length; i++) {
                                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                                cell.setCellValue(columns[i]);
                        }

                        int rowIdx = 1;
                        for (SalesReportDTO sale : sales) {
                                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                                row.createCell(0).setCellValue(sale.getDate().toString());
                                row.createCell(1).setCellValue(sale.getCategory());
                                row.createCell(2).setCellValue(sale.getQuantity());
                                row.createCell(3).setCellValue(sale.getTotalSales());
                        }

                        workbook.write(out);
                        return new ByteArrayInputStream(out.toByteArray());
                } catch (IOException e) {
                        throw new RuntimeException("Fail to export data to Excel file: " + e.getMessage());
                }
        }
}
