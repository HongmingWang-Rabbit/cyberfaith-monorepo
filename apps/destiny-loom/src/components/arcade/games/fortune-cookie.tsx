"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ArcadeGameProps } from "../types";

const FORTUNES_EN = [
  "The cosmos aligns in your favor today.",
  "A door you thought closed will open unexpectedly.",
  "Your kindness will return to you tenfold.",
  "Trust the journey, even when the path is unclear.",
  "An unexpected friendship will change your perspective.",
  "The answer you seek lies within your own heart.",
  "Patience today will lead to abundance tomorrow.",
  "A creative breakthrough awaits you this week.",
  "Your intuition is stronger than you realize.",
  "The universe is conspiring in your favor.",
  "Let go of what no longer serves your spirit.",
  "A meaningful coincidence will guide your next step.",
  "Your energy attracts exactly what you need.",
  "The seed you planted long ago is about to bloom.",
  "Embrace change — it carries hidden blessings.",
  "Someone is thinking of you with great admiration.",
  "Your next bold move will be rewarded.",
  "Stillness will reveal what motion cannot.",
  "A forgotten dream will resurface with new meaning.",
  "The obstacle in your path is actually the path.",
  "Your words today will heal someone tomorrow.",
  "A small act of courage will unlock a great adventure.",
  "The stars have noted your perseverance.",
  "What you resist, persists. What you accept, transforms.",
  "An old wound is ready to be released.",
  "Your generosity creates ripples across the universe.",
  "A teacher will appear when you least expect it.",
  "The light you share with others illuminates your own path.",
  "Trust your timing — you are not behind.",
  "A pleasant surprise is heading your way.",
  "Your spiritual practice is bearing fruit.",
  "The next chapter of your story will be the best one.",
  "Harmony in relationships begins with inner peace.",
  "A karmic debt is about to be settled in your favor.",
  "Your dreams are messages — pay attention tonight.",
  "The universe rewards those who dare to be authentic.",
  "A moment of silence will bring profound clarity.",
  "Your compassion is your greatest strength.",
  "Something you lost will find its way back to you.",
  "The energy you put out today shapes your tomorrow.",
  "A new perspective will solve an old problem.",
  "Your ancestors smile upon your choices.",
  "Abundance flows to those who appreciate what they have.",
  "A chance encounter will spark inspiration.",
  "The wisdom you seek is already within you.",
  "Your resilience has not gone unnoticed by the cosmos.",
  "A cycle is ending — prepare for a beautiful beginning.",
  "The kindness you show strangers echoes in eternity.",
  "Your next meditation will bring a powerful insight.",
  "A hidden talent is ready to emerge.",
  "The path of least resistance leads to your destiny.",
  "Someone will offer you exactly what you need today.",
  "Your aura is growing stronger with each passing day.",
  "A blessing disguised as a challenge approaches.",
  "The moon watches over your journey with care.",
  "Your heart knows things your mind has yet to discover.",
  "A sacred synchronicity is unfolding in your life.",
  "The gratitude you express multiplies your blessings.",
  "An old friendship will be renewed and strengthened.",
  "Your spiritual growth inspires those around you.",
  "A leap of faith will land you somewhere wonderful.",
  "The universe has received your prayers.",
  "Your inner child holds the key to your joy.",
  "A period of rest will lead to great productivity.",
  "The love you give freely comes back abundantly.",
  "Your third eye is opening — trust your visions.",
  "A karmic reward is being prepared for you.",
  "The sunrise tomorrow carries a special message for you.",
  "Your chakras are aligning for a powerful transformation.",
  "A golden opportunity hides within today's routine.",
  "The divine plan for your life exceeds your imagination.",
  "Your meditation practice attracts celestial protection.",
  "A forgotten skill will prove invaluable soon.",
  "The cosmos celebrates your existence.",
  "Your next conversation will contain a hidden gift.",
  "A wave of healing energy surrounds you now.",
  "The karma you've built is about to pay dividends.",
  "Your spirit guides are especially active today.",
  "A beautiful truth will replace an old illusion.",
  "The energy of the full moon amplifies your intentions.",
  "Your positive thoughts are manifesting rapidly.",
  "A sacred geometry pattern is forming in your life.",
  "The universe listens most when you speak from the heart.",
  "Your chakra balance is attracting wonderful experiences.",
  "A quantum leap in consciousness awaits you.",
  "The dharma path you walk leads to liberation.",
  "Your mantra has been heard across dimensions.",
  "A cosmic gift is being wrapped for you right now.",
  "The akashic records show great things in your future.",
  "Your soul contract includes joy — claim it.",
  "A mystical experience is near — keep your heart open.",
  "The vibration of your laughter heals the world.",
  "Your crystal energy is at peak resonance today.",
  "A spiritual ally is entering your life.",
  "The divine feminine/masculine within you is awakening.",
  "Your energy field is expanding beautifully.",
  "A past life lesson is integrating — feel the release.",
  "The sacred fire within you burns brighter each day.",
  "Your soul chose this life for a magnificent reason.",
  "A celestial alignment favors your deepest wishes.",
  "The lotus of your heart is blooming.",
  "Your karma bank account shows a large positive balance.",
  "A miracle is simply a shift in perception away.",
  "The universe just winked at you. Wink back.",
];

const FORTUNES_ZH = [
  "宇宙今日与你同行。",
  "一扇你以为关上的门即将重新打开。",
  "你的善良将十倍回报于你。",
  "相信旅程，即使道路不清晰。",
  "一段意想不到的友谊将改变你的视角。",
  "你寻求的答案就在你心中。",
  "今天的耐心将带来明天的丰盛。",
  "一个创造性的突破在本周等待着你。",
  "你的直觉比你意识到的更强大。",
  "宇宙正在为你密谋好事。",
  "放下不再服务于你灵魂的东西。",
  "一个有意义的巧合将指引你的下一步。",
  "你的能量吸引着你所需要的一切。",
  "你很久前种下的种子即将开花。",
  "拥抱变化——它携带隐藏的祝福。",
  "有人正满怀钦佩地想着你。",
  "你的下一个大胆举动将得到回报。",
  "静止将揭示运动无法展现的东西。",
  "一个被遗忘的梦想将以新的意义重新浮现。",
  "你路上的障碍其实就是道路本身。",
  "你今天的话语将治愈明天的某人。",
  "一个小小的勇敢行为将开启一段伟大的冒险。",
  "星星已经记录了你的坚持不懈。",
  "你抗拒的会持续存在。你接受的会转化。",
  "一个旧伤口准备好被释放了。",
  "你的慷慨在宇宙中创造涟漪。",
  "一位老师将在你最不期望的时候出现。",
  "你与他人分享的光照亮了你自己的道路。",
  "相信你的时间安排——你并没有落后。",
  "一个令人愉快的惊喜正向你走来。",
  "你的灵修正在结出果实。",
  "你故事的下一章将是最精彩的。",
  "关系中的和谐始于内心的平静。",
  "一笔因果债即将以有利于你的方式清算。",
  "你的梦是信息——今晚请留意。",
  "宇宙奖赏那些敢于做真实自己的人。",
  "一刻的沉默将带来深刻的清晰。",
  "你的慈悲是你最大的力量。",
  "你失去的东西会找到回到你身边的路。",
  "你今天散发的能量塑造你的明天。",
  "一个新的视角将解决一个旧问题。",
  "你的祖先对你的选择微笑。",
  "丰盛流向那些珍惜自己所拥有的人。",
  "一次偶遇将激发灵感。",
  "你寻求的智慧已在你之中。",
  "你的韧性没有被宇宙忽视。",
  "一个循环正在结束——为美丽的新开始做准备。",
  "你对陌生人展示的善良在永恒中回荡。",
  "你的下一次冥想将带来强大的洞见。",
  "一个隐藏的才华准备好展现了。",
  "阻力最小的路通向你的命运。",
  "今天有人会给你恰好你需要的东西。",
  "你的光环正在日益强大。",
  "一个伪装成挑战的祝福正在接近。",
  "月亮正关心地守护着你的旅程。",
  "你的心知道你的头脑尚未发现的事情。",
  "一个神圣的同步性正在你的生活中展开。",
  "你表达的感恩使你的祝福倍增。",
  "一段旧友谊将得到更新和加强。",
  "你的灵性成长激励着周围的人。",
  "信仰的跳跃将让你到达美好的地方。",
  "宇宙已收到你的祈祷。",
  "你内心的孩子握着你快乐的钥匙。",
  "一段休息期将带来巨大的生产力。",
  "你自由给予的爱丰盛地回来。",
  "你的第三眼正在打开——相信你的愿景。",
  "一个因果回报正在为你准备。",
  "明天的日出为你带来一条特别的信息。",
  "你的脉轮正在为一次强大的转变而对齐。",
  "一个黄金机会隐藏在今天的日常中。",
  "神圣计划超出你的想象。",
  "你的冥想修行吸引着天上的保护。",
  "一个被遗忘的技能很快将证明其无价。",
  "宇宙庆祝你的存在。",
  "你的下一次对话将包含一个隐藏的礼物。",
  "一股治愈能量的波浪现在包围着你。",
  "你建立的业力即将产生红利。",
  "你的灵性向导今天特别活跃。",
  "一个美丽的真相将取代一个旧的幻想。",
  "满月的能量放大你的意图。",
  "你的正面思想正在快速显化。",
  "一个神圣几何图案正在你的生活中形成。",
  "当你从心说话时，宇宙听得最清楚。",
  "你的脉轮平衡正在吸引美好的体验。",
  "意识的量子飞跃在等待着你。",
  "你走的法道通向解脱。",
  "你的咒语已跨越维度被听到。",
  "一份宇宙的礼物正在为你包装。",
  "阿卡西记录显示你的未来有伟大的事物。",
  "你的灵魂契约包括喜悦——去领取它。",
  "神秘的体验就在近处——保持你的心敞开。",
  "你笑声的振动治愈着世界。",
  "你的水晶能量今天处于峰值共振。",
  "一位灵性盟友正在进入你的生活。",
  "你内在的神圣女性/男性正在觉醒。",
  "你的能量场正在美丽地扩展。",
  "一个前世的课题正在整合——感受那释放。",
  "你内心的圣火每天燃烧得更加明亮。",
  "你的灵魂选择了这一生是有壮丽原因的。",
  "天体排列有利于你最深的愿望。",
  "你心中的莲花正在绽放。",
  "你的业力银行账户显示大量正余额。",
  "奇迹只是一次感知转变的距离。",
  "宇宙刚刚向你眨了眨眼。眨回去吧。",
];

function getDailyFortuneIndex(fortuneCount: number): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % fortuneCount;
}

function hasFreeCrackToday(): boolean {
  if (typeof window === "undefined") return true;
  const key = "fortune-cookie-free-crack";
  const last = localStorage.getItem(key);
  const today = new Date().toISOString().slice(0, 10);
  return last !== today;
}

function markFreeCrackUsed(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("fortune-cookie-free-crack", new Date().toISOString().slice(0, 10));
}

export default function FortuneCookie({ config, balance, onBalanceChange, onPlay, isPlaying }: ArcadeGameProps) {
  const [cracked, setCracked] = useState(false);
  const [fortune, setFortune] = useState("");
  const [karmaWon, setKarmaWon] = useState(0);
  const [isFreeCrack, setIsFreeCrack] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<"en" | "zh">("en");
  const [shareReady, setShareReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const path = window.location.pathname;
    setLocale(path.includes("/zh") ? "zh" : "en");
    setIsFreeCrack(hasFreeCrackToday());
  }, []);

  const fortunes = locale === "zh" ? FORTUNES_ZH : FORTUNES_EN;
  const cost = isFreeCrack ? 0 : (config.minBet || 5);

  const handleCrack = useCallback(async () => {
    if (cracked || isPlaying) return;
    setError(null);

    if (!isFreeCrack && balance !== null && balance < cost) {
      setError(locale === "zh" ? "业力点数不足" : "Not enough karma points");
      return;
    }

    // Try API play
    const result = await onPlay({ free: isFreeCrack });

    if (result) {
      const won = result.pointsWon;
      setKarmaWon(won);
      if (balance !== null) onBalanceChange(balance + result.netPoints);
      if (isFreeCrack) markFreeCrackUsed();
      setIsFreeCrack(false);
    } else {
      // Fallback: client-side fortune only
      setKarmaWon(Math.floor(Math.random() * 10) + 1);
    }

    // Pick fortune
    const idx = result
      ? (result.result?.fortuneIndex ?? getDailyFortuneIndex(fortunes.length))
      : getDailyFortuneIndex(fortunes.length);
    setFortune(fortunes[idx % fortunes.length]);
    setCracked(true);
  }, [cracked, isPlaying, isFreeCrack, balance, cost, locale, fortunes, onPlay, onBalanceChange]);

  const handleReset = () => {
    setCracked(false);
    setFortune("");
    setKarmaWon(0);
    setShareReady(false);
  };

  const handleShare = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fortune) return;

    const ctx = canvas.getContext("2d")!;
    canvas.width = 600;
    canvas.height = 400;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, "#1a0533");
    grad.addColorStop(1, "#0d1b2a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);

    // Border glow
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 15;
    ctx.strokeRect(15, 15, 570, 370);
    ctx.shadowBlur = 0;

    // Cookie emoji
    ctx.font = "48px serif";
    ctx.textAlign = "center";
    ctx.fillText("🥠", 300, 70);

    // Fortune text
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "18px sans-serif";
    const words = fortune.split(" ");
    let line = "";
    let y = 140;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 500) {
        ctx.fillText(line.trim(), 300, y);
        line = word + " ";
        y += 28;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), 300, y);

    // Karma badge
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`✨ +${karmaWon} karma`, 300, 320);

    // Watermark
    ctx.fillStyle = "#64748b";
    ctx.font = "12px sans-serif";
    ctx.fillText("Spirit Arcade • Destiny Loom", 300, 370);

    setShareReady(true);
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (navigator.share) {
        const file = new File([blob], "fortune.png", { type: "image/png" });
        navigator.share({ files: [file], title: "My Fortune Cookie" }).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "fortune.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }, [fortune, karmaWon]);

  const t = {
    en: {
      title: "Fortune Cookie",
      tap: "Tap to crack open",
      free: "FREE",
      cost: `${cost} karma`,
      won: `+${karmaWon} karma!`,
      share: "Share Fortune",
      again: "Crack Another",
      noFree: "Free crack used today",
    },
    zh: {
      title: "幸运饼干",
      tap: "点击打开",
      free: "免费",
      cost: `${cost} 业力`,
      won: `+${karmaWon} 业力!`,
      share: "分享运势",
      again: "再开一个",
      noFree: "今日免费次数已用",
    },
  }[locale];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Cookie */}
      <div
        className={`relative cursor-pointer transition-all duration-700 ${cracked ? "" : "hover:scale-105 active:scale-95"}`}
        onClick={handleCrack}
        style={{ perspective: "600px" }}
      >
        <div
          className={`text-center transition-all duration-700 ${
            cracked ? "opacity-0 scale-50" : "opacity-100 scale-100"
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: cracked ? "rotateX(90deg)" : "rotateX(0deg)",
          }}
        >
          <div className="text-9xl drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse">
            🥠
          </div>
          <p className="mt-4 text-gray-400 text-sm animate-bounce">
            {isPlaying ? "..." : t.tap}
          </p>
          <p className="text-xs mt-1 text-purple-400">
            {isFreeCrack ? `🎁 ${t.free}` : `💰 ${t.cost}`}
          </p>
        </div>

        {/* Cracked state */}
        {cracked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
            <div className="flex gap-4 text-6xl mb-4">
              <span className="inline-block -rotate-[30deg] translate-x-2">🥠</span>
            </div>
          </div>
        )}
      </div>

      {/* Fortune message */}
      {cracked && fortune && (
        <div className="w-full max-w-md animate-fade-in">
          <div className="relative p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-gray-950/60 backdrop-blur">
            <div className="absolute -top-px left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />

            <p className="text-center text-lg text-gray-200 font-serif italic leading-relaxed">
              &ldquo;{fortune}&rdquo;
            </p>

            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold animate-bounce">
                {t.won}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition-colors"
            >
              📤 {t.share}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/50 transition-colors"
            >
              🥠 {t.again}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Hidden canvas for share image */}
      <canvas ref={canvasRef} className="hidden" />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
