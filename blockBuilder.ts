type Block = { type: 'shuntsu' | 'koutsu' | 'janto', tiles: string[], isNaki?: boolean, nakiType?: 'chi' | 'pon' | 'ankan' | 'minkan' };

// We need to generate 4 mentsu and 1 janto.
// If naki is allowed, we can set isNaki to true for some mentsu.
