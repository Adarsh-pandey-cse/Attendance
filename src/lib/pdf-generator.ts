
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Subject } from '@/types';
import { format } from 'date-fns';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

// This function is deprecated and its functionality is moved to generateOverallPdf.
export const generatePdf = (subject: Subject, studentName: string) => {};

export const generateOverallPdf = (subjects: Subject[], userName: string, profilePicture: string | null) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    const titleColor = '#132A52';
    const textColor = '#2d3748'; // Gray-800
    const lightTextColor = '#718096'; // Gray-500

    // --- Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(titleColor);
    doc.text('Overall Attendance Report', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    doc.setDrawColor(titleColor);
    doc.setLineWidth(0.2);
    doc.line(14, 25, doc.internal.pageSize.getWidth() - 14, 25);
    
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student Name:`, 14, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(userName, 45, 40);

    // --- Profile Picture ---
    if (profilePicture) {
        try {
            const imgX = doc.internal.pageSize.getWidth() - 50;
            const imgY = 28;
            const imgSize = 30;
            const borderRadius = imgSize / 2;

            // Draw a border circle
            doc.setDrawColor(226, 232, 240); // Slate-200
            doc.setLineWidth(1);
            doc.circle(imgX + borderRadius, imgY + borderRadius, borderRadius + 0.5);
            doc.stroke();

            // Clipping path for the image
            doc.save();
            doc.circle(imgX + borderRadius, imgY + borderRadius, borderRadius);
            doc.addImage(profilePicture, 'JPEG', imgX, imgY, imgSize, imgSize);
            doc.restore();
        } catch (error) {
            console.error("Could not add image to PDF:", error);
        }
    }


    // --- Summary Table ---
    const tableColumn = ["Subject", "Classes Attended", "Total Classes", "Percentage"];
    const tableRows: (string | number)[][] = [];

    subjects.sort((a, b) => a.name.localeCompare(b.name)).forEach(subject => {
        const percentage = subject.totalClasses > 0 ? ((subject.attendedClasses / subject.totalClasses) * 100).toFixed(1) + '%' : 'N/A';
        const row = [
            subject.name,
            subject.attendedClasses,
            subject.totalClasses,
            percentage,
        ];
        tableRows.push(row);
    });

    const totalAttended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
    const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
    const totalPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) + '%' : 'N/A';
    
    const summaryRow = [
        { content: 'Overall Total', styles: { fontStyle: 'bold', halign: 'right' }, colSpan: 1 },
        { content: totalAttended, styles: { fontStyle: 'bold', halign: 'center' } },
        { content: totalClasses, styles: { fontStyle: 'bold', halign: 'center' } },
        { content: totalPercentage, styles: { fontStyle: 'bold', halign: 'center' } },
    ];

    doc.autoTable({
        startY: 60,
        head: [tableColumn],
        body: tableRows,
        foot: [summaryRow],
        theme: 'striped',
        headStyles: { fillColor: '#132A52', textColor: '#F8FAFC', fontStyle: 'bold', halign: 'center' },
        footStyles: { fillColor: '#162F5C', textColor: '#F8FAFC', fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
        bodyStyles: { textColor: textColor, halign: 'center' },
        alternateRowStyles: { fillColor: '#F1F5F9' },
        didParseCell: function (data) {
            // Align first column (Subject name) to the left
            if (data.column.index === 0 && data.section === 'body') {
                data.cell.styles.halign = 'left';
            }
        }
    });

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(lightTextColor);
        const footerText = `Report generated on: ${format(new Date(), 'PPp')} | Page ${i} of ${pageCount}`;
        doc.text(footerText, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`Overall_Attendance_Report_${userName.replace(/ /g, '_')}.pdf`);
};
