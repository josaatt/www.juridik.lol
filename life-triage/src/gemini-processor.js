import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProcessor {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
  }

  async analyzeContent(content) {
    const { text, images, attachments } = content;

    const prompt = `Du är en AI-assistent som triagerar innehåll i mitt liv. Analysera följande innehåll och extrahera relevant information.

INNEHÅLL:
${text}

Analysera och returnera ett JSON-objekt med följande struktur:
{
  "type": "task|note|idea|meeting|decision|journal|invoice|receipt|other",
  "category": "work|personal|health|finance|relationships|learning|home|other",
  "priority": "urgent|high|medium|low",
  "title": "En kort sammanfattande titel (max 60 tecken)",
  "summary": "En kort sammanfattning av innehållet",
  "extractedData": {
    "dates": ["YYYY-MM-DD"], // om några datum nämns
    "people": ["namn"], // om några personer nämns
    "locations": ["platser"], // om några platser nämns
    "amounts": [{"value": 1000, "currency": "SEK"}], // om några belopp nämns
    "deadlines": ["YYYY-MM-DD"], // om några deadlines nämns
    "actionItems": ["konkreta action items"]
  },
  "tags": ["relevanta", "taggar"],
  "suggestedFolder": "Inbox|Daily|Projects|Areas|Resources|Archive",
  "energyLevel": "low|medium|high", // för tasks
  "estimatedDuration": "15min|30min|1h|2h|4h|1d|1w", // för tasks
  "context": "Ytterligare kontext eller anteckningar"
}

Var smart och intelligent i din analys. Om det är en skärmdump av en kalenderhändelse, extrahera datum och tid. Om det är en faktura, extrahera belopp och förfallodatum. Om det är en idé, kategorisera den korrekt.

Svara ENDAST med JSON, ingen annan text.`;

    try {
      let parts = [{ text: prompt }];

      // Add images if present
      if (images && images.length > 0) {
        for (const image of images) {
          parts.push({
            inlineData: {
              mimeType: image.mimeType || 'image/jpeg',
              data: image.data.toString('base64')
            }
          });
        }
      }

      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const responseText = response.text();

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      return analysis;

    } catch (error) {
      console.error('❌ Gemini processing error:', error);

      // Fallback to basic analysis
      return {
        type: 'note',
        category: 'other',
        priority: 'medium',
        title: text.substring(0, 60),
        summary: text.substring(0, 200),
        extractedData: {},
        tags: ['unprocessed'],
        suggestedFolder: 'Inbox',
        context: 'Failed to process with AI, manual review needed'
      };
    }
  }

  async analyzeImage(imageBuffer, mimeType) {
    const prompt = `Analysera denna bild och beskriv vad du ser. Extrahera all relevant text (OCR), datum, belopp, personer, eller annan viktig information.

Returnera ett JSON-objekt:
{
  "description": "Beskrivning av bilden",
  "extractedText": "All text som finns i bilden",
  "detectedType": "screenshot|photo|document|receipt|invoice|calendar|other",
  "keyInformation": {
    "dates": [],
    "amounts": [],
    "people": [],
    "locations": []
  }
}

Svara ENDAST med JSON.`;

    try {
      const result = await this.model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBuffer.toString('base64')
          }
        }
      ]);

      const response = await result.response;
      const responseText = response.text();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('❌ Image analysis error:', error);
      return {
        description: 'Failed to analyze image',
        extractedText: '',
        detectedType: 'other',
        keyInformation: {}
      };
    }
  }
}
