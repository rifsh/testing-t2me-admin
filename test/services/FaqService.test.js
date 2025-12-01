
import FaqService from 'services/FaqService';
import fetch from 'auth/FetchInterceptor';
import { ApiConstant } from 'constants/ApiConstant';

// Mock the fetch interceptor
jest.mock('auth/FetchInterceptor');

// Mock global fetch
global.fetch = jest.fn();

describe('FaqService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFaqs', () => {
    it('should fetch FAQs', async () => {
      const mockData = { faqs: ['faq1'] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await FaqService.getFaqs();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(ApiConstant.BUCKET_FAQ_KEY),
        expect.any(Object)
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('createFaq', () => {
    it('should create a new FAQ', async () => {
      const faqData = { question: 'new q', answer: 'new a' };
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

      const result = await FaqService.createFaq(faqData);

      expect(fetch).toHaveBeenCalledWith({
        url: ApiConstant.GENERATE_PRESIGNED_URL_LAYOUT_JSON,
        method: 'get',
        params: {
          module_name: 'faq',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith('http://s3.upload.url', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
      });

      expect(result.public_url).toBe('http://s3.public.url');
    });
  });
});
