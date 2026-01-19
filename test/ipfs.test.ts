/**
 * IPFS/Pinata Integration Tests
 * Run with: node --loader ts-node/esm test/ipfs.test.ts
 */

import { uploadToIPFS, fetchFromIPFS, uploadFileToIPFS, type CampaignMetadata } from '../lib/ipfs';

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
};

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
        console.log(`${colors.blue}⏳ Running: ${name}${colors.reset}`);
        await testFn();
        const duration = Date.now() - startTime;
        results.push({ name, passed: true, duration });
        console.log(`${colors.green}✅ PASSED: ${name} (${duration}ms)${colors.reset}\n`);
    } catch (error: any) {
        const duration = Date.now() - startTime;
        results.push({ name, passed: false, error: error.message, duration });
        console.log(`${colors.red}❌ FAILED: ${name} (${duration}ms)${colors.reset}`);
        console.log(`${colors.red}   Error: ${error.message}${colors.reset}\n`);
    }
}

// Test 1: Upload simple metadata to IPFS
async function testUploadMetadata() {
    const metadata: CampaignMetadata = {
        title: 'Test Campaign ' + Date.now(),
        description: 'This is a test campaign for IPFS integration',
        category: 'Healthcare',
        documents: [],
        images: [],
        createdAt: new Date().toISOString(),
    };

    const ipfsHash = await uploadToIPFS(metadata);
    
    if (!ipfsHash) {
        throw new Error('No IPFS hash returned');
    }
    
    if (!ipfsHash.startsWith('Qm')) {
        throw new Error(`Invalid IPFS hash format: ${ipfsHash}`);
    }
    
    console.log(`   📦 IPFS Hash: ${ipfsHash}`);
}

// Test 2: Upload and retrieve metadata
async function testUploadAndRetrieve() {
    const metadata: CampaignMetadata = {
        title: 'Round Trip Test ' + Date.now(),
        description: 'Testing upload and retrieval from IPFS',
        category: 'Education',
        createdAt: new Date().toISOString(),
    };

    // Upload
    const ipfsHash = await uploadToIPFS(metadata);
    console.log(`   📦 Uploaded: ${ipfsHash}`);

    // Retrieve
    const retrieved = await fetchFromIPFS(ipfsHash);
    
    if (!retrieved) {
        throw new Error('Failed to retrieve metadata from IPFS');
    }
    
    if (retrieved.title !== metadata.title) {
        throw new Error(`Title mismatch: expected "${metadata.title}", got "${retrieved.title}"`);
    }
    
    if (retrieved.description !== metadata.description) {
        throw new Error('Description mismatch');
    }
    
    console.log(`   ✅ Data retrieved successfully`);
}

// Test 3: Upload metadata with special characters
async function testSpecialCharacters() {
    const metadata: CampaignMetadata = {
        title: 'Test™ Campaign® with émojis 🚀💰',
        description: 'Testing special chars: <>&"\'\\n\\t中文字符',
        category: 'Testing',
        createdAt: new Date().toISOString(),
    };

    const ipfsHash = await uploadToIPFS(metadata);
    const retrieved = await fetchFromIPFS(ipfsHash);
    
    if (!retrieved) {
        throw new Error('Failed to retrieve metadata');
    }
    
    if (retrieved.title !== metadata.title) {
        throw new Error('Special characters not preserved in title');
    }
    
    console.log(`   ✅ Special characters handled correctly`);
}

// Test 4: Large metadata upload
async function testLargeMetadata() {
    const largeDescription = 'A'.repeat(10000); // 10KB of text
    
    const metadata: CampaignMetadata = {
        title: 'Large Metadata Test',
        description: largeDescription,
        category: 'Testing',
        documents: Array(10).fill('QmTestHash123'),
        createdAt: new Date().toISOString(),
    };

    const ipfsHash = await uploadToIPFS(metadata);
    
    if (!ipfsHash) {
        throw new Error('Failed to upload large metadata');
    }
    
    console.log(`   ✅ Large metadata uploaded: ${(largeDescription.length / 1024).toFixed(2)}KB`);
}

// Test 5: Invalid hash retrieval
async function testInvalidHashRetrieval() {
    const invalidHash = 'QmInvalidHash123';
    const result = await fetchFromIPFS(invalidHash);
    
    if (result !== null) {
        throw new Error('Expected null for invalid hash, got data');
    }
    
    console.log(`   ✅ Invalid hash handled correctly`);
}

// Test 6: Multiple concurrent uploads
async function testConcurrentUploads() {
    const promises = Array(5).fill(0).map(async (_, i) => {
        const metadata: CampaignMetadata = {
            title: `Concurrent Test ${i}`,
            description: `Testing concurrent upload #${i}`,
            createdAt: new Date().toISOString(),
        };
        return uploadToIPFS(metadata);
    });

    const hashes = await Promise.all(promises);
    
    if (hashes.length !== 5) {
        throw new Error(`Expected 5 hashes, got ${hashes.length}`);
    }
    
    // Verify all hashes are unique
    const uniqueHashes = new Set(hashes);
    if (uniqueHashes.size !== 5) {
        throw new Error('Not all hashes are unique');
    }
    
    console.log(`   ✅ All ${hashes.length} uploads successful`);
}

// Test 7: Check Pinata API credentials
async function testAPICredentials() {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || process.env.PINATA_SECRET_KEY;
    
    if (!apiKey) {
        throw new Error('PINATA_API_KEY not configured');
    }
    
    if (!apiSecret) {
        throw new Error('PINATA_SECRET_KEY not configured');
    }
    
    console.log(`   ✅ API Key: ${apiKey.substring(0, 8)}...`);
    console.log(`   ✅ Secret: ${apiSecret.substring(0, 8)}...`);
}

// Main test runner
async function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 IPFS/Pinata Integration Test Suite');
    console.log('='.repeat(60) + '\n');

    const tests = [
        { name: 'API Credentials Check', fn: testAPICredentials },
        { name: 'Upload Metadata to IPFS', fn: testUploadMetadata },
        { name: 'Upload and Retrieve Metadata', fn: testUploadAndRetrieve },
        { name: 'Special Characters Handling', fn: testSpecialCharacters },
        { name: 'Large Metadata Upload', fn: testLargeMetadata },
        { name: 'Invalid Hash Retrieval', fn: testInvalidHashRetrieval },
        { name: 'Concurrent Uploads', fn: testConcurrentUploads },
    ];

    for (const test of tests) {
        await runTest(test.name, test.fn);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60) + '\n');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Tests: ${results.length}`);
    console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms\n`);

    if (failed > 0) {
        console.log(`${colors.red}Failed Tests:${colors.reset}`);
        results.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.name}: ${r.error}`);
        });
        console.log('');
    }

    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
    console.error(`${colors.red}Fatal error running tests:${colors.reset}`, error);
    process.exit(1);
});
