# 데이팅 앱 데이터 증강 및 관리 시스템 요구사항 문서

## 1. 프로젝트 개요

### 1.1 배경
- 현재 운영 중인 데이팅 앱의 실제 데이터셋을 기반으로 머신러닝 모델 학습용 데이터셋 구축
- 실제 상호 좋아요 데이터 282쌍을 검증 데이터셋으로 활용
- Replicate API와 LangChain을 통해 데이터 증강으로 3,000-15,000개 학습 데이터셋 생성

### 1.2 목표
- **검증 데이터셋**: 실제 사용자 데이터 282쌍 (상호 좋아요 기반)
- **학습 데이터셋**: 증강된 데이터 3,000-15,000개
- **이미지 데이터**: 프로필 사진 25,017개 활용 및 재생성
- **선호도 데이터**: 12개 차원, 189개 세부 선호도 기반 증강

## 2. 현재 데이터베이스 구조 분석

### 2.1 핵심 테이블 구조

#### profiles 테이블
```sql
- id, userId, age, gender, name, title, mbti
- instagramId, introduction, rank, savedHumanRank
- 관계: users (1:1), additional_preferences (1:1)
```

#### profile_images 테이블
```sql
- id, profileId, imageId, imageOrder, isMain
- reviewStatus, rejectionReason, isReviewed
- 관계: profiles (N:1), images (N:1)
```

#### additional_preferences 테이블
```sql
- id, goodMbti, badMbti, profileId
- 관계: profiles (1:1)
```

#### user_preferences & user_preference_options 테이블
```sql
- user_preferences: id, userId, distanceMax
- user_preference_options: id, userPreferenceId, preferenceOptionId, preferenceTarget
- 관계: users (1:1), preference_options (N:M)
```

#### preference_types & preference_options 테이블
```sql
- preference_types: id, code, name, multiSelect, maximumChoiceCount
- preference_options: id, imageUrl, preferenceTypeId, value, displayName, order
- 관계: preference_types (1:N)
```

#### matches & match_likes 테이블
```sql
- matches: id, myId, matcherId, score, connectionId, publishedAt, expiredAt, type, status
- match_likes: id, connectionId, forwardUserId, senderUserId, status, viewedAt
- 관계: users (양방향), 상호 좋아요 데이터 추출 가능
```

### 2.2 데이터 현황
- **전체 사용자**: 5,362명 (남성 73.4%, 여성 26.6%)
- **프로필 보유**: 5,352개 (99.8% 보유율)
- **프로필 이미지**: 25,017개 (평균 4.7개/사용자)
- **상호 좋아요**: 282쌍 (성공률 0.005%)
- **선호도 데이터**: 63,924개 (사용자당 평균 17.16개)

## 3. 시스템 아키텍처 설계

### 3.1 전체 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web UI        │    │   Backend API   │    │   External      │
│   (Next.js)     │◄──►│   (LangServe)   │◄──►│   Services      │
│                 │    │   (FastAPI)     │    │                 │
│ - Dashboard     │    │                 │    │ - Replicate     │
│ - Table View    │    │ - Data Export   │    │ - OpenAI        │
│ - Management    │    │ - Data Augment  │    │ - PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Storage  │    │   Database      │    │   Vector DB     │
│                 │    │                 │    │                 │
│ - CSV Files     │    │ - PostgreSQL    │    │ - Qdrant        │
│ - Images        │    │ - Validation    │    │ - Embeddings    │
│ - Generated     │    │ - Learning      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3.2 기술 스택

#### Frontend (Web UI)
- **Framework**: Next.js 15
- **UI Library**: shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Table Component**: TanStack Table
- **Language**: TypeScript

#### Backend
- **Framework**: FastAPI (LangServe)
- **Language**: Python 3.11+
- **AI Framework**: LangChain
- **Database**: PostgreSQL (기존 연동)
- **Vector DB**: Qdrant (기존 연동)
- **Cloud Storage**: boto3 (AWS S3 이미지 다운로드)

#### External Services
- **Image Generation**: Replicate API (bytedance/seedream-4)
- **Text Generation**: OpenAI API (LangChain 연동)
- **Database**: PostgreSQL (기존 프로덕션 DB)

## 4. 데이터 모델링 및 저장 구조

### 4.1 데이터 분류 체계

#### Validation Dataset (검증 데이터셋)
- **원본 데이터**: 실제 상호 좋아요 282쌍
- **용도**: 모델 성능 검증
- **특징**: 원본 데이터 유지, 수정 없음

#### Learning Dataset (학습 데이터셋)
- **증강 데이터**: 3,000-15,000개 생성 데이터
- **용도**: 머신러닝 모델 학습
- **특징**: Replicate/LangChain 기반 재생성

### 4.2 데이터 구조 설계

#### Unified User Profile Schema
```json
{
  "dataset_type": "validation|learning",
  "user_profile": {
    "id": "string",
    "age": "number",
    "gender": "MALE|FEMALE",
    "name": "string",
    "title": "string",
    "mbti": "string",
    "introduction": "string",
    "university_info": {
      "university": "string",
      "department": "string"
    }
  },
  "profile_images": [
    {
      "id": "string",
      "s3_url": "string",
      "local_path": "string",
      "is_main": "boolean",
      "order": "number"
    }
  ],
  "preferences": {
    "self": {
      "mbti_good": "string",
      "mbti_bad": "string",
      "distance_max": "string",
      "options": [
        {
          "category": "string",
          "value": "string",
          "display_name": "string"
        }
      ]
    },
    "partner": {
      "options": [
        {
          "category": "string",
          "value": "string",
          "display_name": "string"
        }
      ]
    }
  },
  "match_data": {
    "connection_id": "string",
    "partner_profile": "Profile",
    "score": "number",
    "mutual_like": "boolean",
    "match_date": "datetime"
  }
}
```

### 4.3 파일 저장 구조

#### 디렉터리 구조
```
data/
├── validation/
│   ├── profiles/
│   │   ├── images/
│   │   │   ├── user_001/
│   │   │   │   ├── img_001.jpg
│   │   │   │   └── img_002.jpg
│   │   │   └── ...
│   │   └── validation_dataset.csv
│   └── metadata.json
├── learning/
│   ├── profiles/
│   │   ├── images/
│   │   │   ├── generated_001/
│   │   │   │   ├── img_001.jpg
│   │   │   │   └── img_002.jpg
│   │   │   └── ...
│   │   └── learning_dataset.csv
│   └── metadata.json
├── augmented/
│   ├── generated_images/
│   └── generated_profiles/
└── exports/
    ├── validation_export_YYYYMMDD.csv
    └── learning_export_YYYYMMDD.csv
```

## 5. 핵심 기능 상세 명세

### 5.1 데이터 추출 기능

#### PostgreSQL 데이터 조회
- **대상 테이블**: profiles, profile_images, additional_preferences, user_preferences, user_preference_options, preference_types, preference_options, matches, match_likes
- **조회 조건**: 상호 좋아요(match_likes.status = 'ACCEPTED') 기준
- **관계 조인**: 사용자 프로필, 이미지, 선호도 정보 조합

#### S3 이미지 다운로드 (boto3)
```python
import boto3
import os
from urllib.parse import urlparse

class S3ImageDownloader:
    def __init__(self, aws_access_key, aws_secret_key, bucket_name):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key
        )
        self.bucket_name = bucket_name

    def download_profile_images(self, s3_urls, local_dir):
        """프로필 이미지 일괄 다운로드"""
        downloaded_files = []
        for url in s3_urls:
            try:
                # S3 URL에서 키 추출
                parsed_url = urlparse(url)
                s3_key = parsed_url.path.lstrip('/')

                # 로컬 파일 경로 생성
                filename = os.path.basename(s3_key)
                local_path = os.path.join(local_dir, filename)

                # 디렉터리 생성
                os.makedirs(os.path.dirname(local_path), exist_ok=True)

                # S3에서 파일 다운로드
                self.s3_client.download_file(self.bucket_name, s3_key, local_path)
                downloaded_files.append({
                    's3_url': url,
                    'local_path': local_path,
                    's3_key': s3_key
                })

            except Exception as e:
                print(f"Failed to download {url}: {e}")
                continue

        return downloaded_files
```

#### 데이터 정제
- **이미지 다운로드**: S3에서 프로필 이미지 로컬 저장
- **이미지 유효성 검사**: 다운로드된 파일 접근 가능 여부 확인
- **선호도 데이터 정규화**: 코드 기반 통일
- **MBTI 형식 검증**: 4자리 표준 형식 적용

### 5.2 데이터 증강 기능

#### 이미지 생성 (Replicate API)
- **모델**: bytedance/seedream-4
- **입력**: 원본 프로필 이미지 + 나이/성별/MBTI 정보
- **출력**: 유사한 특성의 새로운 프로필 이미지
- **파라미터**:
  ```json
  {
    "prompt": "portrait of [age]-year-old [gender] with [mbti] personality traits",
    "num_outputs": 3,
    "guidance_scale": 7.5,
    "num_inference_steps": 50
  }
  ```

#### 텍스트 데이터 생성 (LangChain)
- **모델**: GPT-4/Llama 3
- **입력**: 기존 선호도 패턴 + MBTI 조합
- **출력**: 새로운 선호도 조합
- **프롬프트 템플릿**:
  ```
  Given the user profile:
  - Age: {age}
  - Gender: {gender}
  - MBTI: {mbti}
  - Current preferences: {existing_preferences}

  Generate realistic dating preferences for this user type across these categories:
  {preference_categories}

  Ensure preferences are consistent with personality type and demographic characteristics.
  ```

### 5.3 Web UI 기능

#### 관리자 대시보드
- **데이터셋 현황**: 검증/학습 데이터셋 통계
- **진행 상황**: 데이터 증강 작업 상태 모니터링
- **품질 관리**: 생성된 데이터 품질 검수

#### 데이터 테이블 뷰
- **페이지네이션**: 1페이지당 50개 데이터
- **필터링**: 데이터셋 유형, 성별, 나이대, MBTI
- **검색**: 이름, MBTI, 선호도 키워드
- **상세 보기**: 프로필 상세 정보 및 이미지

#### 데이터 관리 기능
- **내보내기**: CSV 형식 다운로드
- **데이터 수정**: 직접 편집 기능
- **삭제**: 부적절한 데이터 제거
- **재생성**: 특정 데이터 재증강 요청

## 6. API 설계

### 6.1 Backend API (FastAPI)

#### 데이터 관리 API
```python
# 데이터셋 조회
GET /api/datasets
GET /api/datasets/{dataset_type}
GET /api/datasets/{dataset_type}/profiles

# 데이터 추출
POST /api/extract/validation
POST /api/generate/augmentation

# 이미지 생성
POST /api/generate/images
GET /api/generate/images/{task_id}/status

# CSV 내보내기
GET /api/export/{dataset_type}
POST /api/export/custom
```

#### 데이터 증강 API
```python
# LangChain 기반 텍스트 생성
POST /api/augment/text
POST /api/augment/preferences

# Replicate 기반 이미지 생성
POST /api/augment/images
GET /api/augment/images/{task_id}
```

### 6.2 Frontend API Integration

#### TanStack Query 키
```typescript
const queryKeys = {
  datasets: ['datasets'],
  validationProfiles: ['datasets', 'validation', 'profiles'],
  learningProfiles: ['datasets', 'learning', 'profiles'],
  augmentationTasks: ['augmentation', 'tasks'],
  exportTasks: ['export', 'tasks']
};
```

## 7. 3일 개발 계획 (집중 개발)

### 7.1 Day 1: 핵심 백엔드 및 데이터 추출
**오전 (4시간)**
- PostgreSQL 연동 및 데이터 조회 모듈 개발
- S3 이미지 다운로드 기능 구현 (boto3)
- 기본 데이터 모델링 및 CSV 내보내기 기능

**오후 (4시간)**
- FastAPI/LangServe 기본 프로젝트 설정
- 데이터 추출 API 엔드포인트 구현
- 상호 좋아요 데이터 기반 검증 데이터셋 생성

### 7.2 Day 2: 데이터 증강 및 기본 UI
**오전 (4시간)**
- Replicate API 연동 및 이미지 생성 기능
- LangChain 연동 및 텍스트 데이터 증강 기능
- 증강 작업 비동기 처리 구현

**오후 (4시간)**
- Next.js 15 프로젝트 기본 설정
- shadcn/ui 기본 컴포넌트 적용
- TanStack Query 설정 및 데이터 fetching 구현

### 7.3 Day 3: UI 완성 및 통합 테스트
**오전 (4시간)**
- TanStack Table 기반 데이터 테이블 뷰 구현
- Zustand 상태 관리 구현
- 관리자 대시보드 기본 기능 완성

**오후 (4시간)**
- API 통합 및 테스트
- 데이터 증강 작업 테스트
- 배포 준비 및 문서화

### 7.4 최소 기능 제품 (MVP) 범위
**필수 기능**
- ✅ PostgreSQL 데이터 조회 및 S3 이미지 다운로드
- ✅ 검증 데이터셋 (282쌍) 추출 및 CSV 내보내기
- ✅ 기본 데이터 증강 (1,000개 목표)
- ✅ Web UI 기본 기능 (테이블 뷰, 내보내기)

**선택 기능 (시간 여유 시)**
- 🔄 고급 필터링 및 검색 기능
- 🔄 데이터 품질 검수 기능
- 🔄 대시보드 통계 및 시각화

## 8. 기술적 고려사항

### 8.1 성능 최적화
- **이미지 처리**: WebP 형식, lazy loading, CDN 활용
- **데이터 로딩**: 무한 스크롤, 가상화
- **API 캐싱**: React Query 캐싱 전략
- **배치 처리**: 대용량 데이터 증강 작업 분산 처리

### 8.2 데이터 품질 관리
- **검증 규칙**: 생성 데이터 유효성 검사
- **중복 제거**: 유사 데이터 자동 필터링
- **라벨링**: 데이터 품질 점수 부여
- **피드백 루프**: 관리자 검수 및 개선 사항 반영

### 8.3 보안 및 프라이버시
- **데이터 익명화**: 개인정보 제거
- **접근 제어**: 관리자 인증 시스템
- **API 보안**: Rate limiting, 인증 토큰
- **파일 보안**: 이미지 파일 접근 제어

## 9. 3일 개발 성공 지표

### 9.1 MVP 완성 기준
- **Day 1 완료**: PostgreSQL 연동 및 S3 이미지 다운로드, 기본 API 구현
- **Day 2 완료**: 데이터 증강 기능 및 기본 UI 구현
- **Day 3 완료**: 전체 시스템 통합 및 테스트 완료

### 9.2 최소 데이터셋 규모
- **검증 데이터셋**: 282쌍 (100% 확보 및 내보내기)
- **학습 데이터셋**: 1,000개 이상 (3일 내 목표)
- **이미지 데이터**: 5,000개 이상 (평균 5개/프로필)

### 9.3 필수 기능 동작
- **데이터 추출**: 상호 좋아요 데이터 정상 조회 및 다운로드
- **이미지 처리**: S3에서 프로필 이미지 정상 다운로드
- **데이터 증강**: Replicate/LangChain 기반 데이터 생성
- **Web UI**: 테이블 뷰 및 CSV 내보내기 기능

### 9.4 시스템 안정성
- **API 동작**: 핵심 엔드포인트 정상 응답
- **데이터 무결성**: 추출된 데이터의 일관성 보장
- **기본 오류 처리**: 네트워크, API 실패 시 처리

이 요구사항 문서는 데이팅 앱 데이터 증강 및 관리 시스템의 개발 방향을 명확히 하고, 성공적인 프로젝트 완수를 위한 구체적인 가이드라인을 제공합니다.