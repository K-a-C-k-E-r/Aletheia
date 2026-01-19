/**
 * Gemini AI Verification Service
 * Verifies campaign details, documents, and authenticity
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_ENDPOINT = process.env.GEMINI_AI_VERIFICATION_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta';

interface CampaignData {
    title: string;
    description: string;
    fundingGoal: string;
    duration: string;
    creatorAddress: string;
    documents?: File[];
}

interface VerificationResult {
    verified: boolean;
    score: number; // 0-100
    confidence: number; // 0-1
    reasons: string[];
    warnings: string[];
    recommendations: string[];
    fraudRisk: 'low' | 'medium' | 'high';
}

/**
 * Verify campaign details using Gemini AI
 */
export async function verifyCampaignWithGemini(
    campaignData: CampaignData
): Promise<VerificationResult> {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error('Gemini API key not configured');
        }

        // Prepare verification prompt
        const verificationPrompt = `
Analyze this crowdfunding campaign for the Aletheia platform and assess its legitimacy.

Campaign: "${campaignData.title}"
Description: "${campaignData.description}"
Goal: ${campaignData.fundingGoal}
Duration: ${campaignData.duration}

Evaluate for fraud risk, legitimacy, and trustworthiness.

Respond with ONLY this exact JSON structure (no markdown, no extra text):
{
  "verified": true or false,
  "score": 0-100,
  "confidence": 0.0-1.0,
  "reasons": ["Keep each reason under 100 characters"],
  "warnings": ["Keep each warning under 100 characters"],
  "recommendations": ["Keep each recommendation under 100 characters"],
  "fraudRisk": "low" or "medium" or "high"
}

Keep all arrays concise with max 3-4 items each.
`;

        // Call Gemini API
        const response = await fetch(
            `${GEMINI_ENDPOINT}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: verificationPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.2, // Lower temperature for more consistent results
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Extract the response text
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!responseText) {
            throw new Error('No response from Gemini API');
        }

        // Parse JSON from response (handle markdown code blocks)
        let jsonText = responseText.trim();
        
        // Remove markdown code block markers if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        // Clean up the JSON text - remove any trailing incomplete strings
        jsonText = jsonText.trim();
        
        // Try to find complete JSON object
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');
        
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }

        const verificationResult: VerificationResult = JSON.parse(jsonText);

        // Validate the result structure
        if (typeof verificationResult.verified !== 'boolean' ||
            typeof verificationResult.score !== 'number' ||
            !Array.isArray(verificationResult.reasons)) {
            throw new Error('Invalid verification result format');
        }

        return verificationResult;

    } catch (error) {
        console.error('Gemini verification error:', error);
        
        // Return a conservative default result on error
        return {
            verified: false,
            score: 0,
            confidence: 0,
            reasons: [`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: ['Unable to complete AI verification'],
            recommendations: ['Please try again or contact support'],
            fraudRisk: 'high'
        };
    }
}

/**
 * Verify document authenticity using Gemini Vision
 */
export async function verifyDocumentWithGemini(
    documentBase64: string,
    documentType: 'id' | 'proof' | 'other'
): Promise<{
    verified: boolean;
    documentType: string;
    confidence: number;
    issues: string[];
}> {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error('Gemini API key not configured');
        }

        const prompt = `
Analyze this document image for authenticity.

Document Type: ${documentType}

Check for:
1. Image quality and clarity
2. Signs of tampering or editing
3. Document format consistency
4. Visible watermarks or security features
5. Text legibility

Provide response in JSON format:
{
  "verified": boolean,
  "documentType": "description of document",
  "confidence": number (0-1),
  "issues": ["issue1", "issue2", ...]
}
`;

        // Call Gemini Vision API
        const response = await fetch(
            `${GEMINI_ENDPOINT}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: 'image/jpeg',
                                    data: documentBase64
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 512,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini Vision API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error('No response from Gemini Vision API');
        }

        // Parse JSON response
        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        return JSON.parse(jsonText);

    } catch (error) {
        console.error('Document verification error:', error);
        return {
            verified: false,
            documentType: 'unknown',
            confidence: 0,
            issues: ['Verification failed']
        };
    }
}

/**
 * Quick verification check (for testing)
 */
export async function quickVerification(text: string): Promise<string> {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error('Gemini API key not configured');
        }

        const response = await fetch(
            `${GEMINI_ENDPOINT}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Analyze this campaign title for legitimacy: "${text}". Is it suspicious? Respond in one sentence.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 100,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to verify';

    } catch (error) {
        console.error('Quick verification error:', error);
        return 'Verification unavailable';
    }
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection(): Promise<{
    success: boolean;
    message: string;
}> {
    try {
        if (!GEMINI_API_KEY) {
            return {
                success: false,
                message: 'Gemini API key not configured'
            };
        }

        const response = await fetch(
            `${GEMINI_ENDPOINT}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Hello, respond with "OK" if you receive this.'
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 10,
                    },
                }),
            }
        );

        if (!response.ok) {
            return {
                success: false,
                message: `API Error: ${response.status} ${response.statusText}`
            };
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        return {
            success: true,
            message: `Connected successfully. Response: ${responseText}`
        };

    } catch (error) {
        return {
            success: false,
            message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
