
import { exportToPdf, exportToExcel } from 'utils/exportUtils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

jest.mock('html2canvas');
jest.mock('jspdf');
jest.mock('xlsx');

describe('exportUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportToPdf', () => {
    it('should export a PDF', async () => {
      const elementRef = { current: document.createElement('div') };
      const mockCanvas = {
        toDataURL: jest.fn(() => 'test-data-url'),
        height: 500,
        width: 1000,
      };
      html2canvas.mockResolvedValue(mockCanvas);

      await exportToPdf(elementRef, 'test.pdf');

      expect(html2canvas).toHaveBeenCalledWith(elementRef.current, { scale: 2 });
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
      expect(jsPDF).toHaveBeenCalledWith('p', 'mm', 'a4');
      const pdfInstance = jsPDF.mock.instances[0];
      expect(pdfInstance.addImage).toHaveBeenCalledWith('test-data-url', 'PNG', 0, 0, 210, 105);
      expect(pdfInstance.save).toHaveBeenCalledWith('test.pdf');
    });
  });

  describe('exportToExcel', () => {
    it('should export an Excel file', async () => {
      const table = document.createElement('table');
      const elementRef = { current: document.createElement('div') };
      elementRef.current.appendChild(table);

      const mockWorksheet = { '!cols': [] };
      const mockWorkbook = {
        Sheets: { 'Report': mockWorksheet },
        SheetNames: ['Report'],
      };

      XLSX.utils.table_to_sheet.mockReturnValue(mockWorksheet);
      XLSX.utils.book_new.mockReturnValue(mockWorkbook);

      await exportToExcel(elementRef, 'test.xlsx');

      expect(elementRef.current.querySelector).toHaveBeenCalledWith('table');
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.table_to_sheet).toHaveBeenCalledWith(table);
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(mockWorkbook, mockWorksheet, 'Report');
      expect(XLSX.writeFile).toHaveBeenCalledWith(mockWorkbook, 'test.xlsx');
    });

    it('should throw an error if no table is found', async () => {
        const elementRef = { current: document.createElement('div') };
        elementRef.current.querySelector = jest.fn(() => null);
      
        await expect(exportToExcel(elementRef)).rejects.toThrow('No data available for export!');
      });
  });
});
