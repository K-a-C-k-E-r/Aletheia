/**
 * Gemini AI Verification Tests
 * Tests the AI verification functionality
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Mock fetch for testing without actual API calls
const originalFetch = global.fetch;

async function testGeminiConnection() {
    console.log('\n🧪 Test 1: Gemini API Connection');
    console.log('='.repeat(50));

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const endpoint = process.env.GEMINI_AI_VERIFICATION_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta';

    if (!apiKey) {
        console.log('❌ FAILED: Gemini API key not found in environment');
        return false;
    }

    console.log('✓ API Key found:', apiKey.substring(0, 10) + '...');
    console.log('✓ Endpoint:', endpoint);

    try {
        const response = await fetch(
            `${endpoint}/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Say "Connection successful" if you receive this.'
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 20,
                    },
                }),
            }
        );

        if (!response.ok) {
            console.log(`❌ FAILED: API returned status ${response.status}`);
            const errorText = await response.text();
            console.log('Error details:', errorText);
            return false;
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('✅ PASSED: Connected successfully');
        console.log('Response:', responseText);
        return true;

    } catch (error) {
        console.log('❌ FAILED: Connection error');
        console.error(error);
        return false;
    }
}

async function testCampaignVerification() {
    console.log('\n🧪 Test 2: Campaign Verification');
    console.log('='.repeat(50));

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const endpoint = process.env.GEMINI_AI_VERIFICATION_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta';

    const testCampaign = {
        title: 'Medical Aid for Children in Rural Areas',
        description: 'This campaign aims to provide essential medical supplies and build a small clinic to serve underprivileged children in remote villages. The funds will be used for medical equipment, supplies, and hiring healthcare workers.',
        fundingGoal: '10',
        duration: '30',
        creatorAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    };

    console.log('Campaign details:');
    console.log('- Title:', testCampaign.title);
    console.log('- Goal:', testCampaign.fundingGoal, 'ETH');
    console.log('- Duration:', testCampaign.duration, 'days');

    const verificationPrompt = `
You are an AI verification system for a decentralized crowdfunding platform.

Analyze the following campaign and provide a verification assessment:

**Campaign Details:**
- Title: ${testCampaign.title}
- Description: ${testCampaign.description}
- Funding Goal: ${testCampaign.fundingGoal} ETH
- Duration: ${testCampaign.duration} days
- Creator Address: ${testCampaign.creatorAddress}

**Evaluation Criteria:**
1. Legitimacy and authenticity
2. Red flags or suspicious patterns
3. Clarity and completeness
4. Realistic funding goals
5. Fraud indicators

Provide your response in JSON format:
{
  "verified": boolean,
  "score": number (0-100),
  "confidence": number (0-1),
  "reasons": ["reason1", "reason2"],
  "warnings": ["warning1"],
  "recommendations": ["rec1"],
  "fraudRisk": "low" | "medium" | "high"
}
`;

    try {
        const response = await fetch(
            `${endpoint}/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                        maxOutputTokens: 1024,
                    },
                }),
            }
        );

        if (!response.ok) {
            console.log(`❌ FAILED: API returned status ${response.status}`);
            return false;
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            console.log('❌ FAILED: No response from API');
            return false;
        }

        console.log('\nRaw AI Response:');
        console.log('-'.repeat(50));
        console.log(responseText);
        console.log('-'.repeat(50));

        // Parse JSON from response
        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        const verification = JSON.parse(jsonText);

        console.log('\nVerification Results:');
        console.log('✓ Verified:', verification.verified);
        console.log('✓ Score:', verification.score + '/100');
        console.log('✓ Confidence:', (verification.confidence * 100).toFixed(1) + '%');
        console.log('✓ Fraud Risk:', verification.fraudRisk);
        console.log('\nReasons:');
        verification.reasons.forEach((reason, i) => {
            console.log(`  ${i + 1}. ${reason}`);
        });

        if (verification.warnings.length > 0) {
            console.log('\nWarnings:');
            verification.warnings.forEach((warning, i) => {
                console.log(`  ⚠️  ${warning}`);
            });
        }

        if (verification.recommendations.length > 0) {
            console.log('\nRecommendations:');
            verification.recommendations.forEach((rec, i) => {
                console.log(`  💡 ${rec}`);
            });
        }

        console.log('\n✅ PASSED: Campaign verification complete');
        return true;

    } catch (error) {
        console.log('❌ FAILED: Verification error');
        console.error(error);
        return false;
    }
}

async function testSuspiciousCampaign() {
    console.log('\n🧪 Test 3: Suspicious Campaign Detection');
    console.log('='.repeat(50));

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const endpoint = process.env.GEMINI_AI_VERIFICATION_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta';

    const suspiciousCampaign = {
        title: 'GET RICH QUICK!!! GUARANTEED 1000% RETURNS!!!',
        description: 'Send money now and get instant returns! No questions asked. Trust me bro.',
        fundingGoal: '1000',
        duration: '1',
        creatorAddress: '0x0000000000000000000000000000000000000000'
    };

    console.log('Testing suspicious campaign:');
    console.log('- Title:', suspiciousCampaign.title);
    console.log('- Description:', suspiciousCampaign.description);

    const verificationPrompt = `
Analyze this campaign for fraud indicators:

Title: ${suspiciousCampaign.title}
Description: ${suspiciousCampaign.description}
Funding Goal: ${suspiciousCampaign.fundingGoal} ETH
Duration: ${suspiciousCampaign.duration} days

Respond in JSON format with fraud assessment:
{
  "verified": boolean,
  "score": number (0-100),
  "fraudRisk": "low" | "medium" | "high",
  "redFlags": ["flag1", "flag2"]
}
`;

    try {
        const response = await fetch(
            `${endpoint}/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                        maxOutputTokens: 512,
                    },
                }),
            }
        );

        if (!response.ok) {
            console.log(`❌ FAILED: API returned status ${response.status}`);
            return false;
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        let jsonText = responseText.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        const verification = JSON.parse(jsonText);

        console.log('\nDetection Results:');
        console.log('✓ Verified:', verification.verified);
        console.log('✓ Score:', verification.score + '/100');
        console.log('✓ Fraud Risk:', verification.fraudRisk);

        if (verification.redFlags) {
            console.log('\n🚩 Red Flags Detected:');
            verification.redFlags.forEach((flag, i) => {
                console.log(`  ${i + 1}. ${flag}`);
            });
        }

        if (!verification.verified && verification.fraudRisk === 'high') {
            console.log('\n✅ PASSED: Correctly identified suspicious campaign');
            return true;
        } else {
            console.log('\n⚠️  WARNING: Failed to identify obvious fraud');
            return false;
        }

    } catch (error) {
        console.log('❌ FAILED: Detection error');
        console.error(error);
        return false;
    }
}

async function testQuickVerification() {
    console.log('\n🧪 Test 4: Quick Text Verification');
    console.log('='.repeat(50));

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const endpoint = process.env.GEMINI_AI_VERIFICATION_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta';

    const testTexts = [
        'Help fund education for underprivileged children',
        'FREE MONEY NOW!!! CLICK HERE!!!',
        'Building a community center for local residents'
    ];

    let allPassed = true;

    for (const text of testTexts) {
        console.log(`\nAnalyzing: "${text}"`);

        try {
            const response = await fetch(
                `${endpoint}/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Is this campaign title suspicious or legitimate? "${text}". Respond in one sentence.`
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
                console.log(`❌ Failed for this text`);
                allPassed = false;
                continue;
            }

            const data = await response.json();
            const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

            console.log('AI Assessment:', result);

        } catch (error) {
            console.log('❌ Error:', error);
            allPassed = false;
        }
    }

    if (allPassed) {
        console.log('\n✅ PASSED: All quick verifications completed');
        return true;
    } else {
        console.log('\n❌ FAILED: Some verifications failed');
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n');
    console.log('='.repeat(60));
    console.log('🚀 GEMINI AI VERIFICATION TEST SUITE');
    console.log('='.repeat(60));

    const results = {
        total: 4,
        passed: 0,
        failed: 0
    };

    // Test 1: Connection
    if (await testGeminiConnection()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Test 2: Campaign Verification
    if (await testCampaignVerification()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Test 3: Fraud Detection
    if (await testSuspiciousCampaign()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Test 4: Quick Verification
    if (await testQuickVerification()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Summary
    console.log('\n');
    console.log('='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    console.log('\n');

    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
