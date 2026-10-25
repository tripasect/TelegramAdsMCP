import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import https from 'https';

export interface TelegramAdsClientConfig {
  baseUrl?: string;
  token?: string;
  caFile?: string;
}

export class TelegramAdsClient {
  private baseUrl: string;
  private defaultToken: string | undefined;
  private http: AxiosInstance;

  constructor(config: TelegramAdsClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.TELEGRAM_ADS_BASE_URL || 'https://promoteapi.telegram.org';
    this.defaultToken = config.token || process.env.TELEGRAM_ADS_TOKEN;

    // Support system CA file (macOS / Linux) or custom CA to ensure TLS verification succeeds across all local environments
    let httpsAgent: https.Agent | undefined;
    const caPath = config.caFile || process.env.NODE_EXTRA_CA_CERTS || (fs.existsSync('/etc/ssl/cert.pem') ? '/etc/ssl/cert.pem' : undefined);
    
    if (caPath && fs.existsSync(caPath)) {
      httpsAgent = new https.Agent({
        ca: fs.readFileSync(caPath),
        keepAlive: true,
      });
    }

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      httpsAgent,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  public setToken(token: string) {
    this.defaultToken = token;
  }

  /**
   * Executes a call to the Telegram Ads API method.
   * Handles authentication token and idempotency key automatically.
   */
  public async call<T = any>(
    method: string,
    params: Record<string, any> = {},
    options: {
      httpMethod?: 'GET' | 'POST';
      token?: string;
      idempotencyKey?: string;
    } = {}
  ): Promise<T> {
    const token = options.token || this.defaultToken;
    if (!token) {
      throw new Error(
        'TELEGRAM_ADS_TOKEN is not configured. Please supply it via the environment variable TELEGRAM_ADS_TOKEN or pass access_token.'
      );
    }

    const httpMethod = options.httpMethod || 'POST';
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    // Filter out undefined and null values
    const cleanParams: Record<string, any> = {};
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        cleanParams[key] = val;
      }
    }

    const config: AxiosRequestConfig = {
      method: httpMethod,
      url: `/${method}`,
      headers,
    };

    if (httpMethod === 'GET') {
      config.params = cleanParams;
    } else {
      config.headers = {
        ...headers,
        'Content-Type': 'application/json',
      };
      config.data = cleanParams;
    }

    try {
      const response = await this.http.request<{
        ok: boolean;
        result?: T;
        error?: string;
        description?: string;
      }>(config);

      if (!response.data.ok) {
        const errorMsg = response.data.error || response.data.description || 'Unknown Telegram Ads API error';
        throw new Error(`Telegram Ads API Error: ${errorMsg}`);
      }

      return response.data.result as T;
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = errorData.error || errorData.description || JSON.stringify(errorData);
        throw new Error(`Telegram Ads API Error (${err.response.status}): ${msg}`);
      }
      throw err;
    }
  }

  /**
   * Multipart/form-data upload for photo/video creative assets.
   */
  public async uploadFile<T = any>(
    method: string,
    filePathOrBuffer: string | Buffer,
    fileName: string,
    additionalParams: Record<string, any> = {},
    options: {
      token?: string;
      idempotencyKey?: string;
    } = {}
  ): Promise<T> {
    const token = options.token || this.defaultToken;
    if (!token) {
      throw new Error('TELEGRAM_ADS_TOKEN is not configured.');
    }

    const form = new FormData();

    if (typeof filePathOrBuffer === 'string') {
      if (!fs.existsSync(filePathOrBuffer)) {
        throw new Error(`File not found at path: ${filePathOrBuffer}`);
      }
      form.append('file', fs.createReadStream(filePathOrBuffer), { filename: fileName });
    } else {
      form.append('file', filePathOrBuffer, { filename: fileName });
    }

    for (const [key, value] of Object.entries(additionalParams)) {
      if (value !== undefined && value !== null) {
        form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    }

    const headers = {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`,
      ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
    };

    try {
      const response = await this.http.post<{
        ok: boolean;
        result?: T;
        error?: string;
      }>(`/${method}`, form, { headers });

      if (!response.data.ok) {
        throw new Error(`Telegram Ads API Error: ${response.data.error || 'Upload failed'}`);
      }

      return response.data.result as T;
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = errorData.error || JSON.stringify(errorData);
        throw new Error(`Telegram Ads API Error (${err.response.status}): ${msg}`);
      }
      throw err;
    }
  }
}
