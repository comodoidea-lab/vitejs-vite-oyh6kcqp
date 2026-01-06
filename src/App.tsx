import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Dices, ArrowRight, Moon, Star, RotateCcw, Volume2, VolumeX, BookOpen, Hash, Sun, Calendar } from 'lucide-react';

/* --- 1. Sound System (Web Audio API) --- */
const useSynthesizedSound = (isMuted) => {
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (type) => {
    if (isMuted) return;

    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (type) {
      case 'type-key':
        const oscType = ctx.createOscillator();
        const gainType = ctx.createGain();
        oscType.type = 'square';
        oscType.frequency.setValueAtTime(800 + Math.random() * 200, t);
        const filterType = ctx.createBiquadFilter();
        filterType.type = 'lowpass';
        filterType.frequency.value = 3000;
        oscType.connect(filterType);
        filterType.connect(gainType);
        gainType.connect(ctx.destination);
        gainType.gain.setValueAtTime(0.05, t);
        gainType.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        oscType.start(t);
        oscType.stop(t + 0.05);
        break;

      case 'page-turn':
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 600;
        noise.connect(noiseFilter);
        noiseFilter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        noise.start(t);
        noise.stop(t + 0.15);
        break;

      case 'dice-roll':
        for (let i = 0; i < 6; i++) {
            const timeOffset = i * 0.06;
            const oscDice = ctx.createOscillator();
            const gainDice = ctx.createGain();
            oscDice.type = 'square';
            oscDice.frequency.setValueAtTime(200 + Math.random() * 100, t + timeOffset);
            oscDice.connect(gainDice);
            gainDice.connect(ctx.destination);
            gainDice.gain.setValueAtTime(0.05, t + timeOffset);
            gainDice.gain.exponentialRampToValueAtTime(0.01, t + timeOffset + 0.04);
            oscDice.start(t + timeOffset);
            oscDice.stop(t + timeOffset + 0.04);
        }
        break;

      case 'magic':
        osc.type = 'triangle';
        gain.connect(ctx.destination);
        osc.connect(gain);
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.linearRampToValueAtTime(880, t + 0.2);
        osc.frequency.linearRampToValueAtTime(1760, t + 0.4);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        osc.start(t);
        osc.stop(t + 1.5);
        break;
        
      default:
        break;
    }
  };

  return playSound;
};

/* --- 2. Retro SVG Illustrations --- */
const SvgIllustrations = {
  Title: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" style={{ mixBlendMode: 'multiply' }}>
      <filter id="ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
      <g filter="url(#ink)" stroke="#0a0a0a" strokeWidth="2" fill="none">
        <path d="M50 250 L50 150 L100 100 L150 150 L150 250 M100 100 L100 50 L120 50 M250 250 L250 120 L300 80 L350 120 L350 250" fill="#2a2a2a" opacity="0.1" />
        <path d="M50 250 L350 250 M100 250 L100 150 L150 200 M250 250 L250 180" />
        <circle cx="300" cy="60" r="30" strokeWidth="1" />
        <path d="M280 60 Q 300 60 300 90" strokeWidth="1" />
        <path d="M0 280 Q 50 260 100 280 T 200 280 T 300 280 T 400 280" strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  ),
  Intro: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" style={{ mixBlendMode: 'multiply' }}>
      <g stroke="#0a0a0a" strokeWidth="2" fill="none">
        <rect x="120" y="50" width="160" height="200" rx="5" strokeWidth="3" />
        <line x1="200" y1="50" x2="200" y2="250" strokeWidth="1" />
        <circle cx="180" cy="150" r="5" fill="#0a0a0a" />
        <circle cx="220" cy="150" r="5" fill="#0a0a0a" />
        <path d="M80 250 L120 250 M280 250 L320 250" />
        <line x1="50" y1="300" x2="350" y2="300" />
        <path d="M180 80 Q 200 60 220 80 Q 200 100 180 80" strokeWidth="1" />
        <circle cx="200" cy="80" r="3" fill="#0a0a0a" />
      </g>
    </svg>
  ),
  FloorSelect: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" style={{ mixBlendMode: 'multiply' }}>
      <g stroke="#0a0a0a" strokeWidth="2" fill="none">
        <ellipse cx="200" cy="250" rx="150" ry="30" strokeWidth="1" />
        <ellipse cx="200" cy="200" rx="120" ry="25" strokeWidth="1" />
        <ellipse cx="200" cy="150" rx="90" ry="20" strokeWidth="1" />
        <ellipse cx="200" cy="100" rx="60" ry="15" strokeWidth="1" />
        <path d="M200 80 L200 40 L190 50 M200 40 L210 50" strokeWidth="2" />
        <rect x="50" y="200" width="10" height="30" fill="#0a0a0a" />
        <rect x="340" y="200" width="10" height="30" fill="#0a0a0a" />
      </g>
    </svg>
  ),
  Tarot: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" style={{ mixBlendMode: 'multiply' }}>
      <g stroke="#0a0a0a" strokeWidth="2" fill="none">
        <rect x="60" y="80" width="80" height="120" rx="2" transform="rotate(-10 100 140)" fill="white" />
        <path d="M70 90 L130 190 M130 90 L70 190" strokeWidth="0.5" transform="rotate(-10 100 140)" />
        <rect x="160" y="70" width="80" height="120" rx="2" fill="white" />
        <circle cx="200" cy="130" r="20" strokeWidth="1" />
        <path d="M200 110 L200 150 M180 130 L220 130" strokeWidth="0.5" />
        <rect x="260" y="80" width="80" height="120" rx="2" transform="rotate(10 300 140)" fill="white" />
        <path d="M270 90 L330 90 L300 190 Z" strokeWidth="0.5" transform="rotate(10 300 140)" />
      </g>
    </svg>
  ),
  Dice: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" style={{ mixBlendMode: 'multiply' }}>
      <g stroke="#0a0a0a" strokeWidth="2" fill="none">
        <path d="M100 100 L160 80 L200 120 L140 140 Z" />
        <path d="M100 100 L100 180 L140 220 L140 140" />
        <path d="M140 220 L200 200 L200 120" />
        <circle cx="150" cy="110" r="5" fill="#0a0a0a" />
        <path d="M220 150 L280 130 L320 170 L260 190 Z" />
        <path d="M220 150 L220 230 L260 270 L260 190" />
        <path d="M260 270 L320 250 L320 170" />
        <circle cx="250" cy="160" r="4" fill="#0a0a0a" />
        <circle cx="290" cy="160" r="4" fill="#0a0a0a" />
      </g>
    </svg>
  ),
  Astrology: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" style={{ mixBlendMode: 'multiply' }}>
      <g stroke="#0a0a0a" strokeWidth="2" fill="none">
        <path d="M50 250 L100 150 L120 160 L70 260 Z" fill="white" />
        <path d="M100 150 L250 80 L260 100 L120 160" fill="white" />
        <circle cx="255" cy="90" r="10" />
        <circle cx="300" cy="60" r="2" fill="#0a0a0a" />
        <circle cx="320" cy="80" r="2" fill="#0a0a0a" />
        <circle cx="350" cy="50" r="2" fill="#0a0a0a" />
        <line x1="300" y1="60" x2="320" y2="80" strokeWidth="0.5" />
        <line x1="320" y1="80" x2="350" y2="50" strokeWidth="0.5" />
        <path d="M200 20 Q 300 20 380 100" strokeWidth="1" strokeDasharray="4 4" />
      </g>
    </svg>
  ),
  Numerology: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" style={{ mixBlendMode: 'multiply' }}>
      <g stroke="#0a0a0a" strokeWidth="2" fill="none">
        <circle cx="200" cy="150" r="80" strokeWidth="3" />
        <circle cx="200" cy="150" r="5" fill="#0a0a0a" />
        <line x1="200" y1="150" x2="200" y2="90" strokeWidth="2" />
        <line x1="200" y1="150" x2="240" y2="180" strokeWidth="2" />
        <text x="190" y="90" fontSize="20" fill="#0a0a0a" fontFamily="serif">XII</text>
        <text x="260" y="160" fontSize="20" fill="#0a0a0a" fontFamily="serif">III</text>
        <text x="190" y="220" fontSize="20" fill="#0a0a0a" fontFamily="serif">VI</text>
        <text x="130" y="160" fontSize="20" fill="#0a0a0a" fontFamily="serif">IX</text>
        <circle cx="80" cy="250" r="30" strokeWidth="1" opacity="0.5" />
        <circle cx="320" cy="250" r="40" strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  ),
  Runes: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" style={{ mixBlendMode: 'multiply' }}>
      <g stroke="#0a0a0a" strokeWidth="2" fill="none">
        <path d="M100 200 Q 120 150 160 160 Q 190 180 180 220 Q 150 250 100 200" fill="white" />
        <path d="M220 200 Q 240 140 280 150 Q 310 170 300 230 Q 260 260 220 200" fill="white" />
        <path d="M150 120 Q 180 80 220 90 Q 250 110 240 150 Q 200 180 150 120" fill="white" />
        <path d="M130 180 L130 220 M130 190 L150 180 M130 200 L150 190" strokeWidth="2" />
        <path d="M250 180 L250 220 M250 180 L270 200 L250 220" strokeWidth="2" />
        <path d="M190 110 L190 150 M190 110 L210 130 M210 130 L190 150" strokeWidth="2" />
      </g>
    </svg>
  ),
  Result: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" style={{ mixBlendMode: 'multiply' }}>
      <g stroke="#0a0a0a" strokeWidth="2" fill="none">
        <circle cx="200" cy="150" r="40" strokeWidth="3" />
        <path d="M200 100 L200 50 M200 200 L200 250 M150 150 L100 150 M250 150 L300 150" />
        <path d="M165 115 L130 80 M235 115 L270 80 M165 185 L130 220 M235 185 L270 220" />
        <path d="M50 50 L60 50 M55 45 L55 55" strokeWidth="1" />
        <path d="M350 50 L360 50 M355 45 L355 55" strokeWidth="1" />
      </g>
    </svg>
  )
};

/* --- 3. Logic Functions --- */
const getZodiacSign = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: "牡羊座", element: "fire" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: "牡牛座", element: "earth" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return { name: "双子座", element: "air" };
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return { name: "蟹座", element: "water" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: "獅子座", element: "fire" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: "乙女座", element: "earth" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return { name: "天秤座", element: "air" };
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return { name: "蠍座", element: "water" };
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return { name: "射手座", element: "fire" };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: "山羊座", element: "earth" };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: "水瓶座", element: "air" };
  return { name: "魚座", element: "water" };
};

const calculateLifePath = (dateString) => {
  if (!dateString) return 0;
  const numStr = dateString.replace(/-/g, '');
  let sum = 0;
  for (let i = 0; i < numStr.length; i++) {
    sum += parseInt(numStr[i], 10);
  }
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    let tempSum = 0;
    const s = sum.toString();
    for (let i = 0; i < s.length; i++) {
      tempSum += parseInt(s[i], 10);
    }
    sum = tempSum;
  }
  return sum;
};

/* --- 4. Main App Component --- */
const App = () => {
  const [gameState, setGameState] = useState('title');
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playerStats, setPlayerStats] = useState({ luck: 10 });
  const [visitedFloors, setVisitedFloors] = useState([]);
  const [birthDate, setBirthDate] = useState('');
  const [tarotResult, setTarotResult] = useState(null);
  const [diceResult, setDiceResult] = useState(null);
  const [astroResult, setAstroResult] = useState(null);
  const [runeResult, setRuneResult] = useState(null);
  const [numResult, setNumResult] = useState(null);
  const [shake, setShake] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);

  const textEndRef = useRef(null);
  const dateInputRef = useRef(null);
  const playSound = useSynthesizedSound(!isSoundOn);

  // Layout Fixes
  useEffect(() => {
    // スクロールバーのガタつきを防止するスタイル
    document.body.style.overflowX = 'hidden'; 
    document.body.style.width = '100%';
    document.body.style.position = 'fixed'; 
    document.body.style.inset = '0';
    return () => {
      document.body.style.overflowX = '';
      document.body.style.width = '';
      document.body.style.position = '';
      document.body.style.inset = '';
    };
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
  };

  const typeText = (fullText, speed = 30) => {
    setIsTyping(true);
    setText('');
    let index = 0;
    
    const timerId = setInterval(() => {
      const currentText = fullText.slice(0, index + 1);
      setText(currentText);
      
      if (fullText.charAt(index) !== ' ' && fullText.charAt(index) !== '\n') {
        playSound('type-key');
      }

      index++;
      if (index >= fullText.length) {
        clearInterval(timerId);
        setIsTyping(false);
      }
    }, speed);
    return () => clearInterval(timerId);
  };

  useEffect(() => {
    if (textEndRef.current) {
      textEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [text]);

  const scenes = {
    title: {
      Illustration: SvgIllustrations.Title,
      text: "運命の迷宮デパートへようこそ。\nここには古今東西のあらゆる占いが巣食っている。\n君の運命を試す準備はいいか？",
    },
    intro: {
      Illustration: SvgIllustrations.Intro,
      text: "重厚な扉を開くと、カビと古い羊皮紙の匂いが鼻をつく。\n支配人らしき老人が現れた。\n「いらっしゃいませ。……おや、初めてのお客様ですね。入館の前に、貴方の『魂の刻印（誕生日）』を帳簿に記していただけますかな？」",
    },
    profile_entry: { // New Scene
      Illustration: SvgIllustrations.Intro, // Reuse intro image
      text: "支配人が差し出した古い台帳には、無数の名前と日付が記されている。\n君は自分の生まれた日を書き込んだ。",
    },
    floor_select: {
      Illustration: SvgIllustrations.FloorSelect,
      text: "螺旋階段の前に案内板がある。\nどの売り場（フロア）へ向かいますか？\n（3つの売り場を巡ると、最上階への道が開かれます）",
    },
    tarot: {
      Illustration: SvgIllustrations.Tarot,
      text: "「タロットの館」へようこそ。\nテーブルの上にはカードが伏せられている。\n君の過去、現在、未来を映し出す1枚を選びたまえ。",
    },
    dice: {
      Illustration: SvgIllustrations.Dice,
      text: "ここは「運試しの回廊」。\n行く手を巨大なガーゴイルが阻んでいる！\nここを通り抜けるには、サイコロを振って運命力(LUCK)を示さねばならない。",
    },
    astrology: {
      Illustration: SvgIllustrations.Astrology,
      text: "屋上「星読みの展望台」。\n望遠鏡を覗くと、君の守護星座が輝いている。\n星々が告げるメッセージに耳を傾けよう……。",
    },
    numerology: {
      Illustration: SvgIllustrations.Numerology,
      text: "2階「数秘術の時計塔」。\n巨大な歯車が、君の生誕日から導き出された『運命数』を刻もうとしている……。",
    },
    runes: {
      Illustration: SvgIllustrations.Runes,
      text: "1階「古代ルーンの石碑」。\n店の奥まった場所に、怪しげな袋が置かれている。\n袋の中に手を入れ、石をひとつ掴み取りたまえ。",
    },
    result: {
      Illustration: SvgIllustrations.Result,
      text: "すべての部屋を巡り、君の運命が明らかになった……。",
    }
  };

  const handleAction = (action) => {
    if (isTyping) return;
    playSound('page-turn');
    action();
  };

  const startGame = () => {
    setGameState('intro');
    typeText(scenes.intro.text);
  };

  const submitProfile = () => {
    if (!birthDate) return;
    setGameState('floor_select');
    typeText("「……確かに承りました。では、ごゆっくり」\n老人が道を譲ると、奥への通路が現れた。");
  };

  const proceedToFloorSelect = () => {
    setGameState('floor_select');
    
    let infoText = scenes.floor_select.text;
    const remaining = 3 - visitedFloors.length;
    
    if (remaining <= 0) {
        infoText += "\n\n最上階へのエレベーターが到着しました。";
    } else {
        infoText += `\n\n（あと ${remaining} 箇所、巡る必要があります）`;
    }
    
    typeText(infoText);
  };

  const goToFloor = (floor) => {
    setGameState(floor);
    
    if (floor === 'numerology') {
         const lp = calculateLifePath(birthDate);
         typeText(scenes.numerology.text + `\n\n……歯車が止まり、数字の『${lp}』が示された。`);
    } else if (floor === 'astrology') {
         const zodiac = getZodiacSign(birthDate);
         typeText(scenes.astrology.text + `\n\n夜空に『${zodiac?.name}』が強く輝いている……。`);
    } else {
         typeText(scenes[floor].text);
    }

    if (!visitedFloors.includes(floor)) {
      setVisitedFloors([...visitedFloors, floor]);
    }
  };

  const resolveDice = () => {
    playSound('dice-roll');
    const die1 = Math.ceil(Math.random() * 6);
    const die2 = Math.ceil(Math.random() * 6);
    const total = die1 + die2;
    setDiceResult({ die1, die2, total });
    
    setTimeout(() => {
      triggerShake();
      if (total >= 7) {
        playSound('magic');
        typeText(`出目は ${die1} と ${die2}、合計 ${total} だ。\n「見事だ……通るがよい」\nガーゴイルは石像に戻り、道が開かれた！(運勢: 大吉)`);
        setPlayerStats(p => ({ ...p, luck: p.luck + 2 }));
      } else {
        playSound('dice-roll');
        typeText(`出目は ${die1} と ${die2}、合計 ${total} だ。\n「運が足りぬようだな……！」\n天井からタライが落ちてきた！(運勢: 凶)`);
        setPlayerStats(p => ({ ...p, luck: Math.max(0, p.luck - 2) }));
      }
    }, 1000);
  };

  const resolveTarot = (cardIndex) => {
    playSound('magic');
    const cards = [
      { name: '愚者 (The Fool)', meaning: '新たな始まり、自由、無邪気。恐れずに進め。', luck: 1 },
      { name: '運命の輪 (Wheel)', meaning: 'チャンス、変化、運命の転換点。流れに身を任せよ。', luck: 3 },
      { name: '塔 (The Tower)', meaning: '予期せぬ変化、崩壊、啓示。衝撃に備えよ。', luck: -3 },
      { name: '星 (The Star)', meaning: '希望、インスピレーション、静寂。願いは叶うだろう。', luck: 2 },
      { name: '死神 (Death)', meaning: '終わりと始まり、変容。過去を捨て去る時。', luck: 0 },
      { name: '世界 (The World)', meaning: '完成、達成、旅の終わり。素晴らしい成功。', luck: 4 },
    ];
    const picked = cards[Math.floor(Math.random() * cards.length)];
    setTarotResult(picked);
    setPlayerStats(p => ({ ...p, luck: p.luck + picked.luck }));
    typeText(`引いたカードは……「${picked.name}」だ。\n\n${picked.meaning}`);
  };

  const resolveAstrology = () => {
    playSound('magic');
    const zodiac = getZodiacSign(birthDate);
    if (!zodiac) return; 

    const element = zodiac.element;
    const results = {
      fire: { text: `「${zodiac.name}」は炎の属性を持つ。\n炎の精霊が囁く。「情熱のままに行動せよ。だが、焼き尽くさぬよう注意せよ」`, luck: 1 },
      earth: { text: `「${zodiac.name}」は地の属性を持つ。\n地の精霊が囁く。「足元を固めよ。忍耐こそが黄金を生む」`, luck: 1 },
      air: { text: `「${zodiac.name}」は風の属性を持つ。\n風の精霊が囁く。「知恵と情報を集めよ。今は動く時ではないかもしれない」`, luck: 0 },
      water: { text: `「${zodiac.name}」は水の属性を持つ。\n水の精霊が囁く。「流れに身を委ねよ。直感こそが最大の武器となる」`, luck: 2 }
    };
    
    const res = results[element];
    setAstroResult({ ...res, zodiacName: zodiac.name });
    setPlayerStats(p => ({ ...p, luck: p.luck + res.luck }));
    typeText(res.text);
  };

  const resolveRune = () => {
    playSound('magic');
    const runes = [
      { name: 'フェフ (Fehu)', desc: '「富」を象徴する。物質的な豊かさが訪れる予兆。', luck: 3 },
      { name: 'ウルズ (Uruz)', desc: '「野牛」を象徴する。強靭な生命力と変化の時。', luck: 2 },
      { name: 'スリサズ (Thurisaz)', desc: '「巨人」を象徴する。試練や警告。慎重になれ。', luck: -2 },
      { name: 'アンズース (Ansuz)', desc: '「神」を象徴する。知恵や良い知らせが届く。', luck: 2 },
    ];
    const picked = runes[Math.floor(Math.random() * runes.length)];
    setRuneResult(picked);
    setPlayerStats(p => ({ ...p, luck: p.luck + picked.luck }));
    typeText(`掴んだ石に刻まれていたのは……\n「${picked.name}」だ。\n${picked.desc}`);
  };

  const resolveNumerology = () => {
    playSound('type-key');
    const num = calculateLifePath(birthDate);
    const luckMod = (num % 2 === 0) ? 1 : 2; 
    let msg = "";
    switch(num) {
        case 1: msg = "「1」は『開拓者』の数字。リーダーシップと独立心を発揮する時だ。新しい道を切り開け。"; break;
        case 2: msg = "「2」は『調和』の数字。協力と感受性が鍵となる。焦らず、周囲とのバランスを大切にせよ。"; break;
        case 3: msg = "「3」は『創造』の数字。表現力と喜びが溢れている。子供のような遊び心を忘れるな。"; break;
        case 4: msg = "「4」は『建設』の数字。地道な努力と秩序が成果を生む。基礎を固めるのに最適な時期だ。"; break;
        case 5: msg = "「5」は『変化』の数字。冒険と自由を求めよ。予想外の展開を楽しむ余裕を持つことだ。"; break;
        case 6: msg = "「6」は『調和』の数字。責任と愛情がテーマだ。身近な人々を大切にすることで運が開ける。"; break;
        case 7: msg = "「7」は『探求』の数字。内面を見つめ、真理を探せ。孤独を恐れず、知恵を深めるのだ。"; break;
        case 8: msg = "「8」は『豊かさ』の数字。権力と成功を掴むエネルギーがある。自信を持って目標に挑め。"; break;
        case 9: msg = "「9」は『完結』の数字。手放し、次のステージへ進む準備をせよ。慈悲の心が幸運を呼ぶ。"; break;
        case 11: msg = "「11」は『天啓』の数字。鋭い直感が働いている。論理よりも感覚を信じて進め。"; break;
        case 22: msg = "「22」は『大願成就』の数字。大きな夢を現実に変える力がある。スケールの大きな行動を。"; break;
        case 33: msg = "「33」は『愛の奉仕』の数字。普遍的な愛を体現せよ。損得勘定を捨てた時、奇跡が起きる。"; break;
        default: msg = `「${num}」……それが今の君を導く数字だ。`; break;
    }
    setNumResult({ num, msg });
    setPlayerStats(p => ({ ...p, luck: p.luck + luckMod }));
    typeText(msg);
  };

  const showResult = () => {
    setGameState('result');
    let verdict = "";
    if (playerStats.luck >= 16) {
      verdict = "信じられない……！君の運気は「伝説級」だ。デパートの創設者も驚くほどの強運の持ち主だ。このまま宝くじ売り場へ直行することをお勧めする。";
    } else if (playerStats.luck >= 12) {
      verdict = "素晴らしい。君の運気は「絶好調」にある。迷わず進めば、大抵の扉は開かれるだろう。";
    } else if (playerStats.luck >= 8) {
      verdict = "悪くない。君の運気は「安定」している。派手さはないが、着実な成果を得られる日だ。";
    } else {
      verdict = "ふむ……君の運気には少し「陰り」が見える。だが、このデパートで厄は落とされた。帰りに温かいココアでも飲んでリラックスすれば、運気は回復するだろう。";
    }
    typeText(scenes.result.text + "\n\n" + verdict);
  };

  const resetGame = () => {
    setGameState('title');
    setPlayerStats({ luck: 10 });
    setVisitedFloors([]);
    setBirthDate(''); 
    setTarotResult(null);
    setDiceResult(null);
    setAstroResult(null);
    setRuneResult(null);
    setNumResult(null);
    setText('');
    setIsTyping(false);
  };

  const CurrentIllustration = scenes[gameState]?.Illustration || SvgIllustrations.Title;

  const Dice3D = ({ val }) => (
    <div className="w-16 h-16 bg-[#fffff0] border-2 border-[#0a0a0a] rounded-lg flex items-center justify-center shadow-lg transform rotate-12 transition-all duration-500">
      <span className="text-3xl font-bold font-serif text-[#0a0a0a]">{val}</span>
    </div>
  );

  const btnClass = "w-full py-3 px-4 bg-[#f0e6d2] border-2 border-[#0a0a0a] text-[#0a0a0a] font-bold font-serif text-lg shadow-md hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer active:scale-95 select-none disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`min-h-screen w-full bg-neutral-900 text-neutral-100 font-serif flex items-center justify-center relative overflow-hidden`}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=IM+Fell+English+SC&display=swap');
        
        .font-serif { font-family: 'Shippori Mincho', 'Crimson Text', serif; }
        .font-display { font-family: 'IM Fell English SC', serif; }
        
        .bg-parchment {
          background-color: #f0e6d2;
          background-image: url("https://www.transparenttextures.com/patterns/aged-paper.png");
        }
        
        .ink-filter {
          filter: contrast(120%) sepia(30%);
        }

        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        
        .scanline {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
          background-size: 100% 4px;
        }
        
        .vignette {
          background: radial-gradient(circle, transparent 50%, black 150%);
        }

        .spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .animate-fade-in { animation: fadeIn 2s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .paper-texture {
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
        }
        
        /* 修正：スクロールバー領域を強制的に確保し、かつスクロールバーを常に表示することでガタつきを防止 */
        .custom-scroll {
          overflow-y: scroll !important; /* 常に縦スクロールバーを表示 */
          scrollbar-gutter: stable; /* スクロールバーの幅を確保 */
        }
        /* スクロールバーの見た目をカスタマイズ（Chrome/Safari） */
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(10, 10, 10, 0.2);
          border-radius: 4px;
        }
      `}</style>

      {/* Background Layers (for PC view atmosphere) */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
      </div>

      {/* Main Container: レスポンシブ切り替えのキモ */}
      <div className={`
          z-10 bg-[#f0e6d2] shadow-2xl flex flex-col border-4 border-double border-[#0a0a0a]
          fixed inset-0 w-full h-full 
          sm:relative sm:w-[480px] sm:h-[800px] sm:max-h-[90vh] sm:rounded-sm
          overflow-hidden box-border
          transition-all duration-300 ease-in-out
          ${shake ? 'animate-shake' : ''}
      `}>
        
        {/* Header */}
        <div className="bg-[#0a0a0a] text-[#f0e6d2] p-2 border-b-4 border-double border-[#0a0a0a] flex justify-between items-center z-30 shadow-md shrink-0">
          <div className="font-display text-xl tracking-widest">DEPT. OF DESTINY</div>
          <div className="flex gap-4 text-sm font-bold font-mono items-center">
            <div className="flex items-center gap-1"><Star size={14} /> LUCK: {playerStats.luck}</div>
            
            {/* Sound Toggle */}
            <button 
              onClick={toggleSound}
              className="p-1 hover:text-white transition-colors"
              title={isSoundOn ? "Mute Sound" : "Enable Sound"}
            >
              {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} className="opacity-50" />}
            </button>
          </div>
        </div>

        {/* SVG Illustration Area */}
        <div className="relative w-full h-48 sm:h-64 overflow-hidden border-b-4 border-black bg-[#e3dac9] group flex items-center justify-center paper-texture shrink-0">
          <div className="absolute inset-0 opacity-10 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-0"></div>
          
          <div className="w-full h-full p-8 animate-fade-in ink-filter z-10">
            <CurrentIllustration />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#f0e6d2] via-transparent to-transparent opacity-100 z-20 pointer-events-none"></div>
        </div>

        {/* Text & Content Area (Scrollable with fixed width) */}
        <div className="flex-grow p-4 sm:p-6 flex flex-col relative custom-scroll w-full">
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#0a0a0a] opacity-60 pointer-events-none"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#0a0a0a] opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#0a0a0a] opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#0a0a0a] opacity-60 pointer-events-none"></div>

          <div className="w-full text-[#0a0a0a] leading-relaxed font-medium pb-24">
            {gameState === 'title' ? (
              <div className="text-center py-4 animate-fade-in">
                <h1 className="font-display text-4xl sm:text-5xl mb-4 text-[#0a0a0a] drop-shadow-sm leading-tight">運命の<br/>迷宮デパート</h1>
                <p className="text-xs sm:text-sm italic font-semibold text-[#0a0a0a] opacity-90 mb-6">- THE DEPARTMENT STORE OF DESTINY -</p>
                <div className="w-12 h-1 bg-[#0a0a0a] mx-auto mb-6"></div>
                <div className="flex items-center justify-center gap-2 mb-2 text-sm text-[#0a0a0a] font-bold opacity-80">
                   <BookOpen size={16} /> <span>ようこそ、彷徨える魂よ。</span>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap min-h-[160px] drop-shadow-sm text-[#0a0a0a] font-semibold text-base sm:text-lg break-words w-full">
                {text}
                <span className="inline-block w-2 h-4 bg-[#0a0a0a] ml-1 animate-pulse align-middle"></span>
              </p>
            )}

            {/* --- Profile Entry Form --- */}
            {gameState === 'intro' && !isTyping && (
                <div className="mt-4 animate-fade-in-up w-full">
                    <label className="block text-sm font-bold text-[#0a0a0a] mb-2 font-display">BIRTH DATE (魂の刻印)</label>
                    <div className="relative w-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => dateInputRef.current?.showPicker()}>
                      <input 
                        ref={dateInputRef}
                        type="date" 
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full max-w-full p-3 bg-[#fffff0] border-2 border-[#0a0a0a] text-[#0a0a0a] font-mono text-lg text-center shadow-inner outline-none focus:ring-2 focus:ring-[#0a0a0a] rounded-sm appearance-none block cursor-pointer"
                        style={{ fontSize: '16px' }} 
                      />
                      <Calendar 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0a0a0a] pointer-events-none" 
                        size={20} 
                      />
                    </div>
                </div>
            )}

            {/* --- Mini Game Results --- */}
            {gameState === 'tarot' && tarotResult && (
              <div className="mt-6 p-4 border-2 border-[#0a0a0a] bg-white bg-opacity-60 text-center animate-fade-in-up shadow-inner">
                <div className="w-24 h-36 mx-auto bg-[#0a0a0a] text-white flex items-center justify-center rounded mb-2 shadow-lg border-2 border-[#f0e6d2]">
                  <Moon size={32} />
                </div>
                <h3 className="font-bold text-xl mt-2 border-b-2 border-[#0a0a0a] text-[#0a0a0a] inline-block pb-1">{tarotResult.name}</h3>
              </div>
            )}

            {gameState === 'dice' && diceResult && (
              <div className="mt-8 flex justify-center gap-6 animate-bounce">
                <Dice3D val={diceResult.die1} />
                <Dice3D val={diceResult.die2} />
              </div>
            )}

            <div ref={textEndRef} />
          </div>
        </div>

        {/* Buttons / Interaction Area (Fixed at bottom) */}
        <div className="p-4 bg-[#0a0a0a] bg-opacity-5 backdrop-blur-sm border-t-4 border-double border-[#0a0a0a] shrink-0 z-20">
          <div className="flex flex-col gap-2">
            
            {gameState === 'title' && (
              <button 
                onClick={() => handleAction(startGame)}
                className="w-full py-4 bg-[#0a0a0a] text-[#f0e6d2] font-display text-xl hover:bg-red-950 transition-colors flex items-center justify-center gap-2 shadow-lg group active:scale-95"
              >
                <Sparkles size={20} className="group-hover:spin-slow" /> 入店する (Start)
              </button>
            )}

            {gameState === 'intro' && !isTyping && (
              <button 
                onClick={() => handleAction(submitProfile)} 
                disabled={!birthDate}
                className={btnClass}
              >
                刻印を記して進む <ArrowRight size={18} />
              </button>
            )}

            {gameState === 'floor_select' && !isTyping && (
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1 custom-scroll">
                {!visitedFloors.includes('tarot') && (
                    <button onClick={() => handleAction(() => goToFloor('tarot'))} className={btnClass}>
                      <Moon size={18} /> 3階：タロットの館
                    </button>
                )}
                {!visitedFloors.includes('numerology') && (
                    <button onClick={() => handleAction(() => goToFloor('numerology'))} className={btnClass}>
                      <Hash size={18} /> 2階：数秘術の時計塔
                    </button>
                )}
                {!visitedFloors.includes('runes') && (
                    <button onClick={() => handleAction(() => goToFloor('runes'))} className={btnClass}>
                      <Star size={18} /> 1階：古代ルーンの石碑
                    </button>
                )}
                {!visitedFloors.includes('dice') && (
                    <button onClick={() => handleAction(() => goToFloor('dice'))} className={btnClass}>
                      <Dices size={18} /> 地下1階：運試しの回廊
                    </button>
                )}
                {!visitedFloors.includes('astrology') && (
                    <button onClick={() => handleAction(() => goToFloor('astrology'))} className={btnClass}>
                      <Sun size={18} /> 屋上：星読みの展望台
                    </button>
                )}

                {visitedFloors.length >= 3 && (
                    <button onClick={() => handleAction(showResult)} className={`${btnClass} bg-red-900 text-white hover:bg-red-800 border-[#0a0a0a]`}>
                      <ArrowRight size={18} /> 最上階へ進む（結果）
                    </button>
                )}
              </div>
            )}

            {gameState === 'tarot' && !tarotResult && !isTyping && (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <button key={i} onClick={() => handleAction(() => resolveTarot(i))} className="h-24 sm:h-32 bg-[#0a0a0a] text-[#f0e6d2] rounded border-2 border-[#f0e6d2] hover:-translate-y-2 transition-transform flex items-center justify-center shadow-lg active:scale-95">
                    <span className="font-display text-2xl sm:text-4xl opacity-80">?</span>
                  </button>
                ))}
              </div>
            )}

            {gameState === 'astrology' && !astroResult && !isTyping && (
              <div className="flex flex-col gap-2">
                 <div className="p-2 bg-[#fffff0] border-2 border-[#0a0a0a] text-[#0a0a0a] text-center shadow-md rounded-sm">
                    <span className="font-bold">鑑定中...</span>
                 </div>
                 <button onClick={() => handleAction(resolveAstrology)} className={btnClass}>
                   星の声を聞く
                 </button>
              </div>
            )}

            {gameState === 'runes' && !runeResult && !isTyping && (
              <button onClick={() => handleAction(resolveRune)} className={btnClass}>
                 袋の中に手を入れる
              </button>
            )}

            {gameState === 'numerology' && !numResult && !isTyping && (
               <button onClick={() => handleAction(resolveNumerology)} className={btnClass}>
                 運命数を受け入れる
               </button>
            )}

            {gameState === 'dice' && !diceResult && !isTyping && (
              <button onClick={() => { if(!isTyping) resolveDice(); }} className={`${btnClass} bg-red-900 text-white hover:bg-red-800 border-[#0a0a0a]`}>
                <Dices size={18} /> サイコロを振る！
              </button>
            )}

            {['tarot', 'dice', 'astrology', 'numerology', 'runes'].includes(gameState) && (tarotResult || diceResult || astroResult || runeResult || numResult) && !isTyping && (
               <button onClick={() => handleAction(proceedToFloorSelect)} className={btnClass}>
                 <RotateCcw size={18} /> 案内板へ戻る
               </button>
            )}

            {gameState === 'result' && !isTyping && (
              <button onClick={() => handleAction(resetGame)} className={btnClass}>
                <RotateCcw size={18} /> 運命をやり直す
              </button>
            )}

            {isTyping && (
              <div className="text-center text-xs sm:text-sm text-[#0a0a0a] opacity-80 animate-pulse font-mono py-2 font-bold">
                ... 記述中 ...
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default App;