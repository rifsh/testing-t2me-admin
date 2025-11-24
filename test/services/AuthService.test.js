import AuthService from "../../src/services/AuthService";
import fetch from "auth/FetchInterceptor";
import Utils from "utils";
import { ApiConstant } from "constants/ApiConstant";
import { CDN_ASSETS_PATH } from "configs/AppConfig";

jest.mock("auth/FetchInterceptor");
jest.spyOn(Utils, "createFormData").mockImplementation(() => "mockFormData");

global.fetch = jest.fn();

describe("AuthService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --------------------------
    // LOGIN
    // --------------------------
    test("login() should call fetch with correct payload", () => {
        fetch.mockResolvedValue({ data: "success" });

        AuthService.login({ email: "test@mail.com", password: "1234" });

        expect(fetch).toHaveBeenCalledWith({
            url: ApiConstant.LOGIN,
            method: "post",
            data: { email: "test@mail.com", password: "1234" },
        });
    });

    // --------------------------
    // LOGOUT
    // --------------------------
    test("logout() should call fetch with correct config", () => {
        AuthService.logout();
        expect(fetch).toHaveBeenCalledWith({
            url: ApiConstant.LOG_OUT,
            method: "post",
        });
    });

    // --------------------------
    // REGISTER (multipart)
    // --------------------------
    test("register() should create form data and send multipart request", () => {
        AuthService.register({ name: "rifash" });

        expect(Utils.createFormData).toHaveBeenCalledWith(
            { name: "rifash" },
            {
                fileKeys: ["thumbnail_image"],
                skipEmpty: true,
            }
        );

        expect(fetch).toHaveBeenCalledWith({
            url: ApiConstant.LEAD_REGISTER,
            method: "post",
            data: "mockFormData",
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    });

    // --------------------------
    // VERIFY OTP
    // --------------------------
    test("verifyOtp() should call fetch with correct payload", () => {
        AuthService.verifyOtp({ otp: 1234 });
        expect(fetch).toHaveBeenCalledWith({
            url: ApiConstant.LEAD_OTP_VERIFY,
            method: "put",
            data: { otp: 1234 },
        });
    });

    // --------------------------
    // RESEND OTP
    // --------------------------
    test("ResendOtp() should call fetch with correct payload", () => {
        AuthService.ResendOtp({ phone: "9876543210" });
        expect(fetch).toHaveBeenCalledWith({
            url: ApiConstant.LEAD_OTP_RESEND,
            method: "post",
            data: { phone: "9876543210" },
        });
    });

    // --------------------------
    // TERMS & CONDITIONS (GET JSON)
    // --------------------------
    test("TermsCondition() should fetch JSON successfully", async () => {
        const mockResponse = { terms: "sample" };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await AuthService.TermsCondition();

        expect(global.fetch).toHaveBeenCalledWith(
            `${CDN_ASSETS_PATH}${ApiConstant.BUCKET_TERMS_KEY}`,
            expect.objectContaining({
                method: "GET",
            })
        );

        expect(result).toEqual(mockResponse);
    });

    test("TermsCondition() should throw error on non-OK response", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        await expect(AuthService.TermsCondition()).rejects.toThrow(
            "HTTP error! status: 500"
        );
    });

    // --------------------------
    // POST TERMS CONDITIONS (PRESIGNED UPLOAD FLOW)
    // --------------------------
    test("PostTermsCondition() uploads using presigned URL successfully", async () => {
        const presignedData = {
            data: [
                {
                    upload_url: "https://upload.com/file.json",
                    public_url: "https://cdn.com/file.json",
                },
            ],
        };

        fetch.mockResolvedValueOnce(presignedData);

        global.fetch.mockResolvedValueOnce({
            ok: true,
        });

        const payload = { content: "hello" };

        const result = await AuthService.PostTermsCondition(payload);

        expect(fetch).toHaveBeenCalledWith({
            url: ApiConstant.GENERATE_PRESIGNED_URL_LAYOUT_JSON,
            method: "get",
            params: { module_name: "terms" },
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://upload.com/file.json",
            expect.objectContaining({
                method: "PUT",
                body: JSON.stringify(payload),
            })
        );

        expect(result).toEqual({
            data: payload,
            public_url: "https://cdn.com/file.json",
            status: {
                message: "FAQ uploaded successfully",
                status_code: "00000",
            },
        });
    });

    test("PostTermsCondition() should throw error when presigned URL is missing", async () => {
        fetch.mockResolvedValueOnce({ data: [{}] });

        await expect(AuthService.PostTermsCondition({})).rejects.toThrow(
            "Failed to get presigned URL"
        );
    });

    test("PostTermsCondition() should throw error when upload fails", async () => {
        fetch.mockResolvedValueOnce({
            data: [{ upload_url: "https://upload.com/file.json" }],
        });

        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 403,
        });

        await expect(AuthService.PostTermsCondition({})).rejects.toThrow(
            "Upload failed with status: 403"
        );
    });
});
