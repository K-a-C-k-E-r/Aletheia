import 'dotenv/config';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_ENDPOINT = process.env.GEMINI_AI_VERIFICATION_ENDPOINT || 'https://generativelanguage.googleapis.com/v1';

console.log('============================================================');
console.log('🚀 GEMINI AI SINGLE VERIFICATION TEST');
console.log('============================================================\n');

async function testSingleCampaign() {
    const campaignData = {
        title: "Community Garden Project",
        description: "Building a sustainable community garden to provide fresh vegetables for local families and teach children about nutrition and farming.",
        fundingGoal: "5 ETH",
        duration: "60 days",
        creatorAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    };

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

    console.log('📝 Testing Campaign:');
    console.log(`   Title: ${campaignData.title}`);
    console.log(`   Goal: ${campaignData.fundingGoal}`);
    console.log(`   Duration: ${campaignData.duration}\n`);

    try {
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
                        temperature: 0.2,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.log('❌ FAILED: API returned status', response.status);
            console.log('Error details:', JSON.stringify(errorData, null, 2));
            return;
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('📊 Raw AI Response:');
        console.log('--------------------------------------------------');
        console.log(responseText);
        console.log('--------------------------------------------------\n');

        // Parse JSON from response
        let jsonText = responseText.trim();

        // Remove markdown code block markers if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        // Clean up - find complete JSON object
        const startIndex = jsonText.indexOf('{');
        const endIndex = jsonText.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }

        const result = JSON.parse(jsonText);

        console.log('✅ Verification Result:');
        console.log(`   Verified: ${result.verified ? '✓' : '✗'}`);
        console.log(`   Score: ${result.score}/100`);
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`   Fraud Risk: ${result.fraudRisk.toUpperCase()}`);
        console.log(`\n   Reasons:`);
        result.reasons.forEach(r => console.log(`   - ${r}`));

        if (result.warnings.length > 0) {
            console.log(`\n   Warnings:`);
            result.warnings.forEach(w => console.log(`   - ${w}`));
        }

        if (result.recommendations.length > 0) {
            console.log(`\n   Recommendations:`);
            result.recommendations.forEach(r => console.log(`   - ${r}`));
        }

        console.log('\n✅ TEST PASSED!\n');

    } catch (error) {
        console.log('❌ FAILED:', error.message);
        if (error.stack) {
            console.log('\nStack trace:', error.stack);
        }
    }
}

testSingleCampaign();
