declare module '@google/generative-ai' {
  export interface GenerativeModel {
    generateContent(prompt: string): Promise<{ response: { text(): string } }>;
  }

  export class GoogleGenerativeAI {
    constructor(apiKey: string | { apiKey?: string } | any);
    getGenerativeModel(opts: { model: string }): GenerativeModel;
  }

  export default GoogleGenerativeAI;
}
