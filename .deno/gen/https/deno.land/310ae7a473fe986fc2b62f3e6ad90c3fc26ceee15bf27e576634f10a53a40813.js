const HEX_CHARS = "0123456789abcdef".split("");
const EXTRA = [-2147483648, 8388608, 32768, 128];
const SHIFT = [24, 16, 8, 0];
const blocks = [];
export class Sha1 {
    #blocks;
    #block;
    #start;
    #bytes;
    #hBytes;
    #finalized;
    #hashed;
    #h0 = 0x67452301;
    #h1 = 0xefcdab89;
    #h2 = 0x98badcfe;
    #h3 = 0x10325476;
    #h4 = 0xc3d2e1f0;
    #lastByteIndex = 0;
    constructor(sharedMemory = false) {
        if (sharedMemory) {
            blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
            this.#blocks = blocks;
        }
        else {
            this.#blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        this.#h0 = 0x67452301;
        this.#h1 = 0xefcdab89;
        this.#h2 = 0x98badcfe;
        this.#h3 = 0x10325476;
        this.#h4 = 0xc3d2e1f0;
        this.#block = this.#start = this.#bytes = this.#hBytes = 0;
        this.#finalized = this.#hashed = false;
    }
    update(message) {
        if (this.#finalized) {
            return this;
        }
        let msg;
        if (message instanceof ArrayBuffer) {
            msg = new Uint8Array(message);
        }
        else {
            msg = message;
        }
        let index = 0;
        const length = msg.length;
        const blocks = this.#blocks;
        while (index < length) {
            let i;
            if (this.#hashed) {
                this.#hashed = false;
                blocks[0] = this.#block;
                blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
            }
            if (typeof msg !== "string") {
                for (i = this.#start; index < length && i < 64; ++index) {
                    blocks[i >> 2] |= msg[index] << SHIFT[i++ & 3];
                }
            }
            else {
                for (i = this.#start; index < length && i < 64; ++index) {
                    let code = msg.charCodeAt(index);
                    if (code < 0x80) {
                        blocks[i >> 2] |= code << SHIFT[i++ & 3];
                    }
                    else if (code < 0x800) {
                        blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    }
                    else if (code < 0xd800 || code >= 0xe000) {
                        blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    }
                    else {
                        code = 0x10000 +
                            (((code & 0x3ff) << 10) | (msg.charCodeAt(++index) & 0x3ff));
                        blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    }
                }
            }
            this.#lastByteIndex = i;
            this.#bytes += i - this.#start;
            if (i >= 64) {
                this.#block = blocks[16];
                this.#start = i - 64;
                this.hash();
                this.#hashed = true;
            }
            else {
                this.#start = i;
            }
        }
        if (this.#bytes > 4294967295) {
            this.#hBytes += (this.#bytes / 4294967296) >>> 0;
            this.#bytes = this.#bytes >>> 0;
        }
        return this;
    }
    finalize() {
        if (this.#finalized) {
            return;
        }
        this.#finalized = true;
        const blocks = this.#blocks;
        const i = this.#lastByteIndex;
        blocks[16] = this.#block;
        blocks[i >> 2] |= EXTRA[i & 3];
        this.#block = blocks[16];
        if (i >= 56) {
            if (!this.#hashed) {
                this.hash();
            }
            blocks[0] = this.#block;
            blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        }
        blocks[14] = (this.#hBytes << 3) | (this.#bytes >>> 29);
        blocks[15] = this.#bytes << 3;
        this.hash();
    }
    hash() {
        let a = this.#h0;
        let b = this.#h1;
        let c = this.#h2;
        let d = this.#h3;
        let e = this.#h4;
        let f;
        let j;
        let t;
        const blocks = this.#blocks;
        for (j = 16; j < 80; ++j) {
            t = blocks[j - 3] ^ blocks[j - 8] ^ blocks[j - 14] ^ blocks[j - 16];
            blocks[j] = (t << 1) | (t >>> 31);
        }
        for (j = 0; j < 20; j += 5) {
            f = (b & c) | (~b & d);
            t = (a << 5) | (a >>> 27);
            e = (t + f + e + 1518500249 + blocks[j]) >>> 0;
            b = (b << 30) | (b >>> 2);
            f = (a & b) | (~a & c);
            t = (e << 5) | (e >>> 27);
            d = (t + f + d + 1518500249 + blocks[j + 1]) >>> 0;
            a = (a << 30) | (a >>> 2);
            f = (e & a) | (~e & b);
            t = (d << 5) | (d >>> 27);
            c = (t + f + c + 1518500249 + blocks[j + 2]) >>> 0;
            e = (e << 30) | (e >>> 2);
            f = (d & e) | (~d & a);
            t = (c << 5) | (c >>> 27);
            b = (t + f + b + 1518500249 + blocks[j + 3]) >>> 0;
            d = (d << 30) | (d >>> 2);
            f = (c & d) | (~c & e);
            t = (b << 5) | (b >>> 27);
            a = (t + f + a + 1518500249 + blocks[j + 4]) >>> 0;
            c = (c << 30) | (c >>> 2);
        }
        for (; j < 40; j += 5) {
            f = b ^ c ^ d;
            t = (a << 5) | (a >>> 27);
            e = (t + f + e + 1859775393 + blocks[j]) >>> 0;
            b = (b << 30) | (b >>> 2);
            f = a ^ b ^ c;
            t = (e << 5) | (e >>> 27);
            d = (t + f + d + 1859775393 + blocks[j + 1]) >>> 0;
            a = (a << 30) | (a >>> 2);
            f = e ^ a ^ b;
            t = (d << 5) | (d >>> 27);
            c = (t + f + c + 1859775393 + blocks[j + 2]) >>> 0;
            e = (e << 30) | (e >>> 2);
            f = d ^ e ^ a;
            t = (c << 5) | (c >>> 27);
            b = (t + f + b + 1859775393 + blocks[j + 3]) >>> 0;
            d = (d << 30) | (d >>> 2);
            f = c ^ d ^ e;
            t = (b << 5) | (b >>> 27);
            a = (t + f + a + 1859775393 + blocks[j + 4]) >>> 0;
            c = (c << 30) | (c >>> 2);
        }
        for (; j < 60; j += 5) {
            f = (b & c) | (b & d) | (c & d);
            t = (a << 5) | (a >>> 27);
            e = (t + f + e - 1894007588 + blocks[j]) >>> 0;
            b = (b << 30) | (b >>> 2);
            f = (a & b) | (a & c) | (b & c);
            t = (e << 5) | (e >>> 27);
            d = (t + f + d - 1894007588 + blocks[j + 1]) >>> 0;
            a = (a << 30) | (a >>> 2);
            f = (e & a) | (e & b) | (a & b);
            t = (d << 5) | (d >>> 27);
            c = (t + f + c - 1894007588 + blocks[j + 2]) >>> 0;
            e = (e << 30) | (e >>> 2);
            f = (d & e) | (d & a) | (e & a);
            t = (c << 5) | (c >>> 27);
            b = (t + f + b - 1894007588 + blocks[j + 3]) >>> 0;
            d = (d << 30) | (d >>> 2);
            f = (c & d) | (c & e) | (d & e);
            t = (b << 5) | (b >>> 27);
            a = (t + f + a - 1894007588 + blocks[j + 4]) >>> 0;
            c = (c << 30) | (c >>> 2);
        }
        for (; j < 80; j += 5) {
            f = b ^ c ^ d;
            t = (a << 5) | (a >>> 27);
            e = (t + f + e - 899497514 + blocks[j]) >>> 0;
            b = (b << 30) | (b >>> 2);
            f = a ^ b ^ c;
            t = (e << 5) | (e >>> 27);
            d = (t + f + d - 899497514 + blocks[j + 1]) >>> 0;
            a = (a << 30) | (a >>> 2);
            f = e ^ a ^ b;
            t = (d << 5) | (d >>> 27);
            c = (t + f + c - 899497514 + blocks[j + 2]) >>> 0;
            e = (e << 30) | (e >>> 2);
            f = d ^ e ^ a;
            t = (c << 5) | (c >>> 27);
            b = (t + f + b - 899497514 + blocks[j + 3]) >>> 0;
            d = (d << 30) | (d >>> 2);
            f = c ^ d ^ e;
            t = (b << 5) | (b >>> 27);
            a = (t + f + a - 899497514 + blocks[j + 4]) >>> 0;
            c = (c << 30) | (c >>> 2);
        }
        this.#h0 = (this.#h0 + a) >>> 0;
        this.#h1 = (this.#h1 + b) >>> 0;
        this.#h2 = (this.#h2 + c) >>> 0;
        this.#h3 = (this.#h3 + d) >>> 0;
        this.#h4 = (this.#h4 + e) >>> 0;
    }
    hex() {
        this.finalize();
        const h0 = this.#h0;
        const h1 = this.#h1;
        const h2 = this.#h2;
        const h3 = this.#h3;
        const h4 = this.#h4;
        return (HEX_CHARS[(h0 >> 28) & 0x0f] +
            HEX_CHARS[(h0 >> 24) & 0x0f] +
            HEX_CHARS[(h0 >> 20) & 0x0f] +
            HEX_CHARS[(h0 >> 16) & 0x0f] +
            HEX_CHARS[(h0 >> 12) & 0x0f] +
            HEX_CHARS[(h0 >> 8) & 0x0f] +
            HEX_CHARS[(h0 >> 4) & 0x0f] +
            HEX_CHARS[h0 & 0x0f] +
            HEX_CHARS[(h1 >> 28) & 0x0f] +
            HEX_CHARS[(h1 >> 24) & 0x0f] +
            HEX_CHARS[(h1 >> 20) & 0x0f] +
            HEX_CHARS[(h1 >> 16) & 0x0f] +
            HEX_CHARS[(h1 >> 12) & 0x0f] +
            HEX_CHARS[(h1 >> 8) & 0x0f] +
            HEX_CHARS[(h1 >> 4) & 0x0f] +
            HEX_CHARS[h1 & 0x0f] +
            HEX_CHARS[(h2 >> 28) & 0x0f] +
            HEX_CHARS[(h2 >> 24) & 0x0f] +
            HEX_CHARS[(h2 >> 20) & 0x0f] +
            HEX_CHARS[(h2 >> 16) & 0x0f] +
            HEX_CHARS[(h2 >> 12) & 0x0f] +
            HEX_CHARS[(h2 >> 8) & 0x0f] +
            HEX_CHARS[(h2 >> 4) & 0x0f] +
            HEX_CHARS[h2 & 0x0f] +
            HEX_CHARS[(h3 >> 28) & 0x0f] +
            HEX_CHARS[(h3 >> 24) & 0x0f] +
            HEX_CHARS[(h3 >> 20) & 0x0f] +
            HEX_CHARS[(h3 >> 16) & 0x0f] +
            HEX_CHARS[(h3 >> 12) & 0x0f] +
            HEX_CHARS[(h3 >> 8) & 0x0f] +
            HEX_CHARS[(h3 >> 4) & 0x0f] +
            HEX_CHARS[h3 & 0x0f] +
            HEX_CHARS[(h4 >> 28) & 0x0f] +
            HEX_CHARS[(h4 >> 24) & 0x0f] +
            HEX_CHARS[(h4 >> 20) & 0x0f] +
            HEX_CHARS[(h4 >> 16) & 0x0f] +
            HEX_CHARS[(h4 >> 12) & 0x0f] +
            HEX_CHARS[(h4 >> 8) & 0x0f] +
            HEX_CHARS[(h4 >> 4) & 0x0f] +
            HEX_CHARS[h4 & 0x0f]);
    }
    toString() {
        return this.hex();
    }
    digest() {
        this.finalize();
        const h0 = this.#h0;
        const h1 = this.#h1;
        const h2 = this.#h2;
        const h3 = this.#h3;
        const h4 = this.#h4;
        return [
            (h0 >> 24) & 0xff,
            (h0 >> 16) & 0xff,
            (h0 >> 8) & 0xff,
            h0 & 0xff,
            (h1 >> 24) & 0xff,
            (h1 >> 16) & 0xff,
            (h1 >> 8) & 0xff,
            h1 & 0xff,
            (h2 >> 24) & 0xff,
            (h2 >> 16) & 0xff,
            (h2 >> 8) & 0xff,
            h2 & 0xff,
            (h3 >> 24) & 0xff,
            (h3 >> 16) & 0xff,
            (h3 >> 8) & 0xff,
            h3 & 0xff,
            (h4 >> 24) & 0xff,
            (h4 >> 16) & 0xff,
            (h4 >> 8) & 0xff,
            h4 & 0xff,
        ];
    }
    array() {
        return this.digest();
    }
    arrayBuffer() {
        this.finalize();
        const buffer = new ArrayBuffer(20);
        const dataView = new DataView(buffer);
        dataView.setUint32(0, this.#h0);
        dataView.setUint32(4, this.#h1);
        dataView.setUint32(8, this.#h2);
        dataView.setUint32(12, this.#h3);
        dataView.setUint32(16, this.#h4);
        return buffer;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhMS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNoYTEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBWUEsTUFBTSxTQUFTLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQy9DLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQVUsQ0FBQztBQUMxRCxNQUFNLEtBQUssR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBVSxDQUFDO0FBRXRDLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztBQUU1QixNQUFNLE9BQU8sSUFBSTtJQUNmLE9BQU8sQ0FBWTtJQUNuQixNQUFNLENBQVU7SUFDaEIsTUFBTSxDQUFVO0lBQ2hCLE1BQU0sQ0FBVTtJQUNoQixPQUFPLENBQVU7SUFDakIsVUFBVSxDQUFXO0lBQ3JCLE9BQU8sQ0FBVztJQUVsQixHQUFHLEdBQUcsVUFBVSxDQUFDO0lBQ2pCLEdBQUcsR0FBRyxVQUFVLENBQUM7SUFDakIsR0FBRyxHQUFHLFVBQVUsQ0FBQztJQUNqQixHQUFHLEdBQUcsVUFBVSxDQUFDO0lBQ2pCLEdBQUcsR0FBRyxVQUFVLENBQUM7SUFDakIsY0FBYyxHQUFHLENBQUMsQ0FBQztJQUVuQixZQUFZLFlBQVksR0FBRyxLQUFLO1FBQzlCLElBQUksWUFBWSxFQUFFO1lBRWhCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FB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QUFDLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2xFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQzVEO3lCQUFNO3dCQUNMLElBQUksR0FBRyxPQUFPOzRCQUNaLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUMvRCxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ25FLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxD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QUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFMUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN2QixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRTFCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuRCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFMUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUMzQjtRQUVELE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRTFCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuRCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFMUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQzNCO1FBRUQsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDckIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9DLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUMzQjtRQUVELE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRTFCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMxQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFMUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEQsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQzNCO1FBRUQsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsR0FBRztRQUNELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVoQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNwQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFFcEIsT0FBTyxDQUNMLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzVCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzNCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDM0IsU0FBUyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDcEIsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzVCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzVCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDM0IsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMzQixTQUFTLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztZQUNwQixTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzVCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzVCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMzQixTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzNCLFNBQVMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzVCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzNCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDM0IsU0FBUyxDQUFDLEVBQUUsR0FB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