
import AppInfoService from 'services/AppInfoService';
import fetch from 'auth/FetchInterceptor';
import { ApiConstant } from 'constants/ApiConstant';

// Mock the fetch interceptor
jest.mock('auth/FetchInterceptor');

// Mock global fetch
global.fetch = jest.fn();

describe('AppInfoService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInfo', () => {
    it('should fetch app info', async () => {
      const mockData = { info: 'test' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await AppInfoService.getInfo();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(ApiConstant.BUCKET_INFO_KEY),
        expect.any(Object)
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('uploadImageToCdn', () => {
    it('should upload an image to CDN', async () => {
      const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const presignedResponse = {
        data: [
          {
            upload_url: 'http://s3.upload.url',
            public_url: 'http://s3.public.url',
            key: 'image-key',
          },
        ],
      };

      fetch.mockResolvedValueOnce(presignedResponse);
      global.fetch.mockResolvedValueOnce({ ok: true });

      const result = await AppInfoService.uploadImageToCdn(file);

      expect(fetch).toHaveBeenCalledWith({
        url: ApiConstant.GENERATE_PRESIGNED_MEDIA_URL,
        method: 'get',
        params: {
          module_name: 'info',
          media_type: 'image',
          file_name: 'test.jpg',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith('http://s3.upload.url', {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: file,
      });

      expect(result.public_url).toBe('http://s3.public.url');
    });
  });

  describe('updateInfo', () => {
    it('should update app info', async () => {
      const data = { enabled: true };
      const presignedResponse = {
        data: [
          {
            upload_url: 'http://s3.upload.url',
            public_url: 'http://s3.public.url',
          },
        ],
      };

      fetch.mockResolvedValueOnce(presignedResponse);
      global.fetch.mockResolvedValueOnce({ ok: true });

      const result = await AppInfoService.updateInfo(data);

      expect(fetch).toHaveBeenCalledWith({
        url: ApiConstant.GENERATE_PRESIGNED_URL_LAYOUT_JSON,
        method: 'get',
        params: {
          module_name: 'info',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://s3.upload.url',
        expect.any(Object)
      );

      expect(result.public_url).toBe('http://s3.public.url');
    });
  });
});
