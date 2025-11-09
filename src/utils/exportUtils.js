import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Create beautifully formatted Excel workbooks with professional styling
 */

// Define column widths for better readability
const COLUMN_WIDTHS = {
  summary: { A: 25, B: 35 },
  visitors: { A: 15, B: 20, C: 20, D: 15, E: 15, F: 25, G: 20, H: 25, I: 15, J: 25, K: 15 },
  analytics: { A: 20, B: 15, C: 15, D: 25, E: 20 }
};

/**
 * Create a formatted cell style
 */
const createCellStyle = (bgColor = '#FFFFFF', fontColor = '#000000', bold = false, alignment = 'left') => {
  return {
    fill: { fgColor: { rgb: bgColor } },
    font: { bold, color: { rgb: fontColor } },
    alignment: { horizontal: alignment, vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'E0E0E0' } },
      bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
      left: { style: 'thin', color: { rgb: 'E0E0E0' } },
      right: { style: 'thin', color: { rgb: 'E0E0E0' } }
    }
  };
};

/**
 * Export visitors data to Excel with professional formatting
 */
export const exportVisitorsToExcel = (visitors, filename) => {
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    
    // Create header
    const headers = [
      ['VISITOR MANAGEMENT SYSTEM - VISITORS REPORT'],
      [''],
      ['Report Generated:', new Date().toLocaleString()],
      ['Total Visitors:', visitors.length],
      [''],
      ['Visitor Details'],
      [''],
      ['No', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Purpose', 'Department', 'Status', 'Check In Time', 'Check Out Time', 'Duration (min)', 'Badge ID']
    ];
    
    // Add headers
    headers.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        ws[cellAddress] = { v: cell, t: typeof cell === 'string' ? 's' : 'n' };
        
        // Style headers
        if (rowIndex === 0) {
          ws[cellAddress].s = {
            fill: { fgColor: { rgb: '4F46E5' } },
            font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        } else if (rowIndex === 7) {
          ws[cellAddress].s = {
            fill: { fgColor: { rgb: '6366F1' } },
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'medium', color: { rgb: '4F46E5' } },
              bottom: { style: 'medium', color: { rgb: '4F46E5' } },
              left: { style: 'thin', color: { rgb: '4F46E5' } },
              right: { style: 'thin', color: { rgb: '4F46E5' } }
            }
          };
        }
      });
    });
    
    // Add visitor data with alternating row colors
    const startRow = 8;
    visitors.forEach((visitor, index) => {
      const checkInTime = visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : 'N/A';
      const checkOutTime = visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : 'N/A';
      
      // Calculate duration
      let duration = 'N/A';
      if (visitor.checkInTime && visitor.checkOutTime) {
        const checkIn = new Date(visitor.checkInTime);
        const checkOut = new Date(visitor.checkOutTime);
        duration = Math.round((checkOut - checkIn) / (1000 * 60)); // minutes
      } else if (visitor.checkInTime) {
        const checkIn = new Date(visitor.checkInTime);
        const now = new Date();
        duration = Math.round((now - checkIn) / (1000 * 60)); // minutes
      }
      
      const rowData = [
        index + 1,
        visitor.firstName || '',
        visitor.lastName || '',
        visitor.email || '',
        visitor.phone || '',
        visitor.company || '',
        visitor.purpose || '',
        visitor.department || '',
        visitor.status || '',
        checkInTime,
        checkOutTime,
        duration,
        visitor.badgeId || ''
      ];
      
      rowData.forEach((cell, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: startRow + index, c: colIndex });
        ws[cellAddress] = { v: cell, t: typeof cell === 'string' ? 's' : 'n' };
        
        // Alternate row colors
        const bgColor = index % 2 === 0 ? 'F9FAFB' : 'FFFFFF';
        const statusColor = visitor.status === 'Checked In' ? '10B981' : 
                           visitor.status === 'Checked Out' ? '6B7280' : 'EF4444';
        
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: bgColor } },
          font: { color: { rgb: '1F2937' } },
          alignment: { horizontal: 'left', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'E0E0E0' } },
            bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
            left: { style: 'thin', color: { rgb: 'E0E0E0' } },
            right: { style: 'thin', color: { rgb: 'E0E0E0' } }
          }
        };
        
        // Special styling for status column
        if (colIndex === 8) {
          ws[cellAddress].s.fill.fgColor.rgb = statusColor;
          ws[cellAddress].s.font.color.rgb = 'FFFFFF';
          ws[cellAddress].s.font.bold = true;
        }
      });
    });
    
    // Set column widths
    ws['!cols'] = Object.entries(COLUMN_WIDTHS.visitors).map(([key, width]) => ({
      wch: width
    }));
    
    XLSX.utils.book_append_sheet(wb, ws, 'Visitors');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${filename || 'Visitors-Report'}-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting visitors to Excel:', error);
    throw error;
  }
};

/**
 * Export analytics data to Excel with charts and professional formatting
 */
export const exportAnalyticsToExcel = (analyticsData, metrics, filename) => {
  try {
    const wb = XLSX.utils.book_new();
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // 1. Executive Summary Sheet
    const summaryData = [
      ['VISITOR MANAGEMENT SYSTEM', '', '', ''],
      ['COMPREHENSIVE ANALYTICS REPORT', '', '', ''],
      ['', '', '', ''],
      ['Report Information', '', '', ''],
      ['Generated On', today.toLocaleString(), '', ''],
      ['Report Type', 'Analytics', '', ''],
      ['', '', '', ''],
      ['Key Performance Indicators', '', '', ''],
      ['Total Visitors', metrics.totalVisitors || 0, '', ''],
      ['Current Active Visitors', metrics.currentVisitors || 0, '', ''],
      ['Average Visit Duration (minutes)', (metrics.avgDuration || 0).toFixed(1), '', ''],
      ['Peak Hour', `${metrics.peakHour || 0}:00`, '', ''],
      ['Average Visitors per Hour', ((metrics.totalVisitors || 0) / 24).toFixed(1), '', ''],
      ['', '', '', ''],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style summary header
    ['A1:B1'].forEach(range => {
      const rangeObj = XLSX.utils.decode_range(range);
      for (let c = rangeObj.s.c; c <= rangeObj.e.c; c++) {
        for (let r = rangeObj.s.r; r <= rangeObj.e.r; r++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c });
          if (!summarySheet[cellAddress]) summarySheet[cellAddress] = { v: '', t: 's' };
          summarySheet[cellAddress].s = {
            fill: { fgColor: { rgb: '4F46E5' } },
            font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center' }
          };
        }
      }
    });
    
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Executive Summary');
    
    // 2. Department Analysis Sheet
    if (analyticsData.departmentData && analyticsData.departmentData.length > 0) {
      const deptData = [
        ['Department Analysis', '', '', ''],
        ['Rank', 'Department', 'Total Visits', 'Percentage', 'Trend'],
        ...analyticsData.departmentData.map((dept, index) => [
          index + 1,
          dept.name,
          dept.count,
          `${dept.percentage}%`,
          index === 0 ? '🔥 Highest Traffic' : '📊 Normal'
        ])
      ];
      
      const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
      deptSheet['!cols'] = [{ wch: 8 }, { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, deptSheet, 'Department Analysis');
    }
    
    // 3. Purpose Analysis Sheet
    if (analyticsData.purposeData && analyticsData.purposeData.length > 0) {
      const purposeData = [
        ['Visit Purpose Analysis', '', '', ''],
        ['Rank', 'Purpose', 'Total Visits', 'Percentage', 'Priority'],
        ...analyticsData.purposeData.map((purpose, index) => [
          index + 1,
          purpose.name,
          purpose.count,
          `${purpose.percentage}%`,
          purpose.percentage > 20 ? '🔴 High' : purpose.percentage > 10 ? '🟡 Medium' : '🟢 Low'
        ])
      ];
      
      const purposeSheet = XLSX.utils.aoa_to_sheet(purposeData);
      purposeSheet['!cols'] = [{ wch: 8 }, { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, purposeSheet, 'Purpose Analysis');
    }
    
    // 4. Hourly Analysis Sheet
    if (analyticsData.hourlyData && analyticsData.hourlyData.length > 0) {
      const hourlyData = [
        ['Hourly Visitor Distribution', '', ''],
        ['Hour', 'Visitors', 'Category'],
        ...analyticsData.hourlyData.map(hour => [
          hour.hour,
          hour.count,
          hour.count > 15 ? 'Peak' : hour.count > 8 ? 'Normal' : 'Quiet'
        ])
      ];
      
      const hourlySheet = XLSX.utils.aoa_to_sheet(hourlyData);
      hourlySheet['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, hourlySheet, 'Hourly Analysis');
    }
    
    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${filename || 'Analytics-Report'}-${dateStr}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting analytics to Excel:', error);
    throw error;
  }
};

/**
 * Export dashboard data to Excel
 */
export const exportDashboardToExcel = (dashboardData, filename) => {
  try {
    const wb = XLSX.utils.book_new();
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // Dashboard Summary
    const summaryData = [
      ['DASHBOARD SUMMARY', '', '', ''],
      ['Generated On', today.toLocaleString(), '', ''],
      ['', '', '', ''],
      ['Current Statistics', '', '', ''],
      ['Current Visitors', dashboardData.currentVisitors || 0, '', ''],
      ['Today Total Visitors', dashboardData.todayVisitors || 0, '', ''],
      ['Overdue Visitors', dashboardData.overdueCount || 0, '', ''],
      ['Active Emergencies', dashboardData.activeEmergencies || 0, '', ''],
      ['', '', '', ''],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Dashboard');
    
    // Add department breakdown if available
    if (dashboardData.departmentData && dashboardData.departmentData.length > 0) {
      const deptData = [
        ['Department Breakdown', '', ''],
        ['Department', 'Count', 'Percentage'],
        ...dashboardData.departmentData.map(dept => [
          dept.name,
          dept.count,
          `${dept.percentage}%`
        ])
      ];
      
      const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
      deptSheet['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, deptSheet, 'Departments');
    }
    
    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${filename || 'Dashboard-Report'}-${dateStr}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting dashboard to Excel:', error);
    throw error;
  }
};

/**
 * Export to CSV
 */
export const exportToCSV = (data, filename, headers = null) => {
  try {
    const csvHeaders = headers || Object.keys(data[0] || {});
    let csv = headers ? headers.join(',') + '\n' : csvHeaders.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers ? headers.map(h => row[h] || '') : csvHeaders.map(h => row[h] || '');
      csv += values.map(v => `"${v}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};
