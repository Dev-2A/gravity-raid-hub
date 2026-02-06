// 무기 목록
export const WEAPONS = [
  // 탱커
  { id: 'sword', name: '한손검', job: '나이트', role: 'tank' },
  { id: 'axe', name: '양손도끼', job: '전사', role: 'tank' },
  { id: 'greatsword', name: '양손검', job: '암흑기사', role: 'tank' },
  { id: 'gunblade', name: '건블레이드', job: '건브레이커', role: 'tank' },
  
  // 힐러
  { id: 'cane', name: '환술도구', job: '백마도사', role: 'healer' },
  { id: 'book', name: '치유서', job: '학자', role: 'healer' },
  { id: 'globe', name: '천구의', job: '점성술사', role: 'healer' },
  { id: 'nouliths', name: '현학도구', job: '현자', role: 'healer' },
  
  // 근딜
  { id: 'fist', name: '격투무기', job: '몽크', role: 'melee' },
  { id: 'polearm', name: '양손창', job: '용기사', role: 'melee' },
  { id: 'daggers', name: '쌍검', job: '닌자', role: 'melee' },
  { id: 'katana', name: '외날검', job: '사무라이', role: 'melee' },
  { id: 'scythe', name: '양손낫', job: '리퍼', role: 'melee' },
  { id: 'twinblades', name: '이도류무기', job: '바이퍼', role: 'melee' },
  
  // 원딜
  { id: 'bow', name: '활', job: '음유시인', role: 'ranged' },
  { id: 'gun', name: '총', job: '기공사', role: 'ranged' },
  { id: 'throwing', name: '투척무기', job: '무도가', role: 'ranged' },
  
  // 캐스터
  { id: 'staff', name: '주술도구', job: '흑마도사', role: 'caster' },
  { id: 'grimoire', name: '마도서', job: '소환사', role: 'caster' },
  { id: 'rapier', name: '세검', job: '적마도사', role: 'caster' },
  { id: 'brush', name: '붓', job: '픽토맨서', role: 'caster' },
]

// 역할군 이름
export const ROLE_NAMES = {
  tank: '탱커',
  healer: '힐러',
  melee: '근딜',
  ranged: '원딜',
  caster: '캐스터',
}

// 토토 유형
export const TOTO_TYPES = [
  {
    id: 'weapon',
    emoji: '⚔️',
    name: '4층 무기 토토',
    desc: '이번 주 4층 무기를 맞춰보세요',
    inputType: 'weapon',       // 무기 선택
    resultLabel: '드랍 무기',
  },
  {
    id: 'wipe_count',
    emoji: '💀',
    name: '전멸 횟수 맞추기',
    desc: '오늘 몇 번 전멸할까?',
    inputType: 'number',       // 숫자 입력
    resultLabel: '실제 전멸 횟수',
  },
  {
    id: 'first_death',
    emoji: '🪦',
    name: '첫 사망자 맞추기',
    desc: '오늘 제일 먼저 죽는 사람은?',
    inputType: 'member',       // 멤버 선택
    resultLabel: '첫 사망자',
  },
  {
    id: 'last_death',
    emoji: '⚰️',
    name: '마지막 사망자 맞추기',
    desc: '오늘 마지막으로 죽는 사람은?',
    inputType: 'member',       // 멤버 선택
    resultLabel: '마지막 사망자',
  },
  {
    id: 'total_deaths',
    emoji: '☠️',
    name: '총 사망 횟수 맞추기',
    desc: '오늘 공대 전체 사망 횟수는?',
    inputType: 'number',       // 숫자 입력
    resultLabel: '실제 총 사망 횟수',
  },
]

// 층 목록
export const RAID_FLOORS = [
  { id: 1, name: '1층' },
  { id: 2, name: '2층' },
  { id: 3, name: '3층' },
  { id: 4, name: '4층' },
]

// 시상식 카테고리
export const AWARD_CATEGORIES = [
  { id: 'wipe', emoji: '🪦', name: '전멸의 주범', desc: '오늘 와이프 원인 1등' },
  { id: 'clown', emoji: '🤡', name: '공대의 광대', desc: '제일 웃긴 행동/발언' },
  { id: 'ghost', emoji: '👻', name: '생전 고인', desc: '죽기 직전 개쩌는 플레이' },
  { id: 'mvp', emoji: '🛡️', name: '진짜 MVP', desc: '오늘 캐리한 사람' },
  { id: 'floor', emoji: '💀', name: '바닥 감정사', desc: '바닥 제일 많이 본 사람' },
  { id: 'actor', emoji: '🎭', name: '명연기상', desc: '"아 나 버프 눌렀는데?"' },
]

// 업적 정의
export const ACHIEVEMENTS = [
  // 토토 관련
  { key: 'toto_first', emoji: '🎰', name: '첫 도박', desc: '토토에 처음 참여', hidden: false },
  { key: 'toto_10', emoji: '🎲', name: '도박꾼', desc: '토토 10회 참여', hidden: false },
  { key: 'toto_20', emoji: '💰', name: '프로 도박꾼', desc: '토토 20회 참여', hidden: false },
  { key: 'toto_hit_first', emoji: '🎯', name: '비기너즈 럭', desc: '토토 첫 적중', hidden: false },
  { key: 'toto_hit_3_streak', emoji: '🔮', name: '예언자', desc: '토토 3연속 적중', hidden: false },
  { key: 'toto_miss_5_streak', emoji: '🌑', name: '공대의 의의', desc: '토토 5연속 꽝', hidden: true },
  { key: 'toto_hit_5', emoji: '⭐', name: '행운의 별', desc: '토토 통산 5회 적중', hidden: false },
  { key: 'toto_hit_10', emoji: '🌟', name: '이거 암튼 사기임', desc: '토토 통산 10회 적중', hidden: true },

  // 시상식 관련
  { key: 'vote_first', emoji: '🗳️', name: '민주주의의 꽃', desc: '시상식에 처음 투표', hidden: false },
  { key: 'vote_10', emoji: '📮', name: '민주주의자', desc: '시상식 10회 투표', hidden: false },
  { key: 'wipe_3', emoji: '💣', name: '단골손님', desc: '전멸의 주범 3회 수상', hidden: false },
  { key: 'wipe_5', emoji: '☢️', name: '공대 파괴자', desc: '전멸의 주범 5회 수상', hidden: true },
  { key: 'clown_3', emoji: '🎪', name: '직업 광대', desc: '공대의 광대 3회 수상', hidden: false },
  { key: 'clown_5', emoji: '🤹', name: '서커스 단장', desc: '공대의 광대 5회 수상', hidden: true },
  { key: 'ghost_3', emoji: '⚰️', name: '불사신', desc: '생전 고인 3회 수상', hidden: false },
  { key: 'mvp_3', emoji: '👑', name: '에이스', desc: '진짜 MVP 3회 수상', hidden: false },
  { key: 'mvp_5', emoji: '🏅', name: '전설의 캐리', desc: '진짜 MVP 5회 수상', hidden: true },
  { key: 'floor_3', emoji: '🪦', name: '바닥 마스터', desc: '바닥 감정사 3회 수상', hidden: false },
  { key: 'actor_3', emoji: '🎬', name: '아카데미상', desc: '명연기상 3회 수상', hidden: true },
  { key: 'all_category', emoji: '🌈', name: '만능 엔터테이너', desc: '모든 카테고리 1회 이상 수상', hidden: true },
]
