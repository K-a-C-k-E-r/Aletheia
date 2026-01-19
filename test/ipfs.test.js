/**
 * IPFS/Pinata Integration Tests
 * 
 * To run tests:
 * - node test/ipfs.test.js
 * 
 * Make sure .env file has PINATA_API_KEY and PINATA_SECRET_KEY set
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        testsPassed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        testsFailed++;
    }
}

function assertEquals(actual, expected, message) {
    if (actual === expected) {
        console.log(`✅ PASS: ${message}`);
        testsPassed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        console.error(`   Expected: ${expected}`);
        console.error(`   Actual: ${actual}`);
        testsFailed++;
    }
}

// IPFS utility functions (copied from lib/ipfs.ts for testing)
async function uploadToIPFS(metadata) {
    const apiKey = process.env.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_SECRET_KEY;

    if (!apiKey || !apiSecret) {
        throw new Error('Pinata API credentials not configured');
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': apiKey,
            'pinata_secret_api_key': apiSecret,
        },
        body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
                name: `test-${metadata.title.replace(/\s+/g, '-').toLowerCase()}`,
            },
            pinataOptions: {
                cidVersion: 0,
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Pinata upload failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.IpfsHash;
}

async function fetchFromIPFS(ipfsHash) {
    const gateways = [
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        `https://ipfs.io/ipfs/${ipfsHash}`,
    ];

    for (const gateway of gateways) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(gateway, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.warn(`Failed to fetch from ${gateway}:`, error.message);
            continue;
        }
    }

    throw new Error('Failed to fetch from all IPFS gateways');
}

function isValidIPFSHash(hash) {
    return typeof hash === 'string' && hash.startsWith('Qm') && hash.length === 46;
}

// Test Suite
console.log('🧪 Starting IPFS/Pinata Integration Tests\n');
console.log('='.repeat(60));

// Test 1: Check environment variables
console.log('\n📋 Test 1: Environment Variables Configuration');
assert(process.env.PINATA_API_KEY, 'PINATA_API_KEY is set');
assert(process.env.PINATA_SECRET_KEY, 'PINATA_SECRET_KEY is set');
assert(process.env.PINATA_API_KEY?.length > 0, 'PINATA_API_KEY is not empty');
assert(process.env.PINATA_SECRET_KEY?.length > 0, 'PINATA_SECRET_KEY is not empty');

// Test 2: Upload campaign metadata to IPFS
console.log('\n📋 Test 2: Upload Campaign Metadata to IPFS');
let uploadedHash = null;
try {
    const testMetadata = {
        title: 'Test Campaign for Medical Aid',
        description: 'This is a test campaign to verify IPFS integration works correctly.',
        category: 'Healthcare',
        createdAt: new Date().toISOString(),
    };

    console.log('Uploading metadata to IPFS via Pinata...');
    uploadedHash = await uploadToIPFS(testMetadata);

    assert(uploadedHash !== null, 'Upload returned a hash');
    assert(isValidIPFSHash(uploadedHash), 'Hash format is valid (Qm... with 46 chars)');
    console.log(`📦 Uploaded to IPFS: ${uploadedHash}`);
} catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    testsFailed++;
}

// Test 3: Fetch metadata from IPFS
console.log('\n📋 Test 3: Fetch Campaign Metadata from IPFS');
if (uploadedHash) {
    try {
        console.log('Fetching metadata from IPFS gateways...');
        console.log('⏳ This may take a few seconds as data propagates...');

        const fetchedData = await fetchFromIPFS(uploadedHash);

        assert(fetchedData !== null, 'Fetch returned data');
        assertEquals(fetchedData.title, 'Test Campaign for Medical Aid', 'Title matches');
        assertEquals(
            fetchedData.description,
            'This is a test campaign to verify IPFS integration works correctly.',
            'Description matches'
        );
        assertEquals(fetchedData.category, 'Healthcare', 'Category matches');
        assert(fetchedData.createdAt !== undefined, 'CreatedAt timestamp exists');

        console.log('📥 Successfully fetched and verified data from IPFS');
    } catch (error) {
        console.error(`❌ Fetch failed: ${error.message}`);
        testsFailed++;
    }
} else {
    console.log('⚠️  Skipping fetch test (no hash from upload)');
    testsFailed++;
}

// Test 4: Upload and retrieve complex metadata
console.log('\n📋 Test 4: Complex Metadata with Multiple Fields');
try {
    const complexMetadata = {
        title: 'Education Fund Campaign',
        description: 'Supporting education for underprivileged students with scholarships and learning materials.',
        category: 'Education',
        documents: ['QmDoc1Hash', 'QmDoc2Hash', 'QmDoc3Hash'],
        images: ['QmImg1Hash', 'QmImg2Hash'],
        createdAt: new Date().toISOString(),
    };

    console.log('Uploading complex metadata...');
    const complexHash = await uploadToIPFS(complexMetadata);

    assert(isValidIPFSHash(complexHash), 'Complex metadata upload successful');
    console.log(`📦 Complex metadata uploaded: ${complexHash}`);

    console.log('Fetching complex metadata...');
    const fetchedComplex = await fetchFromIPFS(complexHash);

    assert(Array.isArray(fetchedComplex.documents), 'Documents array exists');
    assertEquals(fetchedComplex.documents.length, 3, 'Documents array has 3 items');
    assert(Array.isArray(fetchedComplex.images), 'Images array exists');
    assertEquals(fetchedComplex.images.length, 2, 'Images array has 2 items');

    console.log('✅ Complex metadata verified successfully');
} catch (error) {
    console.error(`❌ Complex metadata test failed: ${error.message}`);
    testsFailed++;
}

// Test 5: Validate IPFS hash format
console.log('\n📋 Test 5: IPFS Hash Validation');
assertEquals(isValidIPFSHash('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'), true, 'Valid hash recognized');
assertEquals(isValidIPFSHash('InvalidHash123'), false, 'Invalid hash rejected');
assertEquals(isValidIPFSHash(''), false, 'Empty string rejected');
assertEquals(isValidIPFSHash('QmShortHash'), false, 'Short hash rejected');

// Test 6: Error handling
console.log('\n📋 Test 6: Error Handling');
try {
    // Test with missing credentials
    const originalKey = process.env.PINATA_API_KEY;
    const originalSecret = process.env.PINATA_SECRET_KEY;

    process.env.PINATA_API_KEY = '';
    process.env.PINATA_SECRET_KEY = '';

    try {
        await uploadToIPFS({ title: 'Test' });
        console.error('❌ Should have thrown error for missing credentials');
        testsFailed++;
    } catch (error) {
        assert(error.message.includes('credentials'), 'Error for missing credentials');
    }

    // Restore credentials
    process.env.PINATA_API_KEY = originalKey;
    process.env.PINATA_SECRET_KEY = originalSecret;

    // Test fetching invalid hash
    try {
        await fetchFromIPFS('QmInvalidHashThatDoesNotExist123456789012');
        console.error('❌ Should have thrown error for invalid hash');
        testsFailed++;
    } catch (error) {
        assert(true, 'Error handling for invalid hash works');
    }
} catch (error) {
    console.error(`❌ Error handling test failed: ${error.message}`);
    testsFailed++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total: ${testsPassed + testsFailed}`);
console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);

if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! IPFS/Pinata integration is working correctly.');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
}
