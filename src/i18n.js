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
    mode_lineup: "Guess the Lineup", mode_transfer: "Transfer Chain", mode_tactics: "Tactical Breakdown", mode_market: "Market Value", mode_grid: "Football Matrix", mode_whoami: "Who Am I?", mode_var: "VAR Blitz", mode_duo: "Duo Link", mode_invasion: "Trivia Invasion",
  },
  es: {
    hub: "Inicio", versusLobby: "Sala versus", stats: "Estadísticas", startingXI: "Once inicial", career: "Trayectoria", tactics: "Táctica",
    soundOn: "Silenciar efectos", soundOff: "Activar efectos", language: "Idioma",
    heroEyebrow: "El arcade definitivo de inteligencia futbolística", heroTitle: "Cada época. Cada ángulo.", heroSubtitle: "Una partida más.",
    heroDescription: "Pon a prueba tu intuición táctica, recorre trayectorias de estrellas, descifra filosofías de entrenadores y compite contra tus amigos en salas 1 contra 1 y 2 contra 2.",
    versusCta: "Sala versus (1 contra 1 y 2 contra 2)", quickXI: "Once inicial rápido", roundsCompleted: "Rondas completadas",
    modeSuite: "Modos de juego", chooseChallenge: "Elige tu desafío", all: "Todos", multiplayer: "Multijugador",
    tactical: "Táctica", trivia: "Preguntas", speed: "Velocidad", strategy: "Estrategia", play: "Jugar",
    mode_lineup: "Adivina el once", mode_transfer: "Cadena de fichajes", mode_tactics: "Análisis táctico", mode_market: "Valor de mercado", mode_grid: "Matriz futbolística", mode_whoami: "¿Quién soy?", mode_var: "Reto VAR", mode_duo: "Dúo conectado", mode_invasion: "Invasión de preguntas",
  },
  fr: {
    hub: "Accueil", versusLobby: "Salon Versus", stats: "Statistiques", startingXI: "Onze de départ", career: "Carrière", tactics: "Tactique",
    soundOn: "Couper les effets sonores", soundOff: "Activer les effets sonores", language: "Langue",
    heroEyebrow: "L'arcade ultime de culture football", heroTitle: "Chaque époque. Chaque angle.", heroSubtitle: "Encore une partie.",
    heroDescription: "Testez votre intuition tactique, retracez les carrières des stars, décryptez les philosophies des entraîneurs et défiez vos amis en 1 contre 1 ou 2 contre 2.",
    versusCta: "Salon Versus (1 contre 1 et 2 contre 2)", quickXI: "Onze express", roundsCompleted: "Manches terminées",
    modeSuite: "Modes de jeu", chooseChallenge: "Choisissez votre défi", all: "Tout", multiplayer: "Multijoueur",
    tactical: "Tactique", trivia: "Quiz", speed: "Vitesse", strategy: "Stratégie", play: "Jouer",
    mode_lineup: "Devinez le onze", mode_transfer: "Chaîne de transferts", mode_tactics: "Analyse tactique", mode_market: "Valeur marchande", mode_grid: "Matrice football", mode_whoami: "Qui suis-je ?", mode_var: "Défi VAR", mode_duo: "Duo connecté", mode_invasion: "Invasion quiz",
  },
  de: {
    hub: "Start", versusLobby: "Versus-Lobby", stats: "Statistik", startingXI: "Startelf", career: "Karriere", tactics: "Taktik",
    soundOn: "Soundeffekte stummschalten", soundOff: "Soundeffekte aktivieren", language: "Sprache",
    heroEyebrow: "Die ultimative Fußball-IQ-Arcade", heroTitle: "Jede Ära. Jeder Blickwinkel.", heroSubtitle: "Noch eine Runde.",
    heroDescription: "Teste dein taktisches Gespür, verfolge die Karrieren der Stars, entschlüssele Trainerphilosophien und tritt in 1-gegen-1- und 2-gegen-2-Lobbys gegen Freunde an.",
    versusCta: "Versus-Lobby (1 gegen 1 & 2 gegen 2)", quickXI: "Schnelle Startelf", roundsCompleted: "Runden gespielt",
    modeSuite: "Spielmodi", chooseChallenge: "Wähle deine Herausforderung", all: "Alle", multiplayer: "Mehrspieler",
    tactical: "Taktik", trivia: "Quiz", speed: "Tempo", strategy: "Strategie", play: "Spielen",
    mode_lineup: "Errate die Startelf", mode_transfer: "Transferkette", mode_tactics: "Taktikanalyse", mode_market: "Marktwert", mode_grid: "Fußballmatrix", mode_whoami: "Wer bin ich?", mode_var: "VAR-Blitz", mode_duo: "Duo-Verbindung", mode_invasion: "Quiz-Invasion",
  },
  ar: {
    hub: "الرئيسية", versusLobby: "ردهة المواجهة", stats: "الإحصاءات", startingXI: "التشكيلة الأساسية", career: "المسيرة", tactics: "التكتيك",
    soundOn: "كتم المؤثرات الصوتية", soundOff: "تفعيل المؤثرات الصوتية", language: "اللغة",
    heroEyebrow: "أروع ألعاب ذكاء كرة القدم", heroTitle: "كل العصور. كل الزوايا.", heroSubtitle: "مباراة أخرى.",
    heroDescription: "اختبر حدسك التكتيكي، وتتبع مسيرات النجوم، واكتشف أفكار المدربين، وتنافس مع أصدقائك في مباريات فردية وثنائية.",
    versusCta: "ردهة المواجهة (فردي وثنائي)", quickXI: "تشكيلة سريعة", roundsCompleted: "الجولات المكتملة",
    modeSuite: "أوضاع اللعب", chooseChallenge: "اختر تحديك", all: "الكل", multiplayer: "متعدد اللاعبين",
    tactical: "تكتيك", trivia: "معلومات", speed: "سرعة", strategy: "استراتيجية", play: "العب",
    mode_lineup: "خمن التشكيلة", mode_transfer: "سلسلة الانتقالات", mode_tactics: "تحليل تكتيكي", mode_market: "القيمة السوقية", mode_grid: "مصفوفة كرة القدم", mode_whoami: "من أنا؟", mode_var: "تحدي الفار", mode_duo: "رابط ثنائي", mode_invasion: "غزو الأسئلة",
  },
  pt: {
    hub: "Início", versusLobby: "Sala versus", stats: "Estatísticas", startingXI: "Onze inicial", career: "Carreira", tactics: "Tática",
    soundOn: "Silenciar efeitos sonoros", soundOff: "Ativar efeitos sonoros", language: "Idioma",
    heroEyebrow: "O arcade definitivo de inteligência futebolística", heroTitle: "Cada era. Cada ângulo.", heroSubtitle: "Mais uma partida.",
    heroDescription: "Teste sua intuição tática, acompanhe as carreiras dos craques, decifre as filosofias dos treinadores e enfrente amigos em salas 1 contra 1 e 2 contra 2.",
    versusCta: "Sala versus (1 contra 1 e 2 contra 2)", quickXI: "Onze inicial rápido", roundsCompleted: "Rodadas concluídas",
    modeSuite: "Modos de jogo", chooseChallenge: "Escolha seu desafio", all: "Todos", multiplayer: "Multijogador",
    tactical: "Tática", trivia: "Quiz", speed: "Velocidade", strategy: "Estratégia", play: "Jogar",
    mode_lineup: "Adivinhe o onze", mode_transfer: "Cadeia de transferências", mode_tactics: "Análise tática", mode_market: "Valor de mercado", mode_grid: "Matriz do futebol", mode_whoami: "Quem sou eu?", mode_var: "Desafio VAR", mode_duo: "Dupla conectada", mode_invasion: "Invasão de perguntas",
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
    argentina: "Primera División clubs, national heroes and World Cup winners.",
    brazil: "Brasileirão clubs, Seleção stars and global honors.",
  },
  es: {
    "champions-league": "Los 36 clubes que compiten en la fase liga de la UEFA Champions League.",
    global: "Fútbol mundial, campeones continentales e iconos internacionales.",
    england: "Clubes de la Premier League, estrellas internacionales y grandes títulos.",
    spain: "Grandes clubes de La Liga, nacionalidades y títulos europeos.",
    italy: "Clubes de la Serie A, nacionalidades y jugadores campeones.",
    germany: "Clubes de la Bundesliga, internacionales alemanes y campeones europeos.",
    france: "Clubes de la Ligue 1, campeones del mundo y estrellas del fútbol.",
    netherlands: "Clubes de la Eredivisie, internacionales neerlandeses y campeones europeos.",
    argentina: "Clubes de Primera División, héroes nacionales y campeones del mundo.",
    brazil: "Clubes del Brasileirão, estrellas de la Seleção y grandes títulos.",
  },
  fr: {
    "champions-league": "Les 36 clubs engagés dans la phase de ligue de l’UEFA Champions League.",
    global: "Le football mondial, les champions continentaux et les stars internationales.",
    england: "Clubs de Premier League, stars internationales et grands titres.",
    spain: "Grands clubs de Liga, nationalités et titres européens.",
    italy: "Clubs de Serie A, nationalités et joueurs titrés.",
    germany: "Clubs de Bundesliga, internationaux allemands et champions d’Europe.",
    france: "Clubs de Ligue 1, champions du monde et stars du football.",
    netherlands: "Clubs d’Eredivisie, internationaux néerlandais et champions d’Europe.",
    argentina: "Clubs de première division, héros nationaux et champions du monde.",
    brazil: "Clubs du Brasileirão, stars de la Seleção et grands titres.",
  },
  de: {
    "champions-league": "Alle 36 Klubs der Ligaphase der UEFA Champions League.",
    global: "Weltfußball, Kontinentalmeister und internationale Legenden.",
    england: "Premier-League-Klubs, internationale Stars und große Titel.",
    spain: "La-Liga-Topklubs, Nationalitäten und europäische Titel.",
    italy: "Serie-A-Klubs, Nationalitäten und Titelgewinner.",
    germany: "Bundesliga-Klubs, deutsche Nationalspieler und Europapokalsieger.",
    france: "Ligue-1-Klubs, Weltmeister und internationale Fußballstars.",
    netherlands: "Eredivisie-Klubs, niederländische Nationalspieler und Europapokalsieger.",
    argentina: "Erstligaklubs, Nationalhelden und Weltmeister.",
    brazil: "Brasileirão-Klubs, Seleção-Stars und große Titel.",
  },
  ar: {
    "champions-league": "الأندية الـ٣٦ المشاركة في مرحلة الدوري من دوري أبطال أوروبا.",
    global: "كرة القدم العالمية وأبطال القارات وأبرز النجوم الدوليين.",
    england: "أندية الدوري الإنجليزي والنجوم الدوليون وأهم الألقاب.",
    spain: "أبرز أندية الدوري الإسباني والجنسيات والألقاب الأوروبية.",
    italy: "أندية الدوري الإيطالي والجنسيات واللاعبون المتوجون بالألقاب.",
    germany: "أندية الدوري الألماني والدوليون الألمان وأبطال أوروبا.",
    france: "أندية الدوري الفرنسي وأبطال العالم ونجوم كرة القدم.",
    netherlands: "أندية الدوري الهولندي والدوليون الهولنديون وأبطال أوروبا.",
    argentina: "أندية الدرجة الأولى والأبطال الوطنيون والفائزون بكأس العالم.",
    brazil: "أندية الدوري البرازيلي ونجوم السيليساو وأبرز الألقاب.",
  },
  pt: {
    "champions-league": "Os 36 clubes que disputam a fase de liga da UEFA Champions League.",
    global: "Futebol mundial, campeões continentais e ícones internacionais.",
    england: "Clubes da Premier League, estrelas internacionais e grandes títulos.",
    spain: "Destaques de La Liga, nacionalidades e títulos europeus.",
    italy: "Clubes da Serie A, nacionalidades e jogadores campeões.",
    germany: "Clubes da Bundesliga, internacionais alemães e campeões europeus.",
    france: "Clubes da Ligue 1, campeões mundiais e estrelas do futebol.",
    netherlands: "Clubes da Eredivisie, internacionais neerlandeses e campeões europeus.",
    argentina: "Clubes da primeira divisão, heróis nacionais e campeões mundiais.",
    brazil: "Clubes do Brasileirão, estrelas da Seleção e grandes títulos.",
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
