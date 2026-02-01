export interface TarotCard {
  id: number;
  name: string;
  nameZh: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number?: number;
  uprightMeaning: string;
  reversedMeaning: string;
  uprightMeaningZh: string;
  reversedMeaningZh: string;
  keywords: string[];
  keywordsZh: string[];
}

export const majorArcana: TarotCard[] = [
  { id: 0, name: "The Fool", nameZh: "愚者", arcana: "major", uprightMeaning: "New beginnings, innocence, spontaneity, free spirit", reversedMeaning: "Recklessness, risk-taking, holding back", uprightMeaningZh: "新的开始、天真、自发性、自由精神", reversedMeaningZh: "鲁莽、冒险、退缩", keywords: ["beginnings", "innocence", "adventure"], keywordsZh: ["开始", "天真", "冒险"] },
  { id: 1, name: "The Magician", nameZh: "魔术师", arcana: "major", uprightMeaning: "Willpower, desire, creation, manifestation", reversedMeaning: "Trickery, illusions, manipulation", uprightMeaningZh: "意志力、渴望、创造、显化", reversedMeaningZh: "欺骗、幻觉、操纵", keywords: ["willpower", "creation", "skill"], keywordsZh: ["意志力", "创造", "技巧"] },
  { id: 2, name: "The High Priestess", nameZh: "女祭司", arcana: "major", uprightMeaning: "Intuition, sacred knowledge, divine feminine, subconscious", reversedMeaning: "Secrets, withdrawal, silence", uprightMeaningZh: "直觉、神圣知识、神圣女性、潜意识", reversedMeaningZh: "秘密、退缩、沉默", keywords: ["intuition", "mystery", "wisdom"], keywordsZh: ["直觉", "神秘", "智慧"] },
  { id: 3, name: "The Empress", nameZh: "女皇", arcana: "major", uprightMeaning: "Femininity, beauty, nature, nurturing, abundance", reversedMeaning: "Creative block, dependence, emptiness", uprightMeaningZh: "女性气质、美丽、自然、滋养、丰富", reversedMeaningZh: "创作瓶颈、依赖、空虚", keywords: ["abundance", "nurturing", "fertility"], keywordsZh: ["丰盛", "滋养", "丰饶"] },
  { id: 4, name: "The Emperor", nameZh: "皇帝", arcana: "major", uprightMeaning: "Authority, structure, control, fatherhood", reversedMeaning: "Tyranny, rigidity, coldness", uprightMeaningZh: "权威、结构、控制、父权", reversedMeaningZh: "暴政、僵化、冷漠", keywords: ["authority", "structure", "leadership"], keywordsZh: ["权威", "结构", "领导力"] },
  { id: 5, name: "The Hierophant", nameZh: "教皇", arcana: "major", uprightMeaning: "Tradition, conformity, morality, ethics", reversedMeaning: "Rebellion, subversiveness, new approaches", uprightMeaningZh: "传统、遵从、道德、伦理", reversedMeaningZh: "叛逆、颠覆、新方法", keywords: ["tradition", "guidance", "knowledge"], keywordsZh: ["传统", "指导", "知识"] },
  { id: 6, name: "The Lovers", nameZh: "恋人", arcana: "major", uprightMeaning: "Love, harmony, relationships, values alignment", reversedMeaning: "Disharmony, imbalance, misalignment", uprightMeaningZh: "爱情、和谐、关系、价值观统一", reversedMeaningZh: "不和谐、失衡、错位", keywords: ["love", "harmony", "choices"], keywordsZh: ["爱情", "和谐", "选择"] },
  { id: 7, name: "The Chariot", nameZh: "战车", arcana: "major", uprightMeaning: "Control, willpower, success, determination", reversedMeaning: "Lack of control, aggression, obstacles", uprightMeaningZh: "控制、意志力、成功、决心", reversedMeaningZh: "失控、攻击性、障碍", keywords: ["victory", "determination", "willpower"], keywordsZh: ["胜利", "决心", "意志力"] },
  { id: 8, name: "Strength", nameZh: "力量", arcana: "major", uprightMeaning: "Inner strength, bravery, compassion, focus", reversedMeaning: "Self-doubt, weakness, insecurity", uprightMeaningZh: "内在力量、勇气、同情心、专注", reversedMeaningZh: "自我怀疑、软弱、不安全感", keywords: ["courage", "patience", "compassion"], keywordsZh: ["勇气", "耐心", "同情"] },
  { id: 9, name: "The Hermit", nameZh: "隐者", arcana: "major", uprightMeaning: "Soul-searching, introspection, being alone, inner guidance", reversedMeaning: "Isolation, loneliness, withdrawal", uprightMeaningZh: "灵魂探索、内省、独处、内在引导", reversedMeaningZh: "孤立、孤独、退缩", keywords: ["solitude", "wisdom", "guidance"], keywordsZh: ["孤独", "智慧", "引导"] },
  { id: 10, name: "Wheel of Fortune", nameZh: "命运之轮", arcana: "major", uprightMeaning: "Good luck, karma, life cycles, destiny", reversedMeaning: "Bad luck, resistance to change, breaking cycles", uprightMeaningZh: "好运、因果、生命周期、命运", reversedMeaningZh: "厄运、抗拒改变、打破循环", keywords: ["destiny", "change", "cycles"], keywordsZh: ["命运", "变化", "循环"] },
  { id: 11, name: "Justice", nameZh: "正义", arcana: "major", uprightMeaning: "Justice, fairness, truth, cause and effect", reversedMeaning: "Unfairness, dishonesty, lack of accountability", uprightMeaningZh: "正义、公平、真理、因果", reversedMeaningZh: "不公平、不诚实、缺乏责任感", keywords: ["fairness", "truth", "balance"], keywordsZh: ["公平", "真理", "平衡"] },
  { id: 12, name: "The Hanged Man", nameZh: "倒吊人", arcana: "major", uprightMeaning: "Pause, surrender, letting go, new perspectives", reversedMeaning: "Delays, resistance, stalling", uprightMeaningZh: "暂停、臣服、放手、新视角", reversedMeaningZh: "拖延、抵抗、停滞", keywords: ["sacrifice", "release", "perspective"], keywordsZh: ["牺牲", "释放", "视角"] },
  { id: 13, name: "Death", nameZh: "死神", arcana: "major", uprightMeaning: "Endings, change, transformation, transition", reversedMeaning: "Resistance to change, personal transformation delayed", uprightMeaningZh: "结束、改变、转变、过渡", reversedMeaningZh: "抗拒改变、个人转变延迟", keywords: ["transformation", "endings", "renewal"], keywordsZh: ["转变", "结束", "重生"] },
  { id: 14, name: "Temperance", nameZh: "节制", arcana: "major", uprightMeaning: "Balance, moderation, patience, purpose", reversedMeaning: "Imbalance, excess, self-healing", uprightMeaningZh: "平衡、节制、耐心、目标", reversedMeaningZh: "失衡、过度、自我疗愈", keywords: ["balance", "patience", "moderation"], keywordsZh: ["平衡", "耐心", "节制"] },
  { id: 15, name: "The Devil", nameZh: "恶魔", arcana: "major", uprightMeaning: "Shadow self, attachment, addiction, restriction", reversedMeaning: "Releasing limiting beliefs, exploring dark thoughts", uprightMeaningZh: "阴影自我、执着、沉迷、束缚", reversedMeaningZh: "释放限制性信念、探索黑暗思想", keywords: ["bondage", "temptation", "shadow"], keywordsZh: ["束缚", "诱惑", "阴影"] },
  { id: 16, name: "The Tower", nameZh: "塔", arcana: "major", uprightMeaning: "Sudden change, upheaval, chaos, revelation", reversedMeaning: "Personal transformation, fear of change", uprightMeaningZh: "突变、剧变、混乱、启示", reversedMeaningZh: "个人转变、害怕改变", keywords: ["upheaval", "revelation", "awakening"], keywordsZh: ["剧变", "启示", "觉醒"] },
  { id: 17, name: "The Star", nameZh: "星星", arcana: "major", uprightMeaning: "Hope, faith, purpose, renewal, spirituality", reversedMeaning: "Lack of faith, despair, self-trust issues", uprightMeaningZh: "希望、信念、目标、重生、灵性", reversedMeaningZh: "缺乏信念、绝望、自我信任问题", keywords: ["hope", "inspiration", "serenity"], keywordsZh: ["希望", "灵感", "宁静"] },
  { id: 18, name: "The Moon", nameZh: "月亮", arcana: "major", uprightMeaning: "Illusion, fear, anxiety, subconscious, intuition", reversedMeaning: "Release of fear, repressed emotion, inner confusion", uprightMeaningZh: "幻觉、恐惧、焦虑、潜意识、直觉", reversedMeaningZh: "释放恐惧、压抑的情感、内心困惑", keywords: ["illusion", "intuition", "unconscious"], keywordsZh: ["幻觉", "直觉", "潜意识"] },
  { id: 19, name: "The Sun", nameZh: "太阳", arcana: "major", uprightMeaning: "Positivity, fun, warmth, success, vitality", reversedMeaning: "Inner child, feeling down, overly optimistic", uprightMeaningZh: "积极、乐趣、温暖、成功、活力", reversedMeaningZh: "内在小孩、情绪低落、过度乐观", keywords: ["joy", "success", "vitality"], keywordsZh: ["快乐", "成功", "活力"] },
  { id: 20, name: "Judgement", nameZh: "审判", arcana: "major", uprightMeaning: "Judgement, rebirth, inner calling, absolution", reversedMeaning: "Self-doubt, inner critic, ignoring the call", uprightMeaningZh: "审判、重生、内在召唤、赦免", reversedMeaningZh: "自我怀疑、内在批评、忽视召唤", keywords: ["rebirth", "reflection", "reckoning"], keywordsZh: ["重生", "反思", "清算"] },
  { id: 21, name: "The World", nameZh: "世界", arcana: "major", uprightMeaning: "Completion, integration, accomplishment, travel", reversedMeaning: "Seeking personal closure, shortcuts", uprightMeaningZh: "完成、整合、成就、旅行", reversedMeaningZh: "寻求结束、走捷径", keywords: ["completion", "achievement", "wholeness"], keywordsZh: ["完成", "成就", "圆满"] },
];

function createMinorArcana(): TarotCard[] {
  const suits: { suit: TarotCard["suit"]; suitZh: string }[] = [
    { suit: "wands", suitZh: "权杖" },
    { suit: "cups", suitZh: "圣杯" },
    { suit: "swords", suitZh: "宝剑" },
    { suit: "pentacles", suitZh: "星币" },
  ];

  const numberNames: Record<number, { en: string; zh: string }> = {
    1: { en: "Ace", zh: "王牌" },
    2: { en: "Two", zh: "二" },
    3: { en: "Three", zh: "三" },
    4: { en: "Four", zh: "四" },
    5: { en: "Five", zh: "五" },
    6: { en: "Six", zh: "六" },
    7: { en: "Seven", zh: "七" },
    8: { en: "Eight", zh: "八" },
    9: { en: "Nine", zh: "九" },
    10: { en: "Ten", zh: "十" },
    11: { en: "Page", zh: "侍从" },
    12: { en: "Knight", zh: "骑士" },
    13: { en: "Queen", zh: "王后" },
    14: { en: "King", zh: "国王" },
  };

  const suitMeanings: Record<string, { upright: string[]; reversed: string[]; uprightZh: string[]; reversedZh: string[]; keywords: string[][]; keywordsZh: string[][] }> = {
    wands: {
      upright: [
        "Inspiration, new opportunities, growth, potential",
        "Planning, making decisions, discovery",
        "Expansion, foresight, overseas opportunities",
        "Celebration, harmony, homecoming, relaxation",
        "Competition, conflict, diversity of opinion",
        "Public recognition, victory, progress, self-confidence",
        "Challenge, competition, perseverance",
        "Speed, action, air travel, movement",
        "Resilience, grit, last stand, persistence",
        "Burden, responsibility, hard work, stress",
        "Adventure, excitement, fresh energy, free spirit",
        "Energy, passion, adventure, impulsiveness",
        "Courage, determination, joy, exuberance",
        "Big picture, leader, overcoming challenges",
      ],
      reversed: [
        "Lack of direction, delays, distractions",
        "Fear of unknown, lack of planning",
        "Playing small, lack of foresight",
        "Breakdown in communication, transition",
        "Avoiding conflict, inner conflict",
        "Excess pride, lack of recognition, punishment",
        "Giving up, overwhelmed, defensive",
        "Delays, frustration, holding off",
        "Exhaustion, giving up, overwhelmed",
        "Unable to delegate, overstressed",
        "Lack of direction, inner conflicts",
        "Haste, scattered energy, delays",
        "Self-doubt, hesitation, impatience",
        "Impulsive, overbearing, unachievable goals",
      ],
      uprightZh: [
        "灵感、新机会、成长、潜力", "计划、做决定、发现", "扩展、远见、海外机会", "庆祝、和谐、团聚、放松",
        "竞争、冲突、意见分歧", "公众认可、胜利、进步、自信", "挑战、竞争、毅力", "速度、行动、旅行、运动",
        "韧性、毅力、坚守、持续", "负担、责任、辛勤工作、压力", "冒险、兴奋、新能量、自由精神", "能量、热情、冒险、冲动",
        "勇气、决心、快乐、热情", "大局观、领导者、克服挑战",
      ],
      reversedZh: [
        "缺乏方向、延迟、分心", "害怕未知、缺乏规划", "格局太小、缺乏远见", "沟通中断、过渡期",
        "避免冲突、内心矛盾", "过度骄傲、缺乏认可、惩罚", "放弃、不堪重负、防御", "延迟、沮丧、观望",
        "疲惫、放弃、不堪重负", "无法委托、压力过大", "缺乏方向、内心冲突", "急躁、精力分散、延迟",
        "自我怀疑、犹豫、急躁", "冲动、专横、不可实现的目标",
      ],
      keywords: [
        ["inspiration","potential"],["planning","decisions"],["expansion","foresight"],["celebration","harmony"],
        ["competition","conflict"],["victory","recognition"],["challenge","perseverance"],["speed","action"],
        ["resilience","persistence"],["burden","responsibility"],["adventure","excitement"],["passion","energy"],
        ["courage","joy"],["leadership","vision"],
      ],
      keywordsZh: [
        ["灵感","潜力"],["计划","决定"],["扩展","远见"],["庆祝","和谐"],
        ["竞争","冲突"],["胜利","认可"],["挑战","毅力"],["速度","行动"],
        ["韧性","坚持"],["负担","责任"],["冒险","兴奋"],["热情","能量"],
        ["勇气","快乐"],["领导力","远见"],
      ],
    },
    cups: {
      upright: [
        "Love, new relationships, compassion, creativity",
        "Partnership, unity, mutual attraction",
        "Celebration, friendship, creativity, community",
        "Meditation, contemplation, apathy, reevaluation",
        "Regret, failure, disappointment, pessimism",
        "Nostalgia, childhood memories, innocence, joy",
        "Illusion, fantasy, wishful thinking, choices",
        "Abandonment, withdrawal, escapism",
        "Contentment, satisfaction, gratitude, wish fulfilled",
        "Divine love, bliss, family, harmony, alignment",
        "Creative opportunity, curiosity, possibility",
        "Romance, charm, imagination, beauty",
        "Compassion, calm, comfort, emotional security",
        "Emotional balance, generosity, diplomatic",
      ],
      reversed: [
        "Self-love, intuition blocked, repressed emotions",
        "Imbalance, broken communication",
        "Overindulgence, gossip, isolation",
        "Retreat, withdrawal, checking in",
        "Personal setbacks, self-forgiveness, moving on",
        "Stuck in the past, naivety",
        "Alignment, personal values, overwhelmed",
        "Trying one more time, indecision",
        "Inner happiness, materialism, dissatisfaction",
        "Disconnection, misaligned values, struggling",
        "Emotional immaturity, insecurity, disappointment",
        "Unrealistic, jealousy, moodiness",
        "Inner disturbance, self-care, co-dependency",
        "Selfishness, emotionally manipulative",
      ],
      uprightZh: [
        "爱情、新关系、同情、创造力", "伙伴关系、团结、相互吸引", "庆祝、友谊、创造力、社区", "冥想、沉思、冷漠、重新评估",
        "遗憾、失败、失望、悲观", "怀旧、童年记忆、纯真、快乐", "幻觉、幻想、一厢情愿、选择", "放弃、退缩、逃避",
        "满足、满意、感恩、愿望实现", "神圣的爱、幸福、家庭、和谐", "创意机会、好奇心、可能性", "浪漫、魅力、想象力、美",
        "同情、平静、安慰、情感安全", "情绪平衡、慷慨、外交",
      ],
      reversedZh: [
        "自爱、直觉受阻、压抑情感", "失衡、沟通中断", "过度放纵、八卦、孤立", "退缩、撤回、自省",
        "个人挫折、自我原谅、继续前进", "沉迷过去、天真", "对齐、个人价值、不堪重负", "再试一次、犹豫不决",
        "内心幸福、物质主义、不满", "脱节、价值观不一致、挣扎", "情感不成熟、不安全感、失望", "不切实际、嫉妒、喜怒无常",
        "内心不安、自我关爱、共依赖", "自私、情感操控",
      ],
      keywords: [
        ["love","creativity"],["partnership","unity"],["celebration","friendship"],["contemplation","meditation"],
        ["regret","disappointment"],["nostalgia","innocence"],["illusion","choices"],["withdrawal","escapism"],
        ["contentment","gratitude"],["harmony","bliss"],["curiosity","opportunity"],["romance","charm"],
        ["compassion","comfort"],["balance","generosity"],
      ],
      keywordsZh: [
        ["爱情","创造力"],["伙伴","团结"],["庆祝","友谊"],["沉思","冥想"],
        ["遗憾","失望"],["怀旧","纯真"],["幻觉","选择"],["退缩","逃避"],
        ["满足","感恩"],["和谐","幸福"],["好奇","机会"],["浪漫","魅力"],
        ["同情","安慰"],["平衡","慷慨"],
      ],
    },
    swords: {
      upright: [
        "Breakthrough, clarity, sharp mind, new idea",
        "Difficult choices, indecision, stalemate",
        "Heartbreak, emotional pain, sorrow, grief",
        "Rest, relaxation, meditation, contemplation",
        "Conflict, disagreements, competition, defeat",
        "Transition, change, rite of passage, releasing",
        "Betrayal, deception, getting away with something",
        "Restriction, imprisonment, powerlessness, self-victimizing",
        "Anxiety, worry, fear, depression, nightmares",
        "Painful endings, deep wounds, betrayal, loss, crisis",
        "Curiosity, restlessness, mental energy, communication",
        "Action, impulsiveness, defending beliefs",
        "Independent, unbiased judgment, clear boundaries",
        "Intellectual power, authority, truth, mental clarity",
      ],
      reversed: [
        "Confusion, brutality, chaos",
        "Indecision, confusion, information overload",
        "Optimism, forgiveness, recovery",
        "Restlessness, burnout, lack of progress",
        "Reconciliation, ending conflict",
        "Emotional baggage, unfinished business",
        "Imposter syndrome, coming clean",
        "Self-acceptance, new perspective, freedom",
        "Hope, reaching out, recovery",
        "Recovery, regeneration, resisting an inevitable end",
        "Deception, manipulation, all talk",
        "No direction, disregard for consequences",
        "Overly emotional, easily influenced",
        "Quiet power, inner truth, misuse of power",
      ],
      uprightZh: [
        "突破、清晰、敏锐、新想法", "困难选择、犹豫不决、僵局", "心碎、情感痛苦、悲伤", "休息、放松、冥想、沉思",
        "冲突、分歧、竞争、失败", "过渡、改变、放下", "背叛、欺骗、逃避", "限制、困境、无力感",
        "焦虑、担忧、恐惧、噩梦", "痛苦结束、深层伤害、背叛、危机", "好奇心、不安、精神能量、沟通", "行动、冲动、捍卫信念",
        "独立、公正判断、清晰界限", "智力权威、权威、真理、心智清晰",
      ],
      reversedZh: [
        "困惑、残酷、混乱", "犹豫不决、困惑、信息过载", "乐观、宽恕、恢复", "不安、倦怠、缺乏进展",
        "和解、结束冲突", "情感包袱、未完成的事", "冒名顶替综合症、坦白", "自我接纳、新视角、自由",
        "希望、寻求帮助、恢复", "恢复、重生、抗拒不可避免的结束", "欺骗、操纵、空谈", "没有方向、无视后果",
        "过于情绪化、容易受影响", "内在力量、内在真理、滥用权力",
      ],
      keywords: [
        ["clarity","breakthrough"],["choices","stalemate"],["heartbreak","grief"],["rest","contemplation"],
        ["conflict","defeat"],["transition","change"],["deception","betrayal"],["restriction","powerlessness"],
        ["anxiety","worry"],["endings","crisis"],["curiosity","communication"],["action","impulsiveness"],
        ["independence","judgment"],["authority","truth"],
      ],
      keywordsZh: [
        ["清晰","突破"],["选择","僵局"],["心碎","悲伤"],["休息","沉思"],
        ["冲突","失败"],["过渡","改变"],["欺骗","背叛"],["限制","无力"],
        ["焦虑","担忧"],["结束","危机"],["好奇","沟通"],["行动","冲动"],
        ["独立","判断"],["权威","真理"],
      ],
    },
    pentacles: {
      upright: [
        "New financial opportunity, manifestation, abundance",
        "Multiple priorities, adaptability, time management",
        "Teamwork, collaboration, learning, implementation",
        "Saving money, security, conservatism, scarcity",
        "Financial loss, poverty, lack mindset, isolation",
        "Giving, receiving, sharing wealth, generosity",
        "Long-term view, sustainable results, perseverance",
        "Apprenticeship, repetitive tasks, mastery, skill",
        "Abundance, luxury, self-sufficiency, financial independence",
        "Wealth, inheritance, family, establishment, retirement",
        "Manifestation, financial opportunity, new job",
        "Hard work, productivity, routine, conservatism",
        "Nurturing, practical, providing, home body",
        "Wealth, business, leadership, security, discipline",
      ],
      reversed: [
        "Lost opportunity, lack of planning",
        "Over-committed, disorganization, reprioritization",
        "Lack of teamwork, disregard for skills",
        "Over-spending, greed, self-protection",
        "Recovery from financial loss, spiritual poverty",
        "Self-care, unpaid debts, one-sided charity",
        "Lack of long-term vision, limited success",
        "Self-development, perfectionism, boredom",
        "Over-investment, hustling, living beyond means",
        "Family disputes, bankruptcy, lone wolf",
        "Lack of progress, procrastination, learn from failure",
        "Self-reflection, reevaluation, boredom",
        "Financial independence, self-care, work-home conflict",
        "Authoritarian, disorganized, controlling",
      ],
      uprightZh: [
        "新的财务机会、显化、丰盛", "多重优先事项、适应力、时间管理", "团队合作、协作、学习、实施", "储蓄、安全、保守、稀缺",
        "财务损失、贫困、匮乏心态、孤立", "给予、接受、分享财富、慷慨", "长远眼光、可持续结果、毅力", "学徒期、重复任务、精通、技能",
        "丰盛、奢华、自给自足、财务独立", "财富、遗产、家族、安定、退休", "显化、财务机会、新工作", "努力工作、生产力、常规、保守",
        "滋养、务实、供养、顾家", "财富、商业、领导力、安全、纪律",
      ],
      reversedZh: [
        "错失机会、缺乏规划", "过度承诺、混乱、重新排序", "缺乏团队合作、忽视技能", "过度消费、贪婪、自我保护",
        "从财务损失中恢复、精神贫困", "自我关爱、未偿债务、单方面慈善", "缺乏长远眼光、有限的成功", "自我发展、完美主义、无聊",
        "过度投资、忙碌、入不敷出", "家庭纠纷、破产、独行侠", "缺乏进展、拖延、从失败中学习", "自我反思、重新评估、无聊",
        "财务独立、自我关爱、工作与家庭冲突", "专制、混乱、控制欲强",
      ],
      keywords: [
        ["opportunity","manifestation"],["adaptability","priorities"],["teamwork","collaboration"],["security","saving"],
        ["loss","poverty"],["generosity","sharing"],["perseverance","sustainability"],["mastery","apprenticeship"],
        ["abundance","luxury"],["wealth","family"],["manifestation","opportunity"],["productivity","routine"],
        ["nurturing","practical"],["wealth","leadership"],
      ],
      keywordsZh: [
        ["机会","显化"],["适应","优先"],["团队","协作"],["安全","储蓄"],
        ["损失","贫困"],["慷慨","分享"],["毅力","可持续"],["精通","学徒"],
        ["丰盛","奢华"],["财富","家族"],["显化","机会"],["生产力","常规"],
        ["滋养","务实"],["财富","领导力"],
      ],
    },
  };

  const cards: TarotCard[] = [];
  let id = 22;

  for (const { suit, suitZh } of suits) {
    const m = suitMeanings[suit!];
    for (let num = 1; num <= 14; num++) {
      const { en, zh } = numberNames[num];
      const suitEn = suit!.charAt(0).toUpperCase() + suit!.slice(1);
      cards.push({
        id: id++,
        name: `${en} of ${suitEn}`,
        nameZh: `${suitZh}${zh}`,
        arcana: "minor",
        suit: suit!,
        number: num,
        uprightMeaning: m.upright[num - 1],
        reversedMeaning: m.reversed[num - 1],
        uprightMeaningZh: m.uprightZh[num - 1],
        reversedMeaningZh: m.reversedZh[num - 1],
        keywords: m.keywords[num - 1],
        keywordsZh: m.keywordsZh[num - 1],
      });
    }
  }

  return cards;
}

export const minorArcana = createMinorArcana();
export const tarotDeck: TarotCard[] = [...majorArcana, ...minorArcana];

export type SpreadType = "single" | "three-card" | "celtic-cross";

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: string;
  positionZh: string;
}

export const spreadConfigs: Record<SpreadType, { count: number; positions: { en: string; zh: string }[] }> = {
  single: {
    count: 1,
    positions: [{ en: "Your Card", zh: "你的牌" }],
  },
  "three-card": {
    count: 3,
    positions: [
      { en: "Past", zh: "过去" },
      { en: "Present", zh: "现在" },
      { en: "Future", zh: "未来" },
    ],
  },
  "celtic-cross": {
    count: 10,
    positions: [
      { en: "Present", zh: "现在" },
      { en: "Challenge", zh: "挑战" },
      { en: "Past", zh: "过去" },
      { en: "Future", zh: "未来" },
      { en: "Above", zh: "上方" },
      { en: "Below", zh: "下方" },
      { en: "Advice", zh: "建议" },
      { en: "External Influences", zh: "外部影响" },
      { en: "Hopes & Fears", zh: "希望与恐惧" },
      { en: "Outcome", zh: "结果" },
    ],
  },
};

export function drawCards(spread: SpreadType): DrawnCard[] {
  const config = spreadConfigs[spread];
  const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, config.count).map((card, i) => ({
    card,
    isReversed: Math.random() > 0.5,
    position: config.positions[i].en,
    positionZh: config.positions[i].zh,
  }));
}
