
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Subject } from '@/types';
import { format } from 'date-fns';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

export const generatePdf = (subject: Subject, studentName: string) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const percentage = subject.totalClasses > 0 ? (subject.attendedClasses / subject.totalClasses) * 100 : 0;
    const absentClasses = subject.totalClasses - subject.attendedClasses;

    // Header
    doc.setFontSize(20);
    doc.text('Attendance Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Student: ${studentName}`, 14, 32);
    doc.text(`Subject: ${subject.name}`, 14, 40);

    // Stats
    doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
            ['Total Classes', subject.totalClasses],
            ['Classes Attended', subject.attendedClasses],
            ['Classes Absent', absentClasses],
            ['Attendance %', `${percentage.toFixed(2)}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [60, 179, 113] }, // Emerald Green
    });
    
    // History
    const tableColumn = ["Date", "Time", "Status"];
    const tableRows: (string | number)[][] = [];

    subject.history
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach(log => {
            const logDate = new Date(log.timestamp);
            const row = [
                format(logDate, 'PPP'),
                format(logDate, 'p'),
                log.status.charAt(0).toUpperCase() + log.status.slice(1),
            ];
            tableRows.push(row);
        });
    
    doc.autoTable({
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [60, 179, 113] },
    });


    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        const footerText = `Generated on: ${format(new Date(), 'PPp')} | Page ${i} of ${pageCount}`;
        doc.text(footerText, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`${subject.name}_attendance_report.pdf`);
};
