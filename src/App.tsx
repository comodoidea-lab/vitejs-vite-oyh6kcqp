import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Dices, ArrowRight, Moon, Star, RotateCcw, Volume2, VolumeX, BookOpen, Hash, Sun, Calendar, Map, X, Hand } from 'lucide-react';

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
        gainType.gain.setValueAtTime(0.02, t);
        gainType.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        oscType.start(t);
        oscType.stop(t + 0.05);
        break;

      case 'slide':
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noiseSlide = ctx.createBufferSource();
        noiseSlide.buffer = buffer;
        const filterSlide = ctx.createBiquadFilter();
        filterSlide.type = 'bandpass';
        filterSlide.frequency.setValueAtTime(1000, t);
        filterSlide.frequency.exponentialRampToValueAtTime(100, t + 0.2);
        noiseSlide.connect(filterSlide);
        filterSlide.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        noiseSlide.start(t);
        noiseSlide.stop(t + 0.2);
        break;

      case 'dice-roll':
      case 'popup':
        for (let i = 0; i < 4; i++) {
            const timeOffset = i * 0.05;
            const oscDice = ctx.createOscillator();
            const gainDice = ctx.createGain();
            oscDice.type = 'sine';
            oscDice.frequency.setValueAtTime(300 + Math.random() * 200, t + timeOffset);
            oscDice.connect(gainDice);
            gainDice.connect(ctx.destination);
            gainDice.gain.setValueAtTime(0.05, t + timeOffset);
            gainDice.gain.exponentialRampToValueAtTime(0.01, t + timeOffset + 0.1);
            oscDice.start(t + timeOffset);
            oscDice.stop(t + timeOffset + 0.1);
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
        gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        osc.start(t);
        osc.stop(t + 1.0);
        break;
        
      default:
        break;
    }
  };

  return playSound;
};

/* --- 2. Retro SVG Illustrations & Characters --- */
const SvgIllustrations = {
  Title: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full" style={{ mixBlendMode: 'multiply' }}>
      <filter id="ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
      <g filter="url(#ink)" stroke="#0a0a0a" strokeWidth="2" fill="none" opacity="0.15">
        <path d="M50 250 L50 150 L100 100 L150 150 L150 250 M100 100 L100 50 L120 50 M250 250 L250 120 L300 80 L350 120 L350 250" />
        <path d="M50 250 L350 250 M100 250 L100 150 L150 200 M250 250 L250 180" />
        <circle cx="300" cy="60" r="30" strokeWidth="1" />
        <path d="M0 280 Q 50 260 100 280 T 200 280 T 300 280 T 400 280" strokeWidth="1" />
      </g>
    </svg>
  ),
  Hallway: () => (
    <svg viewBox="0 0 400 300" className="w-full h-full" style={{ mixBlendMode: 'multiply' }}>
      <g stroke="#0a0a0a" strokeWidth="1" fill="none" opacity="0.15">
        <line x1="0" y1="0" x2="150" y2="100" />
        <line x1="400" y1="0" x2="250" y2="100" />
        <line x1="0" y1="300" x2="150" y2="200" />
        <line x1="400" y1="300" x2="250" y2="200" />
        <rect x="150" y="100" width="100" height="100" />
        <line x1="200" y1="100" x2="200" y2="200" />
        <path d="M150 100 L140 200 M250 100 L260 200" />
      </g>
    </svg>
  ),
};

/* --- 3. Scene Objects (In-Message Illustrations) --- */
const SceneObjects = {
    Dice: () => (
        <svg viewBox="0 0 200 100" className="w-48 h-24 mx-auto mb-4 animate-fade-in">
            <g stroke="#0a0a0a" strokeWidth="2" fill="#f0e6d2">
                <path d="M40 30 L70 20 L100 30 L70 40 Z" />
                <path d="M40 30 L40 70 L70 80 L70 40" />
                <path d="M70 80 L100 70 L100 30" />
                <circle cx="70" cy="30" r="2" fill="#0a0a0a"/>
                <path d="M110 40 L140 30 L170 40 L140 50 Z" />
                <path d="M110 40 L110 80 L140 90 L140 50" />
                <path d="M140 90 L170 80 L170 40" />
                <circle cx="125" cy="65" r="2" fill="#0a0a0a"/>
                <circle cx="155" cy="65" r="2" fill="#0a0a0a"/>
            </g>
        </svg>
    ),
    TarotCards: () => (
        <svg viewBox="0 0 200 100" className="w-48 h-24 mx-auto mb-4 animate-fade-in">
            <g stroke="#0a0a0a" strokeWidth="2" fill="#2a2a2a">
                <rect x="30" y="10" width="40" height="60" rx="2" transform="rotate(-10 50 40)" />
                <path d="M40 20 L60 50 M60 20 L40 50" stroke="#f0e6d2" strokeWidth="1" transform="rotate(-10 50 40)" opacity="0.5"/>
                <rect x="80" y="5" width="40" height="60" rx="2" />
                <circle cx="100" cy="35" r="10" stroke="#f0e6d2" strokeWidth="1" opacity="0.5" fill="none"/>
                <rect x="130" y="10" width="40" height="60" rx="2" transform="rotate(10 150 40)" />
                <rect x="140" y="20" width="20" height="30" stroke="#f0e6d2" strokeWidth="1" opacity="0.5" fill="none" transform="rotate(10 150 40)"/>
            </g>
        </svg>
    ),
    NumerologyGear: () => (
        <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto mb-4 animate-spin-slow opacity-80">
            <g stroke="#0a0a0a" strokeWidth="2" fill="none">
                <circle cx="50" cy="50" r="40" />
                <circle cx="50" cy="50" r="35" strokeWidth="1" strokeDasharray="5,5"/>
                <path d="M50 10 L50 25 M50 90 L50 75 M10 50 L25 50 M90 50 L75 50" />
                <path d="M22 22 L32 32 M78 78 L68 68 M22 78 L32 68 M78 22 L68 32" />
                <circle cx="50" cy="50" r="5" fill="#0a0a0a"/>
            </g>
        </svg>
    ),
    RunesBag: () => (
        <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto mb-4 animate-fade-in">
            <g stroke="#0a0a0a" strokeWidth="2" fill="#f0e6d2">
                <path d="M20 30 Q 50 10 80 30 L 90 80 Q 50 100 10 80 Z" fill="#5a3a2a" />
                <path d="M30 30 L 35 20 M 70 30 L 65 20" strokeWidth="3" />
                <circle cx="60" cy="40" r="15" fill="#f0e6d2" stroke="#0a0a0a"/>
                <path d="M55 35 L 55 45 M 55 38 L 65 42" strokeWidth="1" />
            </g>
        </svg>
    ),
    AstrologyScope: () => (
        <svg viewBox="0 0 200 100" className="w-48 h-24 mx-auto mb-4 animate-fade-in">
            <g stroke="#0a0a0a" strokeWidth="2" fill="none">
                <path d="M40 80 L80 40 L90 50 L50 90 Z" fill="#2a2a2a" />
                <line x1="50" y1="90" x2="40" y2="100" />
                <line x1="45" y1="85" x2="60" y2="100" />
                <circle cx="120" cy="30" r="2" fill="#0a0a0a"/>
                <circle cx="150" cy="20" r="2" fill="#0a0a0a"/>
                <circle cx="170" cy="40" r="2" fill="#0a0a0a"/>
                <line x1="120" y1="30" x2="150" y2="20" strokeWidth="0.5" strokeDasharray="2,2"/>
                <line x1="150" y1="20" x2="170" y2="40" strokeWidth="0.5" strokeDasharray="2,2"/>
            </g>
        </svg>
    ),
    // 12 Constellations
    Zodiac: ({ signKey }) => {
        const paths = {
            aries: "M20 50 L50 40 L80 50 M20 50 L10 60", // 牡羊
            taurus: "M20 50 L40 60 L60 40 L80 60 L80 40", // 牡牛
            gemini: "M30 30 L30 70 M70 30 L70 70 M30 30 L70 30 M30 70 L70 70", // 双子
            cancer: "M50 50 L30 30 M50 50 L70 70 M50 50 L30 70 M50 50 L70 30", // 蟹
            leo: "M20 50 L40 30 L60 30 L80 50 L70 70 L30 70 Z", // 獅子
            virgo: "M30 30 L30 70 L70 70 L70 30 L50 50", // 乙女
            libra: "M20 70 L80 70 M30 50 L70 50 M50 30 L50 50", // 天秤
            scorpio: "M20 30 L20 70 L50 70 L50 30 L80 30 L80 80 L70 90", // 蠍
            sagittarius: "M20 80 L80 20 M50 50 L80 50 M50 50 L50 80", // 射手
            capricorn: "M20 30 L50 50 L80 30 L50 80 Z", // 山羊
            aquarius: "M20 30 L30 40 L40 30 L50 40 L60 30 M20 60 L30 70 L40 60 L50 70 L60 60", // 水瓶
            pisces: "M30 50 L70 50 M30 30 L30 70 M70 30 L70 70" // 魚
        };
        const p = paths[signKey] || "M50 50 L50 50";
        return (
            <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto mb-4 animate-fade-in bg-black/10 rounded-full border border-black/20">
                <path d={p} stroke="#0a0a0a" strokeWidth="2" fill="none" />
                {/* Dots at vertices could be complex, simplifying with just lines for retro feel */}
                <circle cx="50" cy="50" r="45" stroke="#0a0a0a" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
            </svg>
        );
    }
};

const Characters = {
  Manager: () => (
    <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-xl animate-fade-in-up">
      <g stroke="#0a0a0a" strokeWidth="2" fill="#f0e6d2">
        <path d="M60 300 L60 150 Q 100 120 140 150 L140 300 Z" fill="#2a2a2a" />
        <path d="M70 150 Q 100 80 130 150" fill="#2a2a2a" />
        <ellipse cx="100" cy="140" rx="25" ry="30" fill="#f0e6d2" stroke="#2a2a2a" />
        <path d="M90 140 L110 140" strokeWidth="1" />
        <path d="M100 140 L100 150 L95 155" strokeWidth="1" />
        <path d="M90 160 Q 100 170 110 160" strokeWidth="1" />
        <path d="M75 140 Q 100 200 125 140" fill="white" opacity="0.8" />
        <rect x="130" y="200" width="40" height="50" fill="#5a3a2a" transform="rotate(-10 150 225)" />
      </g>
    </svg>
  ),
  Gargoyle: () => (
    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-xl animate-fade-in">
      <g stroke="#0a0a0a" strokeWidth="2" fill="#a0a0a0">
        <path d="M50 100 Q 10 50 100 80" fill="none" strokeWidth="3" />
        <path d="M250 100 Q 290 50 200 80" fill="none" strokeWidth="3" />
        <circle cx="150" cy="120" r="40" fill="#b0b0b0" />
        <path d="M130 150 L110 220 L130 250" strokeWidth="4" />
        <path d="M170 150 L190 220 L170 250" strokeWidth="4" />
        <rect x="120" y="150" width="60" height="70" rx="10" fill="#b0b0b0" />
        <path d="M140 110 L160 110" strokeWidth="2" />
        <circle cx="140" cy="115" r="2" fill="red" />
        <circle cx="160" cy="115" r="2" fill="red" />
        <path d="M130 100 L135 80 M170 100 L165 80" strokeWidth="2" />
        <path d="M140 130 Q 150 140 160 130" fill="none" />
      </g>
    </svg>
  ),
  InformationBoard: () => (
    <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-xl animate-fade-in">
      <g stroke="#0a0a0a" strokeWidth="2" fill="#5a3a2a">
         {/* Stand */}
         <rect x="90" y="150" width="20" height="150" fill="#2a1a0a" />
         <path d="M70 300 L130 300 M80 290 L120 290" strokeWidth="3" />
         {/* Board */}
         <rect x="20" y="50" width="160" height="100" rx="5" fill="#f0e6d2" stroke="#5a3a2a" strokeWidth="4" />
         <rect x="30" y="60" width="140" height="80" fill="none" stroke="#0a0a0a" strokeWidth="1" strokeDasharray="2 2" />
         <line x1="40" y1="80" x2="160" y2="80" strokeWidth="1" stroke="#0a0a0a" opacity="0.3" />
         <line x1="40" y1="100" x2="160" y2="100" strokeWidth="1" stroke="#0a0a0a" opacity="0.3" />
         <line x1="40" y1="120" x2="160" y2="120" strokeWidth="1" stroke="#0a0a0a" opacity="0.3" />
         <text x="100" y="40" textAnchor="middle" fontSize="14" fill="#f0e6d2" stroke="none">GUIDE</text>
      </g>
    </svg>
  )
};

/* --- 4. Logic Functions --- */
const getZodiacSign = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const signs = [
    {n:"牡羊座",k:"aries",e:"fire"}, {n:"牡牛座",k:"taurus",e:"earth"}, {n:"双子座",k:"gemini",e:"air"}, {n:"蟹座",k:"cancer",e:"water"},
    {n:"獅子座",k:"leo",e:"fire"}, {n:"乙女座",k:"virgo",e:"earth"}, {n:"天秤座",k:"libra",e:"air"}, {n:"蠍座",k:"scorpio",e:"water"},
    {n:"射手座",k:"sagittarius",e:"fire"}, {n:"山羊座",k:"capricorn",e:"earth"}, {n:"水瓶座",k:"aquarius",e:"air"}, {n:"魚座",k:"pisces",e:"water"}
  ];
  if ((month===3&&day>=21)||(month===4&&day<=19)) return signs[0];
  if ((month===4&&day>=20)||(month===5&&day<=20)) return signs[1];
  if ((month===5&&day>=21)||(month===6&&day<=21)) return signs[2];
  if ((month===6&&day>=22)||(month===7&&day<=22)) return signs[3];
  if ((month===7&&day>=23)||(month===8&&day<=22)) return signs[4];
  if ((month===8&&day>=23)||(month===9&&day<=22)) return signs[5];
  if ((month===9&&day>=23)||(month===10&&day<=23)) return signs[6];
  if ((month===10&&day>=24)||(month===11&&day<=22)) return signs[7];
  if ((month===11&&day>=23)||(month===12&&day<=21)) return signs[8];
  if ((month===12&&day>=22)||(month===1&&day<=19)) return signs[9];
  if ((month===1&&day>=20)||(month===2&&day<=18)) return signs[10];
  return signs[11];
};

const calculateLifePath = (dateString) => {
  if (!dateString) return 0;
  const numStr = dateString.replace(/-/g, '');
  let sum = 0;
  for (let c of numStr) sum += parseInt(c, 10);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    let tempSum = 0;
    for (let c of sum.toString()) tempSum += parseInt(c, 10);
    sum = tempSum;
  }
  return sum;
};

/* --- 5. Main App Component --- */
const App = () => {
  const [gameState, setGameState] = useState('title');
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playerStats, setPlayerStats] = useState({ luck: 10 });
  const [visitedFloors, setVisitedFloors] = useState([]);
  const [birthDate, setBirthDate] = useState('');
  const [detectedZodiac, setDetectedZodiac] = useState(null); // Store detected zodiac for display
  
  // Controls controls
  const [showMenu, setShowMenu] = useState(false);
  const [effectPopup, setEffectPopup] = useState(null);

  const textEndRef = useRef(null);
  const dateInputRef = useRef(null);
  const playSound = useSynthesizedSound(false);

  /* Style Injection */
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      ::-webkit-scrollbar { display: none; }
      * { -ms-overflow-style: none; scrollbar-width: none; }
      @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;700&family=IM+Fell+English+SC&display=swap');
      .font-serif { font-family: 'Shippori Mincho', serif; }
      .font-display { font-family: 'IM Fell English SC', serif; }
      .paper-texture { background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E"); }
      .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
      .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      @keyframes popIn { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      .animate-fade-out { animation: fadeOut 0.5s ease-out forwards; }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      .spin-slow { animation: spin 10s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  /* --- Game Engine Helpers --- */

  const typeText = (fullText, speed = 30, autoMenu = true) => {
    setIsTyping(true);
    setShowMenu(false); // Hide menu while typing
    setText('');
    let index = 0;
    
    const timerId = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      if (index % 3 === 0) playSound('type-key');
      index++;
      if (index >= fullText.length) {
        clearInterval(timerId);
        setIsTyping(false);
        if (autoMenu) {
            playSound('slide');
            setShowMenu(true);
        }
      }
    }, speed);
  };

  const triggerEffect = (content, duration = 2500, callback) => {
    setEffectPopup(content);
    playSound('popup');
    setTimeout(() => {
        setEffectPopup(null);
        if (callback) callback();
    }, duration);
  };

  // Helper to mark floor as done (only once)
  const markAsVisited = (floor) => {
    setVisitedFloors(prev => {
        if (prev.includes(floor)) return prev;
        return [...prev, floor];
    });
  };

  /* --- Initial Menu Show --- */
  useEffect(() => {
    if (gameState === 'title') {
      const timer = setTimeout(() => setShowMenu(true), 800);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  /* --- Action Handlers --- */

  const handleStart = () => {
    setGameState('intro');
    typeText("扉を開くと、カビと古い羊皮紙の匂い。\n支配人の老人が現れた。\n\n「……おや、初めてのお客様ですね。\n入館の前に、貴方の『魂の刻印（誕生日）』を帳簿に記していただけますかな？」", 30, false);
    setTimeout(() => setShowMenu(true), 1000); 
  };

  const handleSubmitProfile = () => {
    if (!birthDate) return;
    setShowMenu(false);
    setGameState('floor_select');
    typeText("「……確かに承りました。では、ごゆっくり」\n老人が道を譲ると、奥への通路が現れた。\n\nどの売り場（フロア）へ向かいますか？", 30, true);
  };

  const handleGoToFloor = (floor) => {
    setShowMenu(false);
    setGameState(floor);

    let msg = "";
    if (floor === 'dice') msg = "「運試しの回廊」へようこそ。\n行く手を巨大なガーゴイルが阻んでいる！\n\n「ここを通るには、運命力(LUCK)を示せ……」";
    if (floor === 'tarot') msg = "「タロットの館」。\nテーブルの上にはカードが伏せられている。\n君の運命を映し出す1枚を選べ。";
    if (floor === 'numerology') msg = "「数秘術の時計塔」。\n巨大な歯車が、君の『運命数』を刻もうとしている……。";
    if (floor === 'runes') msg = "「古代ルーンの石碑」。\n袋の中に手を入れ、石をひとつ掴み取りたまえ。";
    if (floor === 'astrology') msg = "「星読みの展望台」。\n望遠鏡を覗き、星々のメッセージに耳を傾けよう。";
    
    if (visitedFloors.includes(floor)) {
         msg += "\n\n（このフロアの運命は既に定まったようだ）";
    }

    typeText(msg, 30, true);
  };
  
  const returnToHall = () => {
      setShowMenu(false);
      setGameState('floor_select');
      
      const visitedCount = visitedFloors.length;
      const totalFloors = 5; // Dice, Tarot, Numerology, Runes, Astrology
      let msg = "";

      if (visitedCount === totalFloors) {
          msg = "全てのフロアを巡ったようだな。\n最上階へのエレベーターが到着している……。";
      } else if (visitedCount >= 3) {
          // Changed logic: 3+ visited but not all
          msg = "3つの封印は解かれ、最上階への道は開いている。\nまだ巡っていないフロアへ向かうか、最上階へ進むかは君の自由だ。";
      } else {
          let remaining = 3 - visitedCount;
          msg = `螺旋階段の前に案内板がある。\n（あと ${remaining} 箇所、巡る必要があります）`;
      }
      typeText(msg, 30, true);
  };

  /* --- Mini Game Logic --- */

  const runDice = () => {
    setShowMenu(false);
    playSound('dice-roll');
    const d1 = Math.ceil(Math.random()*6);
    const d2 = Math.ceil(Math.random()*6);
    const total = d1 + d2;

    const PopupContent = (
        <div className="flex gap-4">
            <div className="w-16 h-16 bg-[#f0e6d2] border-2 border-black flex items-center justify-center text-3xl font-bold rounded shadow-lg transform rotate-12">{d1}</div>
            <div className="w-16 h-16 bg-[#f0e6d2] border-2 border-black flex items-center justify-center text-3xl font-bold rounded shadow-lg transform -rotate-12">{d2}</div>
        </div>
    );

    triggerEffect(PopupContent, 2000, () => {
        markAsVisited('dice'); 
        if (total >= 7) {
            playSound('magic');
            setPlayerStats(p => ({...p, luck: p.luck + 2}));
            typeText(`合計 ${total}！\n「見事だ……通るがよい」\nガーゴイルは石像に戻り、道が開かれた！(運勢: 大吉)`);
        } else {
            setPlayerStats(p => ({...p, luck: Math.max(0, p.luck - 2)}));
            typeText(`合計 ${total}……。\n「運が足りぬようだな！」\n天井からタライが落ちてきた！(運勢: 凶)`);
        }
    });
  };

  const runTarot = (idx) => {
    setShowMenu(false);
    const cards = [
        {name:"愚者", desc:"新たな始まり。恐れずに進め。", luck:1},
        {name:"運命の輪", desc:"チャンス到来。流れに乗れ。", luck:3},
        {name:"塔", desc:"崩壊と啓示。衝撃に備えよ。", luck:-3},
        {name:"世界", desc:"完成と調和。旅の終わり。", luck:4},
        {name:"死神", desc:"終わりと始まり。過去を捨てよ。", luck:0},
    ];
    const picked = cards[Math.floor(Math.random() * cards.length)];
    
    const PopupContent = (
        <div className="w-32 h-48 bg-black text-[#f0e6d2] border-4 border-[#f0e6d2] flex flex-col items-center justify-center rounded shadow-2xl">
            <Moon size={32} className="mb-2" />
            <div className="font-display text-xl text-center px-2">{picked.name}</div>
        </div>
    );

    triggerEffect(PopupContent, 2500, () => {
        markAsVisited('tarot'); 
        playSound('magic');
        setPlayerStats(p => ({...p, luck: p.luck + picked.luck}));
        typeText(`「${picked.name}」\n\n${picked.desc}`);
    });
  };

  const runNumerology = () => {
    setShowMenu(false);
    const num = calculateLifePath(birthDate);
    const PopupContent = (
        <div className="w-40 h-40 rounded-full border-4 border-black bg-[#f0e6d2] flex items-center justify-center shadow-xl animate-spin-slow">
            <span className="font-display text-6xl font-bold">{num}</span>
        </div>
    );
    
    triggerEffect(PopupContent, 2500, () => {
        markAsVisited('numerology'); 
        playSound('magic');
        setPlayerStats(p => ({...p, luck: p.luck + 1}));
        typeText(`運命数は「${num}」。\n歯車がその数を刻み、君に新たな指針を与えた。`);
    });
  };
  
  const runRunes = () => {
      setShowMenu(false); 
      triggerEffect(<div className="text-4xl">ᚠ</div>, 2000, () => { 
          markAsVisited('runes'); 
          playSound('magic'); 
          setPlayerStats(p=>({...p, luck: p.luck+2})); 
          typeText("石には『フェフ(富)』のルーンが刻まれていた。"); 
      });
  };
  
  const runAstrology = () => {
      setShowMenu(false); 
      const z = getZodiacSign(birthDate); 
      setDetectedZodiac(z); // Store for display

      triggerEffect(<div className="text-2xl font-bold bg-white p-4 border-2 border-black">{z?.n}</div>, 2000, () => { 
          markAsVisited('astrology'); 
          typeText(`夜空には${z?.n}が輝いている。\n星々は君の味方のようだ。`); 
      });
  };

  const showResult = () => {
      setShowMenu(false);
      setGameState('result');
      let verdict = playerStats.luck >= 12 ? "「絶好調」" : (playerStats.luck >= 8 ? "「安定」" : "「要注意」");
      let msg = `すべてのフロアを巡った……。\n君の今日の運勢は${verdict}だ。\n\n獲得LUCK: ${playerStats.luck}\n気をつけて帰るんだよ。`;
      typeText(msg, 40, true);
  };

  const resetGame = () => {
      setShowMenu(false);
      setGameState('title');
      setPlayerStats({luck: 10});
      setVisitedFloors([]);
      setBirthDate('');
      setDetectedZodiac(null);
      setText('');
      setIsTyping(false);
  };

  /* --- Render --- */

  const btnBase = "w-full py-4 text-center border-b border-[#0a0a0a]/20 bg-[#f0e6d2] hover:bg-[#fffdf5] active:bg-[#e0d6c2] text-[#0a0a0a] font-bold font-serif text-lg transition-colors cursor-pointer select-none flex items-center justify-center gap-3";

  return (
    <div className="fixed inset-0 w-full h-full bg-neutral-900 font-serif overflow-hidden flex items-center justify-center">
      
      {/* Device Container */}
      <div className="relative w-full h-full sm:w-[420px] sm:h-[90vh] sm:rounded-xl sm:border-8 sm:border-[#1a1a1a] bg-[#e3dac9] overflow-hidden shadow-2xl flex flex-col">
        
        {/* GLOBAL BACKGROUND TEXTURE */}
        <div className="absolute inset-0 paper-texture opacity-50 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-black/40 pointer-events-none z-0" />

        {/* --- HEADER --- */ }
        <div className="relative z-20 h-14 bg-[#0a0a0a] text-[#f0e6d2] flex justify-between items-center px-4 shadow-lg shrink-0">
            <span className="font-display text-lg tracking-widest">DEPT. OF DESTINY</span>
            <div className="flex gap-3 text-sm font-mono">
                <span className="flex items-center gap-1"><Star size={14}/> {playerStats.luck}</span>
            </div>
        </div>

        {/* --- MAIN DISPLAY AREA (Integrated Illustration & Text) --- */}
        <div className="relative flex-grow flex flex-col z-10 overflow-hidden">
            
            {/* 1. Background Layer (SVG Scenes) - Low Opacity */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
               {gameState === 'title' && <SvgIllustrations.Title />}
               {gameState !== 'title' && <SvgIllustrations.Hallway />}
            </div>

            {/* 2. Character / Object Layer - Positioned absolutely */}
            <div className="absolute bottom-0 right-[-20px] w-48 sm:w-64 z-10 pointer-events-none transition-transform duration-700">
                {gameState === 'intro' && <Characters.Manager />}
                {gameState === 'floor_select' && <Characters.InformationBoard />}
                {gameState === 'dice' && <Characters.Gargoyle />}
            </div>

            {/* 3. Text Layer - High Contrast Overlay */}
            <div className="relative z-20 p-6 flex flex-col h-full">
                {/* Title Screen Special */}
                {gameState === 'title' ? (
                    <div 
                        className="flex flex-col items-center justify-center h-full animate-pop-in cursor-pointer hover:scale-105 transition-transform"
                        onClick={handleStart} 
                    >
                        <h1 className="text-5xl font-display mb-4 text-[#0a0a0a] drop-shadow-sm text-center leading-tight">運命の<br/>迷宮デパート</h1>
                        <div className="w-16 h-1 bg-black mb-6"></div>
                        <p className="text-sm font-bold opacity-80 tracking-widest">PRESS START</p>
                    </div>
                ) : (
                    // Game Text
                    <div className="mt-8 relative">
                         {/* Text Background for readability */}
                         <div className="absolute -inset-4 bg-[#f0e6d2]/80 blur-xl -z-10 rounded-full"></div>
                         
                         {/* SCENE OBJECTS DISPLAY */}
                         {gameState === 'dice' && <SceneObjects.Dice />}
                         {gameState === 'tarot' && <SceneObjects.TarotCards />}
                         {gameState === 'numerology' && <SceneObjects.NumerologyGear />}
                         {gameState === 'runes' && <SceneObjects.RunesBag />}
                         {gameState === 'astrology' && !detectedZodiac && <SceneObjects.AstrologyScope />}
                         {gameState === 'astrology' && detectedZodiac && <SceneObjects.Zodiac signKey={detectedZodiac.k} />}

                         <p className="text-lg sm:text-xl font-medium leading-loose text-[#0a0a0a] drop-shadow-sm whitespace-pre-wrap min-h-[100px]">
                            {text}
                            {isTyping && <span className="inline-block w-2 h-5 bg-black ml-1 animate-pulse align-middle"/>}
                         </p>

                         {/* Date Input for Intro */}
                         {gameState === 'intro' && !isTyping && (
                             <div className="mt-8 animate-fade-in-up">
                                <label className="block text-xs font-bold mb-1 opacity-70">生年月日を選択</label>
                                <div className="relative bg-white border-2 border-black p-2 flex items-center shadow-md max-w-[200px]" onClick={() => dateInputRef.current?.showPicker()}>
                                    <input ref={dateInputRef} type="date" value={birthDate} onChange={(e)=>setBirthDate(e.target.value)} className="w-full bg-transparent outline-none font-mono text-lg z-10 relative cursor-pointer"/>
                                    <Calendar className="absolute right-2 text-black pointer-events-none" size={18}/>
                                </div>
                             </div>
                         )}
                    </div>
                )}
            </div>

            {/* 4. EFFECT POPUP OVERLAY */}
            {effectPopup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-pop-in">
                    {effectPopup}
                </div>
            )}
        </div>

        {/* --- SLIDE UP COMMAND MENU --- */}
        <div className={`
            absolute bottom-0 left-0 right-0 z-40
            bg-[#f0e6d2] border-t-4 border-double border-[#0a0a0a]
            shadow-[0_-5px_20px_rgba(0,0,0,0.3)]
            transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
            ${showMenu ? 'translate-y-0' : 'translate-y-[110%]'}
        `}>
            {/* Handle Bar (Visual cue) */}
            <div className="w-full flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-[#0a0a0a]/20 rounded-full"></div>
            </div>

            {/* Commands Grid */}
            <div className="grid grid-cols-1 pb-6 max-h-[50vh] overflow-y-auto">
                
                {gameState === 'title' && (
                    <button onClick={handleStart} className={btnBase}>
                        <Sparkles size={20}/> 入店する
                    </button>
                )}

                {gameState === 'intro' && (
                    <button onClick={handleSubmitProfile} disabled={!birthDate} className={`${btnBase} ${!birthDate && 'opacity-50 grayscale'}`}>
                        <ArrowRight size={20}/> 刻印を押して進む
                    </button>
                )}

                {gameState === 'floor_select' && (
                    <div className="grid grid-cols-2">
                        <button onClick={() => handleGoToFloor('tarot')} disabled={visitedFloors.includes('tarot')} className={`${btnBase} border-r ${visitedFloors.includes('tarot') && 'opacity-40 line-through'}`}>
                             <Moon size={18}/> 3F タロット
                        </button>
                        <button onClick={() => handleGoToFloor('numerology')} disabled={visitedFloors.includes('numerology')} className={`${btnBase} ${visitedFloors.includes('numerology') && 'opacity-40 line-through'}`}>
                             <Hash size={18}/> 2F 数秘術
                        </button>
                        <button onClick={() => handleGoToFloor('runes')} disabled={visitedFloors.includes('runes')} className={`${btnBase} border-r ${visitedFloors.includes('runes') && 'opacity-40 line-through'}`}>
                             <Star size={18}/> 1F ルーン
                        </button>
                        <button onClick={() => handleGoToFloor('dice')} disabled={visitedFloors.includes('dice')} className={`${btnBase} ${visitedFloors.includes('dice') && 'opacity-40 line-through'}`}>
                             <Dices size={18}/> B1 運試し
                        </button>
                        <button onClick={() => handleGoToFloor('astrology')} disabled={visitedFloors.includes('astrology')} className={`col-span-2 ${btnBase} ${visitedFloors.includes('astrology') && 'opacity-40 line-through'}`}>
                             <Sun size={18}/> RF 星読み
                        </button>
                        
                        {visitedFloors.length >= 3 && (
                            <button onClick={showResult} className={`col-span-2 ${btnBase} bg-[#2a1a1a] text-[#f0e6d2] hover:bg-[#4a2a2a]`}>
                                <ArrowRight size={18}/> 最上階へ（結果）
                            </button>
                        )}
                    </div>
                )}

                {gameState === 'dice' && (
                    !visitedFloors.includes('dice') ? (
                        <button onClick={runDice} className={btnBase}>
                            <Dices size={20}/> サイコロを振る
                        </button>
                    ) : (
                        <button onClick={returnToHall} className={btnBase}>
                            <RotateCcw size={20}/> 案内板へ戻る
                        </button>
                    )
                )}
                
                {gameState === 'tarot' && (
                    !visitedFloors.includes('tarot') ? (
                        <div className="grid grid-cols-3">
                            <button onClick={() => runTarot(0)} className={`${btnBase} border-r`}>左</button>
                            <button onClick={() => runTarot(1)} className={`${btnBase} border-r`}>中</button>
                            <button onClick={() => runTarot(2)} className={btnBase}>右</button>
                        </div>
                    ) : (
                        <button onClick={returnToHall} className={btnBase}>
                            <RotateCcw size={20}/> 案内板へ戻る
                        </button>
                    )
                )}

                {gameState === 'runes' && (
                    !visitedFloors.includes('runes') ? (
                        <button onClick={runRunes} className={btnBase}>
                            <Hand size={20}/> 袋に手を入れる
                        </button>
                    ) : (
                        <button onClick={returnToHall} className={btnBase}>
                            <RotateCcw size={20}/> 案内板へ戻る
                        </button>
                    )
                )}

                {gameState === 'numerology' && (
                    !visitedFloors.includes('numerology') ? (
                        <button onClick={runNumerology} className={btnBase}>
                            <Hash size={20}/> 運命数を受け入れる
                        </button>
                    ) : (
                        <button onClick={returnToHall} className={btnBase}>
                            <RotateCcw size={20}/> 案内板へ戻る
                        </button>
                    )
                )}
                
                {gameState === 'astrology' && (
                     !visitedFloors.includes('astrology') ? (
                        <button onClick={runAstrology} className={btnBase}>
                            <Sun size={20}/> 星を見る
                        </button>
                     ) : (
                        <button onClick={returnToHall} className={btnBase}>
                            <RotateCcw size={20}/> 案内板へ戻る
                        </button>
                    )
                )}

                {gameState === 'result' && (
                    <button onClick={resetGame} className={btnBase}>
                        <RotateCcw size={20}/> 最初に戻る
                    </button>
                )}

            </div>
        </div>

      </div>
    </div>
  );
};

export default App;