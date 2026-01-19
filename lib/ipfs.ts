/**
 * IPFS/Pinata Integration Module
 * Handles uploading and retrieving campaign metadata from IPFS via Pinata
 */

export interface CampaignMetadata {
    title: string;
    description: string;
    category?: string;
    documents?: string[];
    images?: string[];
    createdAt: string;
}

/**
 * Upload campaign metadata to IPFS via Pinata
 */
export async function uploadToIPFS(metadata: CampaignMetadata): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || process.env.PINATA_SECRET_KEY;

    if (!apiKey || !apiSecret) {
        throw new Error('Pinata API credentials not configured');
    }

    try {
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
                    name: `campaign-${metadata.title.replace(/\s+/g, '-').toLowerCase()}`,
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
    } catch (error: any) {
        console.error('IPFS upload error:', error);
        throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
}

/**
 * Retrieve campaign metadata from IPFS
 */
export async function fetchFromIPFS(ipfsHash: string): Promise<CampaignMetadata | null> {
    if (!ipfsHash || !ipfsHash.startsWith('Qm')) {
        console.warn('Invalid IPFS hash:', ipfsHash);
        return null;
    }

    // Try multiple IPFS gateways for redundancy
    const gateways = [
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        `https://ipfs.io/ipfs/${ipfsHash}`,
        `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
    ];

    for (const gateway of gateways) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(gateway, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                return data as CampaignMetadata;
            }
        } catch (error) {
            console.warn(`Failed to fetch from ${gateway}:`, error);
            continue;
        }
    }

    console.error('Failed to fetch from all IPFS gateways');
    return null;
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || process.env.PINATA_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || process.env.PINATA_SECRET_KEY;

    if (!apiKey || !apiSecret) {
        throw new Error('Pinata API credentials not configured');
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const metadata = JSON.stringify({
            name: file.name,
        });
        formData.append('pinataMetadata', metadata);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': apiKey,
                'pinata_secret_api_key': apiSecret,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Pinata file upload failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.IpfsHash;
    } catch (error: any) {
        console.error('IPFS file upload error:', error);
        throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
}

/**
 * Validate IPFS hash format
 */
export function isValidIPFSHash(hash: string): boolean {
    return typeof hash === 'string' && hash.startsWith('Qm') && hash.length === 46;
}

/**
 * Get IPFS gateway URL for a hash
 */
export function getIPFSUrl(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}
