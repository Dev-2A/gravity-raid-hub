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

// 시상식 카테고리
export const AWARD_CATEGORIES = [
  { id: 'wipe', emoji: '🪦', name: '전멸의 주범', desc: '오늘 와이프 원인 1등' },
  { id: 'clown', emoji: '🤡', name: '공대의 광대', desc: '제일 웃긴 행동/발언' },
  { id: 'ghost', emoji: '👻', name: '생전 고인', desc: '죽기 직전 개쩌는 플레이' },
  { id: 'mvp', emoji: '🛡️', name: '진짜 MVP', desc: '오늘 캐리한 사람' },
  { id: 'floor', emoji: '💀', name: '바닥 감정사', desc: '바닥 제일 많이 본 사람' },
  { id: 'actor', emoji: '🎭', name: '명연기상', desc: '"아 나 버프 눌렀는데?"' },
]