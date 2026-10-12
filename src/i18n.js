import { useSyncExternalStore } from "react";

const STORAGE_KEY = "pitchiq:language";
const supportedLanguages = ["en", "es", "fr", "de", "ar", "pt"];

const translations = {
  en: {
    hub: "Hub", versusLobby: "Versus lobby", stats: "Stats", startingXI: "Starting XI", career: "Career", tactics: "Tactics",
    soundOn: "Mute sound effects", soundOff: "Enable sound effects", language: "Language",
    heroEyebrow: "The Ultimate Football IQ Arcade", heroTitle: "Every Era. Every Angle.", heroSubtitle: "One More Game.",
    heroDescription: "Test your football tactical intuition, trace world-class career paths, decode managerial philosophies, and battle friends in 1v1 and 2v2 multiplayer lobby rooms.",
    versusCta: "Versus Lobby (1v1 & 2v2)", quickXI: "Quick Starting XI", roundsCompleted: "Rounds Completed",
    modeSuite: "Game Mode Suite", chooseChallenge: "Choose Your Challenge", all: "All", multiplayer: "Multiplayer",
    tactical: "Tactical", trivia: "Trivia", speed: "Speed", strategy: "Strategy", play: "Play",
    mode_lineup: "Guess the Lineup", mode_transfer: "Transfer Chain", mode_tactics: "Tactical Breakdown", mode_market: "Market Value", mode_grid: "Football Matrix", mode_whoami: "Who Am I?", mode_var: "VAR Blitz", mode_invasion: "Trivia Invasion",
  },
  es: {
    hub: "Inicio", versusLobby: "Sala versus", stats: "EstadÃ­sticas", startingXI: "Once inicial", career: "Trayectoria", tactics: "TÃ¡ctica",
    soundOn: "Silenciar efectos", soundOff: "Activar efectos", language: "Idioma",
    heroEyebrow: "El arcade definitivo de inteligencia futbolÃ­stica", heroTitle: "Cada Ã©poca. Cada Ã¡ngulo.", heroSubtitle: "Una partida mÃ¡s.",
    heroDescription: "Pon a prueba tu intuiciÃ³n tÃ¡ctica, recorre trayectorias de estrellas, descifra filosofÃ­as de entrenadores y compite contra tus amigos en salas 1 contra 1 y 2 contra 2.",
    versusCta: "Sala versus (1 contra 1 y 2 contra 2)", quickXI: "Once inicial rÃ¡pido", roundsCompleted: "Rondas completadas",
    modeSuite: "Modos de juego", chooseChallenge: "Elige tu desafÃ­o", all: "Todos", multiplayer: "Multijugador",
    tactical: "TÃ¡ctica", trivia: "Preguntas", speed: "Velocidad", strategy: "Estrategia", play: "Jugar",
    mode_lineup: "Adivina el once", mode_transfer: "Cadena de fichajes", mode_tactics: "AnÃ¡lisis tÃ¡ctico", mode_market: "Valor de mercado", mode_grid: "Matriz futbolÃ­stica", mode_whoami: "Â¿QuiÃ©n soy?", mode_var: "Reto VAR", mode_invasion: "InvasiÃ³n de preguntas",
  },
  fr: {
    hub: "Accueil", versusLobby: "Salon Versus", stats: "Statistiques", startingXI: "Onze de dÃ©part", career: "CarriÃ¨re", tactics: "Tactique",
    soundOn: "Couper les effets sonores", soundOff: "Activer les effets sonores", language: "Langue",
    heroEyebrow: "L'arcade ultime de culture football", heroTitle: "Chaque Ã©poque. Chaque angle.", heroSubtitle: "Encore une partie.",
    heroDescription: "Testez votre intuition tactique, retracez les carriÃ¨res des stars, dÃ©cryptez les philosophies des entraÃ®neurs et dÃ©fiez vos amis en 1 contre 1 ou 2 contre 2.",
    versusCta: "Salon Versus (1 contre 1 et 2 contre 2)", quickXI: "Onze express", roundsCompleted: "Manches terminÃ©es",
    modeSuite: "Modes de jeu", chooseChallenge: "Choisissez votre dÃ©fi", all: "Tout", multiplayer: "Multijoueur",
    tactical: "Tactique", trivia: "Quiz", speed: "Vitesse", strategy: "StratÃ©gie", play: "Jouer",
    mode_lineup: "Devinez le onze", mode_transfer: "ChaÃ®ne de transferts", mode_tactics: "Analyse tactique", mode_market: "Valeur marchande", mode_grid: "Matrice football", mode_whoami: "Qui suis-je ?", mode_var: "DÃ©fi VAR", mode_invasion: "Invasion quiz",
  },
  de: {
    hub: "Start", versusLobby: "Versus-Lobby", stats: "Statistik", startingXI: "Startelf", career: "Karriere", tactics: "Taktik",
    soundOn: "Soundeffekte stummschalten", soundOff: "Soundeffekte aktivieren", language: "Sprache",
    heroEyebrow: "Die ultimative FuÃŸball-IQ-Arcade", heroTitle: "Jede Ã„ra. Jeder Blickwinkel.", heroSubtitle: "Noch eine Runde.",
    heroDescription: "Teste dein taktisches GespÃ¼r, verfolge die Karrieren der Stars, entschlÃ¼ssele Trainerphilosophien und tritt in 1-gegen-1- und 2-gegen-2-Lobbys gegen Freunde an.",
    versusCta: "Versus-Lobby (1 gegen 1 & 2 gegen 2)", quickXI: "Schnelle Startelf", roundsCompleted: "Runden gespielt",
    modeSuite: "Spielmodi", chooseChallenge: "WÃ¤hle deine Herausforderung", all: "Alle", multiplayer: "Mehrspieler",
    tactical: "Taktik", trivia: "Quiz", speed: "Tempo", strategy: "Strategie", play: "Spielen",
    mode_lineup: "Errate die Startelf", mode_transfer: "Transferkette", mode_tactics: "Taktikanalyse", mode_market: "Marktwert", mode_grid: "FuÃŸballmatrix", mode_whoami: "Wer bin ich?", mode_var: "VAR-Blitz", mode_invasion: "Quiz-Invasion",
  },
  ar: {
    hub: "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©", versusLobby: "Ø±Ø¯Ù‡Ø© Ø§Ù„Ù…ÙˆØ§Ø¬Ù‡Ø©", stats: "Ø§Ù„Ø¥Ø­ØµØ§Ø¡Ø§Øª", startingXI: "Ø§Ù„ØªØ´ÙƒÙŠÙ„Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©", career: "Ø§Ù„Ù…Ø³ÙŠØ±Ø©", tactics: "Ø§Ù„ØªÙƒØªÙŠÙƒ",
    soundOn: "ÙƒØªÙ… Ø§Ù„Ù…Ø¤Ø«Ø±Ø§Øª Ø§Ù„ØµÙˆØªÙŠØ©", soundOff: "ØªÙØ¹ÙŠÙ„ Ø§Ù„Ù…Ø¤Ø«Ø±Ø§Øª Ø§Ù„ØµÙˆØªÙŠØ©", language: "Ø§Ù„Ù„ØºØ©",
    heroEyebrow: "Ø£Ø±ÙˆØ¹ Ø£Ù„Ø¹Ø§Ø¨ Ø°ÙƒØ§Ø¡ ÙƒØ±Ø© Ø§Ù„Ù‚Ø¯Ù…", heroTitle: "ÙƒÙ„ Ø§Ù„Ø¹ØµÙˆØ±. ÙƒÙ„ Ø§Ù„Ø²ÙˆØ§ÙŠØ§.", heroSubtitle: "Ù…Ø¨Ø§Ø±Ø§Ø© Ø£Ø®Ø±Ù‰.",
    heroDescription: "Ø§Ø®ØªØ¨Ø± Ø­Ø¯Ø³Ùƒ Ø§Ù„ØªÙƒØªÙŠÙƒÙŠØŒ ÙˆØªØªØ¨Ø¹ Ù…Ø³ÙŠØ±Ø§Øª Ø§Ù„Ù†Ø¬ÙˆÙ…ØŒ ÙˆØ§ÙƒØªØ´Ù Ø£ÙÙƒØ§Ø± Ø§Ù„Ù…Ø¯Ø±Ø¨ÙŠÙ†ØŒ ÙˆØªÙ†Ø§ÙØ³ Ù…Ø¹ Ø£ØµØ¯Ù‚Ø§Ø¦Ùƒ ÙÙŠ Ù…Ø¨Ø§Ø±ÙŠØ§Øª ÙØ±Ø¯ÙŠØ© ÙˆØ«Ù†Ø§Ø¦ÙŠØ©.",
    versusCta: "Ø±Ø¯Ù‡Ø© Ø§Ù„Ù…ÙˆØ§Ø¬Ù‡Ø© (ÙØ±Ø¯ÙŠ ÙˆØ«Ù†Ø§Ø¦ÙŠ)", quickXI: "ØªØ´ÙƒÙŠÙ„Ø© Ø³Ø±ÙŠØ¹Ø©", roundsCompleted: "Ø§Ù„Ø¬ÙˆÙ„Ø§Øª Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø©",
    modeSuite: "Ø£ÙˆØ¶Ø§Ø¹ Ø§Ù„Ù„Ø¹Ø¨", chooseChallenge: "Ø§Ø®ØªØ± ØªØ­Ø¯ÙŠÙƒ", all: "Ø§Ù„ÙƒÙ„", multiplayer: "Ù…ØªØ¹Ø¯Ø¯ Ø§Ù„Ù„Ø§Ø¹Ø¨ÙŠÙ†",
    tactical: "ØªÙƒØªÙŠÙƒ", trivia: "Ù…Ø¹Ù„ÙˆÙ…Ø§Øª", speed: "Ø³Ø±Ø¹Ø©", strategy: "Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ©", play: "Ø§Ù„Ø¹Ø¨",
    mode_lineup: "Ø®Ù…Ù† Ø§Ù„ØªØ´ÙƒÙŠÙ„Ø©", mode_transfer: "Ø³Ù„Ø³Ù„Ø© Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„Ø§Øª", mode_tactics: "ØªØ­Ù„ÙŠÙ„ ØªÙƒØªÙŠÙƒÙŠ", mode_market: "Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ø³ÙˆÙ‚ÙŠØ©", mode_grid: "Ù…ØµÙÙˆÙØ© ÙƒØ±Ø© Ø§Ù„Ù‚Ø¯Ù…", mode_whoami: "Ù…Ù† Ø£Ù†Ø§ØŸ", mode_var: "ØªØ­Ø¯ÙŠ Ø§Ù„ÙØ§Ø±", mode_invasion: "ØºØ²Ùˆ Ø§Ù„Ø£Ø³Ø¦Ù„Ø©",
  },
  pt: {
    hub: "InÃ­cio", versusLobby: "Sala versus", stats: "EstatÃ­sticas", startingXI: "Onze inicial", career: "Carreira", tactics: "TÃ¡tica",
    soundOn: "Silenciar efeitos sonoros", soundOff: "Ativar efeitos sonoros", language: "Idioma",
    heroEyebrow: "O arcade definitivo de inteligÃªncia futebolÃ­stica", heroTitle: "Cada era. Cada Ã¢ngulo.", heroSubtitle: "Mais uma partida.",
    heroDescription: "Teste sua intuiÃ§Ã£o tÃ¡tica, acompanhe as carreiras dos craques, decifre as filosofias dos treinadores e enfrente amigos em salas 1 contra 1 e 2 contra 2.",
    versusCta: "Sala versus (1 contra 1 e 2 contra 2)", quickXI: "Onze inicial rÃ¡pido", roundsCompleted: "Rodadas concluÃ­das",
    modeSuite: "Modos de jogo", chooseChallenge: "Escolha seu desafio", all: "Todos", multiplayer: "Multijogador",
    tactical: "TÃ¡tica", trivia: "Quiz", speed: "Velocidade", strategy: "EstratÃ©gia", play: "Jogar",
    mode_lineup: "Adivinhe o onze", mode_transfer: "Cadeia de transferÃªncias", mode_tactics: "AnÃ¡lise tÃ¡tica", mode_market: "Valor de mercado", mode_grid: "Matriz do futebol", mode_whoami: "Quem sou eu?", mode_var: "Desafio VAR", mode_invasion: "InvasÃ£o de perguntas",
  },
};

const leagueDescriptions = {
  en: {
    "champions-league": "All 36 clubs competing in the UEFA Champions League league phase.",
    global: "World football, continental champions and international icons.",
    england: "Premier League clubs, international stars and major honors.",
    spain: "La Liga giants, nationalities and European honors.",
    italy: "Serie A clubs, nationalities and trophy-winning players.",
    germany: "Bundesliga clubs, German internationals and European winners.",
    france: "Ligue 1 clubs, world champions and global football stars.",
    netherlands: "Eredivisie clubs, Dutch internationals and European champions.",
    argentina: "Primera DivisiÃ³n clubs, national heroes and World Cup winners.",
    brazil: "BrasileirÃ£o clubs, SeleÃ§Ã£o stars and global honors.",
  },
  es: {
    "champions-league": "Los 36 clubes que compiten en la fase liga de la UEFA Champions League.",
    global: "FÃºtbol mundial, campeones continentales e iconos internacionales.",
    england: "Clubes de la Premier League, estrellas internacionales y grandes tÃ­tulos.",
    spain: "Grandes clubes de La Liga, nacionalidades y tÃ­tulos europeos.",
    italy: "Clubes de la Serie A, nacionalidades y jugadores campeones.",
    germany: "Clubes de la Bundesliga, internacionales alemanes y campeones europeos.",
    france: "Clubes de la Ligue 1, campeones del mundo y estrellas del fÃºtbol.",
    netherlands: "Clubes de la Eredivisie, internacionales neerlandeses y campeones europeos.",
    argentina: "Clubes de Primera DivisiÃ³n, hÃ©roes nacionales y campeones del mundo.",
    brazil: "Clubes del BrasileirÃ£o, estrellas de la SeleÃ§Ã£o y grandes tÃ­tulos.",
  },
  fr: {
    "champions-league": "Les 36 clubs engagÃ©s dans la phase de ligue de lâ€™UEFA Champions League.",
    global: "Le football mondial, les champions continentaux et les stars internationales.",
    england: "Clubs de Premier League, stars internationales et grands titres.",
    spain: "Grands clubs de Liga, nationalitÃ©s et titres europÃ©ens.",
    italy: "Clubs de Serie A, nationalitÃ©s et joueurs titrÃ©s.",
    germany: "Clubs de Bundesliga, internationaux allemands et champions dâ€™Europe.",
    france: "Clubs de Ligue 1, champions du monde et stars du football.",
    netherlands: "Clubs dâ€™Eredivisie, internationaux nÃ©erlandais et champions dâ€™Europe.",
    argentina: "Clubs de premiÃ¨re division, hÃ©ros nationaux et champions du monde.",
    brazil: "Clubs du BrasileirÃ£o, stars de la SeleÃ§Ã£o et grands titres.",
  },
  de: {
    "champions-league": "Alle 36 Klubs der Ligaphase der UEFA Champions League.",
    global: "WeltfuÃŸball, Kontinentalmeister und internationale Legenden.",
    england: "Premier-League-Klubs, internationale Stars und groÃŸe Titel.",
    spain: "La-Liga-Topklubs, NationalitÃ¤ten und europÃ¤ische Titel.",
    italy: "Serie-A-Klubs, NationalitÃ¤ten und Titelgewinner.",
    germany: "Bundesliga-Klubs, deutsche Nationalspieler und Europapokalsieger.",
    france: "Ligue-1-Klubs, Weltmeister und internationale FuÃŸballstars.",
    netherlands: "Eredivisie-Klubs, niederlÃ¤ndische Nationalspieler und Europapokalsieger.",
    argentina: "Erstligaklubs, Nationalhelden und Weltmeister.",
    brazil: "BrasileirÃ£o-Klubs, SeleÃ§Ã£o-Stars und groÃŸe Titel.",
  },
  ar: {
    "champions-league": "Ø§Ù„Ø£Ù†Ø¯ÙŠØ© Ø§Ù„Ù€Ù£Ù¦ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ© ÙÙŠ Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø¯ÙˆØ±ÙŠ Ù…Ù† Ø¯ÙˆØ±ÙŠ Ø£Ø¨Ø·Ø§Ù„ Ø£ÙˆØ±ÙˆØ¨Ø§.",
    global: "ÙƒØ±Ø© Ø§Ù„Ù‚Ø¯Ù… Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ© ÙˆØ£Ø¨Ø·Ø§Ù„ Ø§Ù„Ù‚Ø§Ø±Ø§Øª ÙˆØ£Ø¨Ø±Ø² Ø§Ù„Ù†Ø¬ÙˆÙ… Ø§Ù„Ø¯ÙˆÙ„ÙŠÙŠÙ†.",
    england: "Ø£Ù†Ø¯ÙŠØ© Ø§Ù„Ø¯ÙˆØ±ÙŠ Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ ÙˆØ§Ù„Ù†Ø¬ÙˆÙ… Ø§Ù„Ø¯ÙˆÙ„ÙŠÙˆÙ† ÙˆØ£Ù‡Ù… Ø§Ù„Ø£Ù„Ù‚Ø§Ø¨.",
    spain: "Ø£Ø¨Ø±Ø² Ø£Ù†Ø¯ÙŠØ© Ø§Ù„Ø¯ÙˆØ±ÙŠ Ø§Ù„Ø¥Ø³Ø¨Ø§Ù†ÙŠ ÙˆØ§Ù„Ø¬Ù†Ø³ÙŠØ§Øª ÙˆØ§Ù„Ø£Ù„Ù‚Ø§Ø¨ Ø§Ù„Ø£ÙˆØ±ÙˆØ¨ÙŠØ©.",
    italy: "Ø£Ù†Ø¯ÙŠØ© Ø§Ù„Ø¯ÙˆØ±ÙŠ Ø§Ù„Ø¥ÙŠØ·Ø§Ù„ÙŠ ÙˆØ§Ù„Ø¬Ù†Ø³ÙŠØ§Øª ÙˆØ§Ù„Ù„Ø§Ø¹Ø¨ÙˆÙ† Ø§Ù„Ù…ØªÙˆØ¬ÙˆÙ† Ø¨Ø§Ù„Ø£Ù„Ù‚Ø§Ø¨.",
    germany: "Ø£Ù†Ø¯ÙŠØ© Ø§Ù„Ø¯ÙˆØ±ÙŠ Ø§Ù„Ø£Ù„Ù…Ø§Ù†ÙŠ ÙˆØ§Ù„Ø¯ÙˆÙ„ÙŠÙˆÙ† Ø§Ù„Ø£Ù„Ù…Ø§Ù† ÙˆØ£Ø¨Ø·Ø§Ù„ Ø£ÙˆØ±ÙˆØ¨Ø§.",
    france: "Ø£Ù†Ø¯ÙŠØ© Ø§Ù„Ø¯ÙˆØ±ÙŠ Ø§Ù„ÙØ±Ù†Ø³ÙŠ ÙˆØ£Ø¨Ø·Ø§Ù„ Ø§Ù„Ø¹Ø§Ù„Ù… ÙˆÙ†Ø¬ÙˆÙ… ÙƒØ±Ø© Ø§Ù„Ù‚Ø¯Ù….",
    netherlands: "Ø£Ù†Ø¯ÙŠØ© Ø§Ù„Ø¯ÙˆØ±ÙŠ Ø§Ù„Ù‡ÙˆÙ„Ù†Ø¯ÙŠ ÙˆØ§Ù„Ø¯ÙˆÙ„ÙŠÙˆÙ† Ø§Ù„Ù‡ÙˆÙ„Ù†Ø¯ÙŠÙˆÙ† ÙˆØ£Ø¨Ø·Ø§Ù„ Ø£ÙˆØ±ÙˆØ¨Ø§.",
    argentina: "Ø£Ù†Ø¯ÙŠØ© Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰ ÙˆØ§Ù„Ø£Ø¨Ø·Ø§Ù„ Ø§Ù„ÙˆØ·Ù†ÙŠÙˆÙ† ÙˆØ§Ù„ÙØ§Ø¦Ø²ÙˆÙ† Ø¨ÙƒØ£Ø³ Ø§Ù„Ø¹Ø§Ù„Ù….",
    brazil: "Ø£Ù†Ø¯ÙŠØ© Ø§Ù„Ø¯ÙˆØ±ÙŠ Ø§Ù„Ø¨Ø±Ø§Ø²ÙŠÙ„ÙŠ ÙˆÙ†Ø¬ÙˆÙ… Ø§Ù„Ø³ÙŠÙ„ÙŠØ³Ø§Ùˆ ÙˆØ£Ø¨Ø±Ø² Ø§Ù„Ø£Ù„Ù‚Ø§Ø¨.",
  },
  pt: {
    "champions-league": "Os 36 clubes que disputam a fase de liga da UEFA Champions League.",
    global: "Futebol mundial, campeÃµes continentais e Ã­cones internacionais.",
    england: "Clubes da Premier League, estrelas internacionais e grandes tÃ­tulos.",
    spain: "Destaques de La Liga, nacionalidades e tÃ­tulos europeus.",
    italy: "Clubes da Serie A, nacionalidades e jogadores campeÃµes.",
    germany: "Clubes da Bundesliga, internacionais alemÃ£es e campeÃµes europeus.",
    france: "Clubes da Ligue 1, campeÃµes mundiais e estrelas do futebol.",
    netherlands: "Clubes da Eredivisie, internacionais neerlandeses e campeÃµes europeus.",
    argentina: "Clubes da primeira divisÃ£o, herÃ³is nacionais e campeÃµes mundiais.",
    brazil: "Clubes do BrasileirÃ£o, estrelas da SeleÃ§Ã£o e grandes tÃ­tulos.",
  },
};

function readStoredLanguage() {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return supportedLanguages.includes(stored) ? stored : "en";
  } catch {
    return "en";
  }
}

const subscribers = new Set();

export const i18n = {
  language: readStoredLanguage(),
  t(key) {
    const [, leagueId] = key.match(/^leagueDescription:(.+)$/) || [];
    return (leagueId ? leagueDescriptions[this.language]?.[leagueId] : null)
      ?? translations[this.language]?.[key]
      ?? translations.en[key]
      ?? key;
  },
  changeLanguage(language) {
    const nextLanguage = supportedLanguages.includes(language) ? language : "en";
    this.language = nextLanguage;
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
      // Language still changes for this session if storage is unavailable.
    }
    this.syncDocumentLanguage();
    subscribers.forEach((notify) => notify());
    return Promise.resolve(nextLanguage);
  },
  syncDocumentLanguage() {
    if (typeof document === "undefined") return;
    document.documentElement.lang = this.language;
    document.documentElement.dir = this.language === "ar" ? "rtl" : "ltr";
  },
  subscribe(notify) {
    subscribers.add(notify);
    return () => subscribers.delete(notify);
  },
};

i18n.syncDocumentLanguage();

export function useLanguage() {
  return useSyncExternalStore(i18n.subscribe, () => i18n.language, () => "en");
}
