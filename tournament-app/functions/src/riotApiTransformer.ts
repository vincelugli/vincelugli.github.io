import {BanDto, MatchDto, ParticipantDto, TeamDto} from "./types";
import * as functions from "firebase-functions";

const championIdMap: {[key: string]: string} = {
  266: "Aatrox",
  103: "Ahri",
  84: "Akali",
  166: "Akshan",
  12: "Alistar",
  799: "Ambessa",
  32: "Amumu",
  34: "Anivia",
  1: "Annie",
  523: "Aphelios",
  22: "Ashe",
  136: "AurelionSol",
  893: "Aurora",
  268: "Azir",
  432: "Bard",
  200: "Belveth",
  53: "Blitzcrank",
  63: "Brand",
  201: "Braum",
  233: "Briar",
  51: "Caitlyn",
  164: "Camille",
  69: "Cassiopeia",
  31: "Chogath",
  42: "Corki",
  122: "Darius",
  131: "Diana",
  119: "Draven",
  36: "DrMundo",
  245: "Ekko",
  60: "Elise",
  28: "Evelynn",
  81: "Ezreal",
  9: "Fiddlesticks",
  114: "Fiora",
  105: "Fizz",
  3: "Galio",
  41: "Gangplank",
  86: "Garen",
  150: "Gnar",
  79: "Gragas",
  104: "Graves",
  887: "Gwen",
  120: "Hecarim",
  74: "Heimerdinger",
  910: "Hwei",
  420: "Illaoi",
  39: "Irelia",
  427: "Ivern",
  40: "Janna",
  59: "JarvanIV",
  24: "Jax",
  126: "Jayce",
  202: "Jhin",
  222: "Jinx",
  145: "JarvanIV",
  429: "Kalista",
  43: "Karma",
  30: "Karthus",
  38: "Kassadin",
  55: "Katarina",
  10: "Kayle",
  141: "Kayn",
  85: "Kennen",
  121: "Khazix",
  203: "Kindred",
  240: "Kled",
  96: "KogMaw",
  897: "KSante",
  7: "Leblanc",
  64: "LeeSin",
  89: "Leona",
  876: "Lillia",
  127: "Lissandra",
  236: "Lucian",
  117: "Lulu",
  99: "Lux",
  54: "Malphite",
  90: "Malzahar",
  57: "Maokai",
  11: "MasterYi",
  800: "Mel",
  902: "Milio",
  21: "MissFortune",
  62: "MonkeyKing",
  82: "Mordekaiser",
  25: "Morgana",
  950: "Naafiri",
  267: "Nami",
  75: "Nasus",
  111: "Nautilus",
  518: "Neeko",
  76: "Nidalee",
  895: "Nilah",
  56: "Nocturne",
  20: "Nunu",
  2: "Olaf",
  61: "Orianna",
  516: "Ornn",
  80: "Pantheon",
  78: "Poppy",
  555: "Pyke",
  246: "Qiyana",
  133: "Quinn",
  497: "Rakan",
  33: "Rammus",
  421: "RekSai",
  526: "Rell",
  888: "Renata",
  58: "Renekton",
  107: "Rengar",
  92: "Riven",
  68: "Rumble",
  13: "Ryze",
  360: "Samira",
  113: "Sejuani",
  235: "Senna",
  147: "Seraphine",
  875: "Sett",
  35: "Shaco",
  98: "Shen",
  102: "Shyvana",
  27: "Singed",
  14: "Sion",
  15: "Sivir",
  72: "Skarner",
  901: "Smolder",
  37: "Sona",
  16: "Soraka",
  50: "Swain",
  517: "Sylas",
  134: "Syndra",
  223: "TahmKench",
  163: "Taliyah",
  91: "Talon",
  44: "Taric",
  17: "Teemo",
  412: "Thresh",
  18: "Tristana",
  48: "Trundle",
  23: "Tryndamere",
  4: "TwistedFate",
  29: "Twitch",
  77: "Udyr",
  6: "Urgot",
  110: "Varus",
  67: "Vayne",
  45: "Veigar",
  161: "Velkoz",
  711: "Vex",
  254: "Vi",
  234: "Viego",
  112: "Viktor",
  8: "Vladimir",
  106: "Volibear",
  19: "Warwick",
  498: "Xayah",
  101: "Xerath",
  5: "XinZhao",
  157: "Yasuo",
  777: "Yone",
  83: "Yorick",
  804: "Yunara",
  350: "Yuumi",
  154: "Zac",
  238: "Zed",
  221: "Zeri",
  115: "Ziggs",
  26: "Zilean",
  142: "Zoe",
  143: "Zyra",
};

const summonerSpellIdMap: {[key: number]: string} = {
  21: "SummonerBarrier",
  1: "SummonerBoost",
  2202: "SummonerCherryFlash",
  2201: "SummonerCherryHold",
  14: "SummonerDot",
  3: "SummonerExhaust",
  4: "SummonerFlash",
  6: "SummonerHaste",
  7: "SummonerHeal",
  13: "SummonerMana",
  30: "SummonerPoroRecall",
  31: "SummonerPoroThrow",
  11: "SummonerSmite",
  39: "SummonerSnowURFSnowball_Mark",
  32: "SummonerSnowball",
  12: "SummonerTeleport",
  54: "Summoner_UltBookPlaceholder",
};

/**
 * Transforms riot api output to less datra
 * @param {MatchDto} riotMatchData
 * @return {any}
 */
export async function transformRiotDataToMatchResult(riotMatchData: MatchDto) {
  const info = riotMatchData.info;
  const blueTeamBans: string[] = [];
  const redTeamBans: string[] = [];

  // Process bans
  info.teams.forEach((team: TeamDto) => {
    functions.logger.debug(
      `Adding bans from ${JSON.stringify(team)}`
    );
    team.bans.forEach((ban: BanDto) => {
      const champName = championIdMap[ban.championId];
      if (champName) {
        if (team.teamId === 100) blueTeamBans.push(champName);
        else redTeamBans.push(champName);
      }
    });
  });

  const blueTeamPlayers: any[] = [];
  const redTeamPlayers: any[] = [];

  // Process participants
  info.participants.forEach((p: ParticipantDto) => {
    functions.logger.debug(
      `Adding players from ${JSON.stringify(p)}`
    );
    const playerResult = {
      playerName: `${p.riotIdGameName}#${p.riotIdTagline}`,
      championName: p.championName,
      summonerSpells: [
        summonerSpellIdMap[p.summoner1Id] || "UnknownSpell",
        summonerSpellIdMap[p.summoner2Id] || "UnknownSpell",
      ],
      items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
    };

    if (p.teamId === 100) {
      blueTeamPlayers.push(playerResult);
    } else {
      redTeamPlayers.push(playerResult);
    }
  });

  return {
    blueTeam: {bans: blueTeamBans, players: blueTeamPlayers},
    redTeam: {bans: redTeamBans, players: redTeamPlayers},
    gameDuration: info.gameDuration,
    winner: info.teams.find((t: any) => t.win)?.teamId || -1,
  };
}
