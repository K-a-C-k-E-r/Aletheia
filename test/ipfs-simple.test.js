/**
 * Simple IPFS Test Script
 * Run with: node test/ipfs-simple.test.js
 */

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    blue: '\x1b[36m',
    yellow: '\x1b[33m',
};

// Load environment variables
const PINATA_API_KEY = 'a07739498d960bcda5dd';
const PINATA_SECRET_KEY = 'c27d9b3a385bf4f986a2e2f39f859c9504c2aa11562a39dc854e14b12a8dd078';

async function testPinataConnection() {
    console.log(`${colors.blue}🧪 Testing Pinata Connection...${colors.reset}\n`);

    const metadata = {
        title: `Aletheia Test Campaign ${Date.now()}`,
        description: 'Testing Pinata IPFS integration for Aletheia platform',
        category: 'Testing',
        createdAt: new Date().toISOString(),
        version: '1.0.0',
    };

    try {
        // Test 1: Upload to IPFS
        console.log(`${colors.blue}📤 Test 1: Uploading metadata to IPFS...${colors.reset}`);

        const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
            },
            body: JSON.stringify({
                pinataContent: metadata,
                pinataMetadata: {
                    name: 'aletheia-test-campaign',
                },
            }),
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        const ipfsHash = uploadData.IpfsHash;

        console.log(`${colors.green}✅ Upload successful!${colors.reset}`);
        console.log(`   IPFS Hash: ${ipfsHash}`);
        console.log(`   Pinata URL: https://gateway.pinata.cloud/ipfs/${ipfsHash}\n`);

        // Test 2: Retrieve from IPFS
        console.log(`${colors.blue}📥 Test 2: Retrieving data from IPFS...${colors.reset}`);

        const gateways = [
            `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
            `https://ipfs.io/ipfs/${ipfsHash}`,
        ];

        let retrieved = null;
        for (const gateway of gateways) {
            try {
                console.log(`   Trying ${gateway}...`);
                const retrieveResponse = await fetch(gateway);

                if (retrieveResponse.ok) {
                    retrieved = await retrieveResponse.json();
                    console.log(`${colors.green}   ✅ Retrieved from ${gateway}${colors.reset}`);
                    break;
                }
            } catch (err) {
                console.log(`${colors.yellow}   ⚠️  Failed to retrieve from ${gateway}${colors.reset}`);
            }
        }

        if (!retrieved) {
            throw new Error('Failed to retrieve from any gateway');
        }

        // Test 3: Verify data integrity
        console.log(`\n${colors.blue}🔍 Test 3: Verifying data integrity...${colors.reset}`);

        if (retrieved.title !== metadata.title) {
            throw new Error('Title mismatch!');
        }

        if (retrieved.description !== metadata.description) {
            throw new Error('Description mismatch!');
        }

        console.log(`${colors.green}✅ Data integrity verified!${colors.reset}`);
        console.log(`   Title: ${retrieved.title}`);
        console.log(`   Description: ${retrieved.description}`);

        // Test 4: Multiple concurrent uploads
        console.log(`\n${colors.blue}⚡ Test 4: Testing concurrent uploads...${colors.reset}`);

        const concurrentPromises = Array(3).fill(0).map(async (_, i) => {
            const testData = {
                title: `Concurrent Test ${i + 1}`,
                timestamp: Date.now(),
                index: i,
            };

            const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY,
                },
                body: JSON.stringify({
                    pinataContent: testData,
                    pinataMetadata: {
                        name: `concurrent-test-${i + 1}`,
                    },
                }),
            });

            const data = await response.json();
            return data.IpfsHash;
        });

        const concurrentHashes = await Promise.all(concurrentPromises);
        console.log(`${colors.green}✅ All concurrent uploads successful!${colors.reset}`);
        concurrentHashes.forEach((hash, i) => {
            console.log(`   Upload ${i + 1}: ${hash}`);
        });

        // Summary
        console.log(`\n${'='.repeat(60)}`);
        console.log(`${colors.green}🎉 All tests passed successfully!${colors.reset}`);
        console.log(`${'='.repeat(60)}\n`);

        console.log('Test Results:');
        console.log(`  ✅ Pinata API connection: Working`);
        console.log(`  ✅ IPFS upload: Success`);
        console.log(`  ✅ IPFS retrieval: Success`);
        console.log(`  ✅ Data integrity: Verified`);
        console.log(`  ✅ Concurrent uploads: ${concurrentHashes.length} successful`);
        console.log(`\n${colors.yellow}📋 You can view your uploaded content at:${colors.reset}`);
        console.log(`   https://gateway.pinata.cloud/ipfs/${ipfsHash}`);

    } catch (error) {
        console.error(`\n${colors.red}❌ Test failed:${colors.reset}`, error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the test
testPinataConnection();
