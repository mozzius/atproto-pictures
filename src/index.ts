/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.json`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request) {
		// Parse request URL to get access to query string
		let url = new URL(request.url);

		// parse the path to get the DID and the CID
		const path = url.pathname.split('/').slice(1);
		if (path.length !== 3) return new Response('Not found', { status: 404 });
		const [slug, did, cid] = path;
		if (slug !== 'img') return new Response('Not found', { status: 404 });

		// Cloudflare-specific options are in the cf object.
		const options = {
			cf: {
				image: {
					quality: 10,
					width: 512,
					height: 512,
					fit: 'scale-down',
				} as RequestInitCfPropertiesImage,
			},
		};

		const didDoc = await fetchDidDocument(did);

		if (!didDoc) return new Response('Could not resolve DID', { status: 400 });

		const pdsUrl = getPdsUrlFromDidDoc(didDoc);

		if (!pdsUrl) return new Response('PDS URL not found', { status: 400 });

		const imageUrl = new URL('/xrpc/com.atproto.sync.getBlob', pdsUrl);
		imageUrl.searchParams.set('did', did);
		imageUrl.searchParams.set('cid', cid);

		// Build a request that passes through request headers
		const imageRequest = new Request(imageUrl, {
			headers: request.headers,
		});

		// Returning fetch() with resizing options will pass through response with the resized image.
		return fetch(imageRequest, options);
	},
} satisfies ExportedHandler<Env>;

type DidDocument = {
	'@context': string[];
	id: string;
	alsoKnownAs?: string[];
	verificationMethod?: {
		id: string;
		type: string;
		controller: string;
		publicKeyMultibase?: string;
	}[];
	service?: { id: string; type: string; serviceEndpoint: string }[];
};

async function fetchDidDocument(did: string): Promise<DidDocument | null> {
	if (did.startsWith('did:plc:')) {
		return await fetch(`https://plc.directory/${did}`)
			.then((res) => res.json() as Promise<DidDocument>)
			.catch(() => null);
	} else {
		return await fetch(`https://${did.slice('did:web:'.length)}/.well-known/did.json`)
			.then((res) => res.json() as Promise<DidDocument>)
			.catch(() => null);
	}
}

function getPdsUrlFromDidDoc(didDoc: DidDocument) {
	const service = didDoc.service?.find((s) => s.type === 'AtprotoPersonalDataServer');
	if (!service) return null;
	return service.serviceEndpoint;
}
