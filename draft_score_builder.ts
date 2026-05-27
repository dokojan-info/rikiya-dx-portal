import Riichi from 'riichi';

const NUM_SUITS = ['m', 'p', 's'] as const;
const ALL_SUITS = ['m', 'p', 's', 'z'] as const;

const ALL_TILES: string[] = [];
ALL_SUITS.forEach((suit) => {
  const max = suit === 'z' ? 7 : 9;
  for (let i = 1; i <= max; i++) ALL_TILES.push(`${i}${suit}`);
});

const TANYAO_TILES: string[] = [];
NUM_SUITS.forEach((suit) => {
  for (let i = 2; i <= 8; i++) TANYAO_TILES.push(`${i}${suit}`);
});
const DRAGON_TILES = ['5z', '6z', '7z'];

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

type Block = { type: 'shuntsu' | 'koutsu' | 'janto', suit: string, start?: number, tile?: string, isNaki?: boolean, nakiType?: 'chi' | 'pon' | 'minkan' | 'ankan' };

export const buildCustomScoreProblem = (options: any) => {
    // 1. Determine constraints from Yaku filter
    let suitLimit: string | undefined = undefined;
    let pool = ALL_TILES;
    let forceDragon = false;
    let forceShuntsu = false;

    if (options.yakuFilter && options.yakuFilter.length > 0) {
        if (options.yakuFilter.includes("清一色")) {
            suitLimit = pick(NUM_SUITS);
            pool = pool.filter(t => t[1] === suitLimit);
        } else if (options.yakuFilter.includes("混一色")) {
            suitLimit = pick(NUM_SUITS);
            pool = pool.filter(t => t[1] === suitLimit || t[1] === 'z');
        } else if (options.yakuFilter.includes("タンヤオ")) {
            pool = TANYAO_TILES;
        }
        if (options.yakuFilter.includes("役牌")) forceDragon = true;
        if (options.yakuFilter.includes("平和")) forceShuntsu = true;
    }

    let waitType = "tanki";
    if (options.waitTypes && options.waitTypes.length > 0) {
        waitType = pick(options.waitTypes);
    } else {
        waitType = pick(["tanki", "ryanmen", "shanpon", "nobetan"]);
    }

    const blocks: Block[] = [];
    
    // Generate Wait Block
    let winningTile = "";
    if (waitType === "tanki") {
        const t = pick(pool);
        blocks.push({ type: 'janto', suit: t[1], tile: t });
        winningTile = t;
    } else if (waitType === "ryanmen") {
        const s = suitLimit || pick(NUM_SUITS);
        const validStarts = forceShuntsu ? [2,3,4,5,6] : [2,3,4,5,6]; // 23 wait 1,4 to 67 wait 5,8. (12 is penchan)
        const start = pick(validStarts);
        blocks.push({ type: 'shuntsu', suit: s, start });
        winningTile = Math.random() < 0.5 ? `${start-1}${s}` : `${start+3}${s}`;
    } else if (waitType === "shanpon") {
        const t = pick(pool);
        blocks.push({ type: 'koutsu', suit: t[1], tile: t });
        winningTile = t;
        // Shanpon requires another pair, so we force one of the other blocks to be a pair later, wait no.
        // If we just remove one from a koutsu, the 13-tile hand has 1 pair. The other pair is the Janto!
        // So any Koutsu can be the shanpon wait!
    } else if (waitType === "nobetan") {
        const s = suitLimit || pick(NUM_SUITS);
        const start = pick([2,3,4,5,6]);
        blocks.push({ type: 'shuntsu', suit: s, start });
        // Janto must connect. So janto is either start-1 or start+3
        const jantoStart = Math.random() < 0.5 ? start-1 : start+3;
        blocks.push({ type: 'janto', suit: s, tile: `${jantoStart}${s}` });
        winningTile = `${jantoStart}${s}`;
    }

    // Generate remaining blocks
    let jantoCount = blocks.filter(b => b.type === 'janto').length;
    let mentsuCount = blocks.filter(b => b.type !== 'janto').length;

    if (jantoCount === 0) {
        // Must add a janto
        let t = pick(pool);
        if (forceShuntsu) {
            // Pinfu janto cannot be yakuhai
            const nonYakuhai = pool.filter(x => !['5z','6z','7z'].includes(x));
            t = pick(nonYakuhai);
        }
        blocks.push({ type: 'janto', suit: t[1], tile: t });
    }

    while (mentsuCount < 4) {
        if (forceDragon && !blocks.some(b => b.tile && DRAGON_TILES.includes(b.tile))) {
            const d = pick(DRAGON_TILES);
            blocks.push({ type: 'koutsu', suit: 'z', tile: d });
        } else if (forceShuntsu) {
            const s = suitLimit || pick(NUM_SUITS);
            const start = randInt(1, 7);
            blocks.push({ type: 'shuntsu', suit: s, start });
        } else {
            if (Math.random() < 0.6) {
                const s = suitLimit || pick(NUM_SUITS);
                const start = randInt(1, 7);
                blocks.push({ type: 'shuntsu', suit: s, start });
            } else {
                const t = pick(pool);
                blocks.push({ type: 'koutsu', suit: t[1], tile: t });
            }
        }
        mentsuCount++;
    }

    // Apply Naki
    if (options.allowNaki || options.allowAnkan) {
        const waitBlockIndex = 0; // The first block is the wait block, except for nobetan where 0 and 1 are wait blocks.
        // Actually, let's just avoid Naki on the wait block.
        for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].type === 'janto') continue;
            if (waitType === "nobetan" && i <= 1) continue;
            if (i === 0) continue; // Wait block

            if (options.allowNaki && Math.random() < 0.3) {
                blocks[i].isNaki = true;
                if (blocks[i].type === 'shuntsu') blocks[i].nakiType = 'chi';
                else blocks[i].nakiType = pick(['pon', 'minkan']);
            } else if (options.allowAnkan && blocks[i].type === 'koutsu' && Math.random() < 0.2) {
                blocks[i].isNaki = true;
                blocks[i].nakiType = 'ankan';
            }
        }
    }

    // Format output
    let closedTiles: string[] = [];
    let nakiStr = "";
    let suffixText = "";
    
    // We must remove the winning tile from the WAIT block.
    // So we need to carefully build the closed tiles.
    blocks.forEach((b, i) => {
        let blockTiles: string[] = [];
        if (b.type === 'shuntsu') {
            blockTiles = [`${b.start}${b.suit}`, `${b.start!+1}${b.suit}`, `${b.start!+2}${b.suit}`];
        } else {
            blockTiles = [b.tile!, b.tile!, b.tile!];
            if (b.type === 'janto') blockTiles = [b.tile!, b.tile!];
            if (b.nakiType === 'minkan' || b.nakiType === 'ankan') blockTiles.push(b.tile!);
        }

        // If this is the wait block, remove the winning tile
        if (i === 0 || (waitType === 'nobetan' && i === 1)) {
            const winIdx = blockTiles.indexOf(winningTile);
            if (winIdx !== -1) {
                blockTiles.splice(winIdx, 1);
                closedTiles.push(...blockTiles);
                return; // done with wait block
            }
        }

        if (b.isNaki) {
            if (b.nakiType === 'chi') {
                nakiStr += `+${blockTiles.join('')}`;
                suffixText += ` ${blockTiles[0]}-${blockTiles[1]}${blockTiles[2]}(チー)`;
            } else if (b.nakiType === 'pon') {
                nakiStr += `+${blockTiles[0]}${blockTiles[1]}${blockTiles[2]}`;
                suffixText += ` ${blockTiles[0]}-${blockTiles[1]}${blockTiles[2]}(ポン)`;
            } else if (b.nakiType === 'minkan') {
                nakiStr += `+${blockTiles[0]}${blockTiles[1]}${blockTiles[2]}${blockTiles[3]}`;
                suffixText += ` ${blockTiles[0]}-${blockTiles[1]}${blockTiles[2]}${blockTiles[3]}(明槓)`;
            } else if (b.nakiType === 'ankan') {
                nakiStr += `+${blockTiles[0]}${blockTiles[1]}`; // Riichi package format for Ankan is +55z
                suffixText += ` 0z${blockTiles[0]}${blockTiles[1]}0z(暗槓)`;
            }
        } else {
            closedTiles.push(...blockTiles);
        }
    });

    const isTsumo = Math.random() < 0.5;
    const riichiInput = closedTiles.join('') + nakiStr + (isTsumo && nakiStr ? '' : '') + winningTile; // Wait, riichi needs closed + naki + win
    // Actually, test_riichi_str.js showed: 123m456p11z+789s+222z2z works.
    
    return {
        riichiInput,
        formattedTenpai: closedTiles.join(''),
        suffix: `${winningTile} ${isTsumo ? 'ツモ' : 'ロン'}${suffixText}`,
    };
}
