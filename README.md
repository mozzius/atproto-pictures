# atproto.pictures

an example CDN for atproto

![ultra compressed jack dorsey](https://atproto.pictures/img/did:plc:bnqkww7bjxaacajzvu5gswdf/bafkreiep2raqkqferig6isc3wq6ipoubjfi2wrwl4gm2nqurxfe2tvy3tm)

### How it works

Any image on the ATmosphere can be referenced using its DID and CID. Therefore, making an image CDN for any image on the network is extremely easy. This repo is an example using Cloudflare Images.

Simply visit `https://atproto.pictures/img/<DID>/<CID>` to get the image. The image will be fetched from the ATmosphere and transformed/cached by Cloudflare.

### Note for if you actually want to use this

1. _Cache the PDS resolution_. Use Worker KV or something.
2. _Adjust the quality settings_. This example is ultra compressed, for a laugh. Also costs. But mostly laughs.
3. _Verify the CID_. In a production setting, you will want to verify that the blob that the PDS returns actually matches the CID - theoretically, it might not! The simplest way to do this is to load the blob into memory and hash it, and make sure it matches. Cache this heavily!
