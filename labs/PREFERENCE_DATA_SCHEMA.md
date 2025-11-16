# 내 성향, 이상형 데이터 정형화 문서

## 1. 데이터베이스 선호도 구조 분석

### 1.1 선호도 타입 (preference_types)
총 **12개**의 주요 선호도 카테고리가 존재:

| 코드 | 이름 | 설명 | 다중선택 | 최대선택수 |
|------|------|------|----------|------------|
| PERSONALITY | 성격 유형 | 자신의 성격 특성 | O | 1개 |
| DATING_STYLE | 연애 스타일 | 연애 방식과 스타일 | O | 3개 |
| LIFESTYLE | 라이프스타일 | 생활 패턴 | O | 3개 |
| DRINKING | 음주 선호도 | 음주에 대한 태도 | X | 1개 |
| SMOKING | 흡연 선호도 | 흡연에 대한 태도 | X | 1개 |
| TATTOO | 문신 선호도 | 문신에 대한 태도 | X | 1개 |
| INTEREST | 관심사 | 취미 및 관심 분야 | O | 5개 |
| MBTI | MBTI 유형 | MBTI 성격 유형 | X | 1개 |
| AGE_PREFERENCE | 선호 나이대 | 나이대 선호도 | X | 1개 |
| MILITARY_STATUS_MALE | 군필 여부 | 남성의 군대 경험 (SELF) | X | 1개 |
| MILITARY_PREFERENCE_FEMALE | 군필 여부 선호도 | 여성의 군필 선호 (PARTNER) | X | 1개 |
| personality | 성격 | 이전 버전 성격 (사용 안함) | X | 1개 |

### 1.2 선호도 타겟 (preference_target)
- **SELF**: 자신의 성향/특성
- **PARTNER**: 이상형/상대방에 대한 선호도

### 1.3 데이터 저장 방식
- **user_preference_options**: 선호도 옵션 선택 (N:M 관계)
- **user_range_preferences**: 범위 선호도 (나이 범위 등)
- **additional_preferences**: MBTI 좋아/싫어 타입

## 2. 내 성향 데이터 정형화 (SELF)

### 2.1 기본 프로필 정보
```json
{
  "basic_profile": {
    "age": 25,
    "gender": "MALE|FEMALE",
    "mbti": "ENFP",
    "name": "홍길동",
    "title": "소프트웨어 엔지니어",
  }
}
```

### 2.2 자신의 성향 (SELF Preferences)

#### 개인 특성 (Personal Characteristics)
```json
{
  "self_characteristics": {
    "personality": ["활발한 성격", "유머 감각 있는 사람", "모험을 즐기는 사람"],
    "dating_style": ["친구처럼 지내는 스타일", "상대방을 많이 챙기는 스타일"],
    "lifestyle": ["여행을 자주 다니는 편", "운동을 즐기는 편", "카페에서 노는 걸 좋아함"],
    "mbti": "ENFP",
    "military_status": {
      "applies_to": "MALE",
      "value": "군필|미필|면제"
    }
  }
}
```

#### 생활 습관 (Lifestyle Habits)
```json
{
  "self_habits": {
    "drinking": "자주 마심|적당히 마심|거의 못마심|전혀 안마시지 않음",
    "smoking": "흡연자|비흡연자|전자담배",
    "tattoo": "문신 없음|작은 문신|문신 있음"
  }
}
```

#### 관심사 (Interests)
```json
{
  "self_interests": [
    "영화", "음악", "여행", "사진", "카페",
    "운동", "요리", "게임", "독서", "패션",
    "공연", "전시", "반려동물", "등산", "자전거"
  ]
}
```

## 3. 이상형 데이터 정형화 (PARTNER)

### 3.1 상대방에 대한 선호도 (PARTNER Preferences)

#### 성격 및 연애 스타일 선호
```json
{
  "partner_preferences": {
    "personality": ["배려심 많은 사람", "감성적인 사람", "리더십 있는 사람"],
    "dating_style": ["다정다감한 스타일", "상대방을 많이 챙기는 스타일", "자주 연락하는 걸 선호하는 스타일"],
    "lifestyle": ["여행을 자주 다니는 편", "아침형 인간", "운동을 즐기는 편"]
  }
}
```

#### 생활 습관 선호도
```json
{
  "partner_habits_preference": {
    "drinking": "마셔도 괜찮음|가끔 마시는 정도면 좋음|안마시면 좋겠음|반드시 비흡연자였으면 좋겠음",
    "smoking": "비흡연자였으면 좋겠음|흡연자도 괜찮음|반드시 비흡연자였으면 좋겠음|상관없음",
    "tattoo": "문신 있어도 괜찮음|작은 문신 정도는 괜찮음|문신이 없는 사람이었으면 좋겠음|상관없음"
  }
}
```

#### 관심사 선호
```json
{
  "partner_interests": [
    "영화", "음악", "여행", "카페", "운동"
  ]
}
```

#### MBTI 이상형
```json
{
  "mbti_preference": {
    "preferred_mbti": "ENFP",
    "good_mbti": "ENFP, INFP, ENFJ",
    "bad_mbti": "ISTJ, ESTJ"
  }
}
```

#### 나이 및 군대 선호도
```json
{
  "age_preference": {
    "type": "연상|연하|동갑|상관없음",
    "range": {
      "min": 22,
      "max": 35
    }
  },
  "military_preference": {
    "applies_to": "FEMALE",
    "preference": "군필|미필|상관없음"
  }
}
```

## 4. 통합 데이터 스키마

### 4.1 완전한 사용자 프로필 스키마
```json
{
  "user_profile": {
    "dataset_type": "validation|learning",
    "user_id": "uuid",
    "basic_info": {
      "age": 25,
      "gender": "MALE|FEMALE",
      "name": "홍길동",
      "mbti": "ENFP",
      "title": "소프트웨어 엔지니어",
      "introduction": "안녕하세요!",
      "university": "한국대학교",
      "department": "컴퓨터공학과"
    },
    "self_profile": {
      "personality": ["활발한 성격", "유머 감각 있는 사람", "모험을 즐기는 사람"],
      "dating_style": ["친구처럼 지내는 스타일", "상대방을 많이 챙기는 스타일"],
      "lifestyle": ["여행을 자주 다니는 편", "운동을 즐기는 편", "카페에서 노는 걸 좋아함"],
      "habits": {
        "drinking": "적당히 마심",
        "smoking": "비흡연자",
        "tattoo": "작은 문신"
      },
      "interests": ["영화", "음악", "여행", "사진", "카페"],
      "military_status": "군필" // 남성만 해당
    },
    "partner_preference": {
      "personality": ["배려심 많은 사람", "감성적인 사람", "리더십 있는 사람"],
      "dating_style": ["다정다감한 스타일", "상대방을 많이 챙기는 스타일"],
      "lifestyle": ["여행을 자주 다니는 편", "아침형 인간"],
      "habits": {
        "drinking": "마셔도 괜찮음",
        "smoking": "비흡연자였으면 좋겠음",
        "tattoo": "작은 문신 정도는 괜찮음"
      },
      "interests": ["영화", "음악", "여행", "카페"],
      "mbti": {
        "preferred": "ENFP",
        "good_types": ["ENFP", "INFP", "ENFJ"],
        "bad_types": ["ISTJ", "ESTJ"]
      },
      "age": {
        "preference": "연상",
        "range": {"min": 22, "max": 35}
      },
      "military": "군필"
    },
    "profile_images": [
      {
        "id": "uuid",
        "s3_url": "https://...",
        "local_path": "/data/validation/profiles/user_001/img_001.jpg",
        "is_main": true,
        "order": 1
      }
    ],
    "match_data": {
      "connection_id": "uuid",
      "partner_profile_id": "uuid",
      "score": 85.5,
      "mutual_like": true,
      "match_date": "2025-01-15T10:30:00Z"
    }
  }
}
```

## 5. 선호도 옵션 상세 매핑

### 5.1 성격 유형 (PERSONALITY)
| 값 | 표시명 | 설명 |
|----|--------|------|
| OUTGOING | 활발한 성격 | 외향적이고 활동적인 성격 |
| QUIET | 조용한 성격 | 내성적이고 차분한 성격 |
| CARING | 배려심 많은 사람 | 타인을 잘 챙기는 성격 |
| LEADER | 리더십 있는 사람 | 주도적이고 리십 있는 성격 |
| HUMOROUS | 유머 감각 있는 사람 | 재치있고 웃음을 주는 성격 |
| EMOTIONAL | 감성적인 사람 | 감정 표현이 풍부한 성격 |
| ADVENTUROUS | 모험을 즐기는 사람 | 새로운 도전을 즐기는 성격 |
| PLANNER | 계획적인 스타일 | 체계적이고 계획적인 성격 |
| SPONTANEOUS | 즉흥적인 스타일 | 자발적이고 즉흥적인 성격 |

### 5.2 연애 스타일 (DATING_STYLE)
| 값 | 표시명 | 설명 |
|----|--------|------|
| PROACTIVE | 적극적인 스타일 | 관계에서 주도적으로 접근 |
| AFFECTIONATE | 다정다감한 스타일 | 애정 표현이 풍부한 스타일 |
| FRIENDLY | 친구처럼 지내는 스타일 | 편안한 친구 관계 지향 |
| TSUNDERE | 츤데레 스타일 | 겉은 차갑지만 속은 다정한 스타일 |
| ATTENTIVE | 상대방을 많이 챙기는 스타일 | 세심하게 배려하는 스타일 |
| RESERVED_BUT_CARING | 표현을 잘 안 하지만 속은 다정한 스타일 |
| FREE_SPIRITED | 자유로운 연애를 선호하는 스타일 | 구속받지 않는 관계 선호 |
| FREQUENT_CONTACT | 자주 연락하는 걸 선호하는 스타일 | 꾸준한 소통 지향 |

### 5.3 라이프스타일 (LIFESTYLE)
| 값 | 표시명 | 설명 |
|----|--------|------|
| MORNING_PERSON | 아침형 인간 | 아침에 활동적인 생활 패턴 |
| NIGHT_PERSON | 밤형 인간 | 밤에 활동적인 생활 패턴 |
| HOMEBODY | 집순이 / 집돌이 | 집에 있는 것을 선호하는 생활 |
| TRAVELER | 여행을 자주 다니는 편 | 여행을 즐기는 생활 방식 |
| ACTIVE | 운동을 즐기는 편 | 운동이나 액티비티 선호 |
| GAMER | 게임을 자주 하는 편 | 게임을 즐기는 생활 패턴 |
| CAFE_LOVER | 카페에서 노는 걸 좋아함 | 카페 문화를 즐기는 생활 |
| ACTIVITY_LOVER | 액티비티 활동을 좋아함 | 다양한 액티비티 선호 |

### 5.4 음주 선호도 (DRINKING)
| 값 | 표시명 | 설명 |
|----|--------|------|
| PREFER_NONE | 안마시면 좋겠음 | 상대가 술을 안 마셨으면 좋음 |
| PREFER_OCCASIONALLY | 가끔마시면 좋겠음 | 가끔 정도로 마시는 선호 |
| PREFER_MODERATE | 적당히 마시면 좋겠음 | 적당량을 마시는 선호 |
| OKAY | 마셔도 괜찮음 | 마시는 것에 대해 무관심 |
| FREQUENT_OKAY | 자주 마셔도 괜찮음 | 자주 마시는 것도 괜찮음 |
| NEVER | 전혀 안마시지 않음 | 자신이 전혀 마시지 않음 (SELF) |
| RARELY | 거의 못마심 | 자신이 거의 마시지 않음 (SELF) |
| MODERATE | 적당히 마심 | 자신이 적당히 마심 (SELF) |
| FREQUENT | 자주 마심 | 자신이 자주 마심 (SELF) |
| VERY_FREQUENT | 매우 즐겨 마심 | 자신이 매우 자주 마심 (SELF) |

### 5.5 흡연 선호도 (SMOKING)
| 값 | 표시명 | 설명 |
|----|--------|------|
| NON_SMOKER | 비흡연자 | 흡연을 하지 않음 |
| E_CIGARETTE | 전자담배 | 전자담배 사용자 |
| SMOKER | 흡연자 | 일반 담배 흡연자 |
| NO_PREFERENCE | 상관없음 | 흡연 여부에 무관심 |
| SMOKER_OK | 흡연자도 괜찮음 | 흡연자와도 괜찮음 |
| NON_SMOKER_PREFERRED | 비흡연자였으면 좋겠음 | 비흡연자 선호 |
| STRICTLY_NON_SMOKER | 반드시 비흡연자였으면 좋겠음 | 비흡연자 강력 선호 |

### 5.6 문신 선호도 (TATTOO)
| 값 | 표시명 | 설명 |
|----|--------|------|
| NONE_STRICT | 문신 X | 문신을 전혀 원치 않음 |
| SMALL | 작은 문신 | 작은 문신 정도는 괜찮음 |
| NONE | 문신 없음 | 자신에게 문신이 없음 (SELF) |
| OKAY | 문신 O | 문신이 있는 것도 괜찮음 |
| TATTOO_OK | 문신 있어도 괜찮음 | 문신이 있어도 괜찮음 |
| SMALL_TATTOO_OK | 작은 문신 정도는 괜찮음 | 작은 문신 정도는 괜찮음 |
| NO_TATTOO_PREFERRED | 문신이 없는 사람이었으면 좋겠음 | 문신 없는 사람 선호 |

### 5.7 군대 관련
#### 군필 여부 (MILITARY_STATUS_MALE) - SELF, 남성만
| 값 | 표시명 | 설명 |
|----|--------|------|
| NOT_SERVED | 미필 | 군대 경험 없음 |
| EXEMPTED | 면제 | 군대 면제 |
| SERVED | 군필 | 군대 경험 있음 |

#### 군필 선호도 (MILITARY_PREFERENCE_FEMALE) - PARTNER, 여성만
| 값 | 표시명 | 설명 |
|----|--------|------|
| NOT_SERVED | 미필 | 미필 선호 |
| NO_PREFERENCE | 상관없음 | 군필 여부 무관심 |
| SERVED | 군필 | 군필 선호 |

### 5.8 관심사 (INTEREST) - 최대 5개 선택
| 값 | 표시명 | 설명 |
|----|--------|------|
| MOVIES | 영화 | 영화 감상 |
| MUSIC | 음악 | 음악 감상 |
| READING | 독서 | 책 읽기 |
| GAMING | 게임 | 게임 즐기기 |
| SPORTS | 운동 | 스포츠 활동 |
| COOKING | 요리 | 요리하기 |
| TRAVEL | 여행 | 여행 다니기 |
| PHOTOGRAPHY | 사진 | 사진 찍기 |
| FASHION | 패션 | 패션 관심 |
| CAFE | 카페 | 카페 가기 |
| PERFORMANCE | 공연 | 공연 관람 |
| EXHIBITION | 전시 | 전시회 관람 |
| PETS | 반려동물 | 반려동물 |
| HIKING | 등산 | 등산 활동 |
| CYCLING | 자전거 | 자전거 라이딩 |

### 5.9 나이 선호도 (AGE_PREFERENCE)
| 값 | 표시명 | 설명 |
|----|--------|------|
| OLDER | 연상 | 나이가 많은 사람 선호 |
| YOUNGER | 연하 | 나이가 적은 사람 선호 |
| SAME_AGE | 동갑 | 비슷한 나이 선호 |
| NO_PREFERENCE | 상관없음 | 나이 무관심 |

## 6. 데이터 증강을 위한 정형화 규칙

### 6.1 데이터 일관성 규칙
1. **성별에 따른 데이터**: 군대 관련 데이터는 성별에 맞게 처리
2. **최대 선택 수**: 다중선택 항목은 최대 선택 수 준수
3. **논리적 일관성**: 선호도 데이터 간의 논리적 관계 유지
4. **MBTI 일치**: 프로필 MBTI와 선호도 MBTI의 일관성

### 6.2 데이터 증강 프롬프트 템플릿
```
기본 정보:
- 나이: {age}
- 성별: {gender}
- MBTI: {mbti}
- 직업: {job}

자신의 성향을 생성해주세요:
- 성격: 1-3개 선택 (PERSONALITY)
- 연애 스타일: 1-3개 선택 (DATING_STYLE)
- 라이프스타일: 1-3개 선택 (LIFESTYLE)
- 생활 습관: DRINKING, SMOKING, TATTOO 각 1개씩
- 관심사: 2-5개 선택 (INTEREST)

이상형을 생성해주세요:
- 상대방 성격: 1-3개 선택
- 상대방 연애 스타일: 1-3개 선택
- 상대방 생활 습관 선호도: 각 1개씩
- 상대방 관심사: 2-5개 선택
- MBTI 선호도: 좋아하는 타입 2-3개, 싫어하는 타입 1-2개
- 나이 선호도: OLDER/YOUNGER/SAME_AGE/NO_PREFERENCE + 범위
```

이 정형화된 데이터 구조를 기반으로 LangChain을 통해 실제와 유사한 데이터셋을 생성할 수 있습니다.