
import AuthService from 'services/AuthService';
import fetch from 'auth/FetchInterceptor';
import { ApiConstant } from 'constants/ApiConstant';
import Utils from 'utils';

// Mock the fetch interceptor
jest.mock('auth/FetchInterceptor');

// Mock the Utils module
jest.mock('utils', () => ({
  createFormData: jest.fn((data) => data), // Simple mock that returns the data
}));

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request for login', async () => {
    const data = { username: 'test', password: 'password' };
    fetch.mockResolvedValue({ data: 'success' });

    await AuthService.login(data);

    expect(fetch).toHaveBeenCalledWith({
      url: ApiConstant.LOGIN,
      method: 'post',
      data: data,
    });
  });

  it('should make a POST request for logout', async () => {
    fetch.mockResolvedValue({ data: 'success' });

    await AuthService.logout();

    expect(fetch).toHaveBeenCalledWith({
      url: ApiConstant.LOG_OUT,
      method: 'post',
    });
  });

  it('should make a POST request with FormData for register', async () => {
    const data = { username: 'newuser', thumbnail_image: 'file' };
    fetch.mockResolvedValue({ data: 'success' });

    await AuthService.register(data);

    expect(Utils.createFormData).toHaveBeenCalledWith(data, {
      fileKeys: ['thumbnail_image'],
      skipEmpty: true,
    });
    expect(fetch).toHaveBeenCalledWith({
      url: ApiConstant.LEAD_REGISTER,
      method: 'post',
      data: data, // The mocked createFormData returns the data directly
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  });

  it('should make a PUT request for verifyOtp', async () => {
    const data = { otp: '123456' };
    fetch.mockResolvedValue({ data: 'success' });

    await AuthService.verifyOtp(data);

    expect(fetch).toHaveBeenCalledWith({
      url: ApiConstant.LEAD_OTP_VERIFY,
      method: 'put',
      data: data,
    });
  });

  it('should make a POST request for ResendOtp', async () => {
    const data = { email: 'test@example.com' };
    fetch.mockResolvedValue({ data: 'success' });

    await AuthService.ResendOtp(data);

    expect(fetch).toHaveBeenCalledWith({
      url: ApiConstant.LEAD_OTP_RESEND,
      method: 'post',
      data: data,
    });
  });

  // Add more tests for TermsCondition and PostTermsCondition if needed
});
