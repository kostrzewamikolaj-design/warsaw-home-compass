// Mulberry32 — fast seeded PRNG
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box–Muller normal sampler given a [0,1) RNG
export function makeNormal(rng: () => number): (mu: number, sigma: number) => number {
  let cached: number | null = null;
  return function (mu: number, sigma: number) {
    if (cached !== null) {
      const v = cached;
      cached = null;
      return mu + sigma * v;
    }
    let u = 0,
      v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    const mag = Math.sqrt(-2.0 * Math.log(u));
    const z0 = mag * Math.cos(2 * Math.PI * v);
    const z1 = mag * Math.sin(2 * Math.PI * v);
    cached = z1;
    return mu + sigma * z0;
  };
}
