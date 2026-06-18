import {Player} from '../types';

const CHAMPIONS_BY_ROLE: {[key: string]: string[]} = {
  top: ['Aatrox', 'Jax', 'Riven', 'Camille', 'Fiora', 'Ornn', 'Renekton', 'Gnar', 'Darius', 'Garen'],
  jungle: ['Lee Sin', 'Viego', 'Graves', 'Jarvan IV', 'Xin Zhao', 'Nocturne', 'Nidalee', 'Elise', 'Sejuani', 'Shaco'],
  mid: ['Ahri', 'Yasuo', 'Zed', 'Syndra', 'Orianna', 'Viktor', 'Azir', 'LeBlanc', 'Ryze', 'Katarina'],
  adc: ['Ezreal', 'Kai\'Sa', 'Jinx', 'Caitlyn', 'Jhin', 'Vayne', 'Lucian', 'Ashe', 'Tristana', 'Aphelios'],
  support: ['Thresh', 'Lulu', 'Nautilus', 'Karma', 'Janna', 'Leona', 'Pyke', 'Rakan', 'Yuumi', 'Bard'],
  fill: ['Ezreal', 'Thresh', 'Lee Sin', 'Ahri', 'Jax']
};

export function enrichPlayerDetails(player: Player): Required<Player> {
  // Deterministic random generator based on player ID and name
  const seed = player.id + player.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const r1 = random(seed + 1);
  const r2 = random(seed + 2);
  const r3 = random(seed + 3);

  const primaryRole = player.role.toLowerCase();
  const championsPool = CHAMPIONS_BY_ROLE[primaryRole] || CHAMPIONS_BY_ROLE['fill'];

  const selectedChamps: string[] = [];
  let index = Math.floor(r1 * championsPool.length);
  selectedChamps.push(championsPool[index]);

  let index2 = Math.floor(r2 * championsPool.length);
  while (index2 === index) {
    index2 = (index2 + 1) % championsPool.length;
  }
  selectedChamps.push(championsPool[index2]);

  let index3 = Math.floor(r3 * championsPool.length);
  while (index3 === index || index3 === index2) {
    index3 = (index3 + 1) % championsPool.length;
  }
  selectedChamps.push(championsPool[index3]);

  const gamesCount = Math.floor(r1 * 250) + 30; // 30 to 280 games
  const winratePercent = 48 + (r2 * 10); // 48.0% to 58.0%
  const wins = Math.round((winratePercent / 100) * gamesCount);
  const winrateStr = `${((wins / gamesCount) * 100).toFixed(1)}% (${wins}W - ${gamesCount - wins}L)`;

  const preferences = {
    top: 2,
    jungle: 2,
    mid: 2,
    adc: 2,
    support: 2
  };

  // Map primary role to 5
  if (primaryRole in preferences) {
    preferences[primaryRole as keyof typeof preferences] = 5;
  } else if (primaryRole === 'fill') {
    preferences.top = 4;
    preferences.jungle = 4;
    preferences.mid = 4;
    preferences.adc = 4;
    preferences.support = 4;
  }

  // Map secondary roles to 4
  player.secondaryRoles.forEach((secRole) => {
    const roleKey = secRole.toLowerCase();
    if (roleKey in preferences) {
      preferences[roleKey as keyof typeof preferences] = 4;
    }
  });

  // Assign deterministic lower preferences to remaining roles
  let offset = seed;
  Object.keys(preferences).forEach((role) => {
    const roleKey = role as keyof typeof preferences;
    if (preferences[roleKey] === 2) {
      offset += 7;
      preferences[roleKey] = Math.floor(random(offset) * 3) + 1; // 1, 2, or 3
    }
  });

  const kda = (2.0 + r1 * 2.5).toFixed(2);
  const visionScorePerMin = (0.5 + r2 * 1.5).toFixed(2);
  const csPerMin = (primaryRole === 'support' ? 1.0 + r3 * 1.5 : 5.0 + r3 * 4.0).toFixed(1);

  const additionalStats = {
    'KDA Ratio': `${kda}:1`,
    'Vision Score / Min': visionScorePerMin,
    'CS / Min': csPerMin,
    'MVP Awards': Math.floor(r1 * 8)
  };

  return {
    ...player,
    mostPlayedChampions: player.mostPlayedChampions || selectedChamps,
    rankedWinrate: player.rankedWinrate || winrateStr,
    rolePreferences: player.rolePreferences || preferences,
    additionalStats: player.additionalStats || additionalStats,
    teamId: player.teamId !== undefined ? player.teamId : null,
    previousSeasons: player.previousSeasons || []
  };
}
