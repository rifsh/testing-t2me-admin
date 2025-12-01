
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ScannerApp from 'views/qr-scanner';
import jsQR from 'jsqr';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Mocking child components
jest.mock('views/qr-scanner/components/LeftContentSection', () => (props) => <div data-testid="left-section">{JSON.stringify(props)}</div>);
jest.mock('views/qr-scanner/components/RightScannerSection', () => (props) => <div data-testid="right-section">{JSON.stringify(props)}</div>);

// Mocking libraries
jest.mock('jsqr');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

describe('ScannerApp', () => {
  let navigate, dispatch;

  beforeEach(() => {
    navigate = jest.fn();
    dispatch = jest.fn();
    useNavigate.mockReturnValue(navigate);
    useDispatch.mockReturnValue(dispatch);
    useParams.mockReturnValue({ type: 'event', eventId: '123' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and dispatches scanner type', () => {
    const { getByTestId } = render(<ScannerApp />);
    expect(getByTestId('left-section')).toBeInTheDocument();
    expect(getByTestId('right-section')).toBeInTheDocument();
    expect(dispatch).toHaveBeenCalledWith({ type: 'qrVerification/setScannerType', payload: 'event' });
  });

  it('handles back button click', () => {
    const { getByTestId } = render(<ScannerApp />);
    const leftSectionProps = JSON.parse(getByTestId('left-section').textContent);
    leftSectionProps.onBack();
    expect(navigate).toHaveBeenCalledWith('/app/event/list');
  });

  it('handles successful QR code processing from file upload', async () => {
    const mockQrData = { ticketId: 'TKT123', attendeeName: 'John Doe' };
    jsQR.mockReturnValue({ data: JSON.stringify(mockQrData) });

    const { getByTestId } = render(<ScannerApp />);
    const leftSectionProps = JSON.parse(getByTestId('left-section').textContent);

    const file = new File([""], "qrcode.png", { type: "image/png" });
    const event = { target: { files: [file] } };

    await act(async () => {
        leftSectionProps.handleFileUpload(event);
      });

    await waitFor(() => {
      const updatedLeftProps = JSON.parse(getByTestId('left-section').textContent);
      expect(updatedLeftProps.extractedData.ticketId).toBe('TKT123');
      expect(updatedLeftProps.error).toBe('');
    });
  });

  it('handles QR code not found in image', async () => {
    jsQR.mockReturnValue(null);

    const { getByTestId } = render(<ScannerApp />);
    const leftSectionProps = JSON.parse(getByTestId('left-section').textContent);

    const file = new File([""], "no_qrcode.png", { type: "image/png" });
    const event = { target: { files: [file] } };

    await act(async () => {
        leftSectionProps.handleFileUpload(event);
      });

    await waitFor(() => {
      const updatedLeftProps = JSON.parse(getByTestId('left-section').textContent);
      expect(updatedLeftProps.error).toBe('No QR code found in the image');
    });
  });
});
