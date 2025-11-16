# Task Log Viewer

실시간 데이터 추출 및 증강 작업의 로그를 확인할 수 있는 Drawer 형태의 로그 뷰어 컴포넌트입니다.

## 기능

### 🔍 실시간 로그 모니터링
- 2초 간격 자동 업데이트
- 실행 중인 작업이 있을 때만 폴링
- 최신 로그 자동 스크롤 기능

### 📊 다양한 로그 레벨 지원
- **DEBUG**: 상세 디버깅 정보
- **INFO**: 일반 정보 메시지
- **WARNING**: 경고 메시지
- **ERROR**: 에러 발생 정보
- **SUCCESS**: 성공 완료 메시지

### 🔎 강력한 검색 및 필터링
- 텍스트 검색 기능
- 로그 레벨별 필터링
- 페이지네이션 지원
- 실시간 필터 적용

### 📋 상세 로그 정보
- 타임스탬프 (밀리초 정밀도)
- 진행률 표시
- 작업 단계 정보
- 실행 시간 (duration_ms)
- 상세 JSON 데이터 펼쳐보기

## 사용법

### 1. 로그 뷰어 열기
```typescript
// TaskProgressBar 컴포넌트에서 'Logs' 버튼 클릭
<TaskProgressBar taskId="abc-123-def" />
```

### 2. 필터링 사용
```typescript
// 로그 레벨 필터링
const [selectedLevel, setSelectedLevel] = useState<LogLevel>('ERROR');

// 텍스트 검색
const [searchTerm, setSearchTerm] = useState('database');
```

### 3. 자동 스크롤 제어
```typescript
// 우측 상단 Auto-scroll 버튼으로 켜고 끄기
const { autoScroll, toggleAutoScroll } = useLogViewerPreferences();
```

## UI 컴포넌트 구조

```
TaskLogViewer
├── Header (태스크 정보 + 닫기 버튼)
├── Filters (검색 + 레벨 필터 + 새로고침)
├── Log List
│   ├── Log Entry Header (타임스탬프, 레벨, 단계)
│   ├── Message (주요 메시지 내용)
│   └── Details (상세 정보 - 펼쳐보기)
└── Pagination (이전/다음 페이지)
```

## 로그 엔트리 구조

```typescript
interface TaskLogEntry {
  id: string;           // 고유 로그 ID
  task_id: string;      // 태스크 ID
  timestamp: string;    // 생성 시간 (ISO 8601)
  level: LogLevel;      // 로그 레벨
  message: string;      // 메인 메시지
  step?: string;        // 현재 작업 단계
  details?: object;     // 상세 데이터 (JSON)
  duration_ms?: number; // 실행 시간 (밀리초)
  progress?: number;     // 진행률 (0-100)
}
```

## 색상 및 아이콘

| 레벨 | 색상 | 아이콘 | 배경색 |
|------|--------|--------|----------|
| DEBUG | 회색 | Bug | 회색 |
| INFO | 파란색 | Info | 파란색 |
| WARNING | 노란색 | AlertTriangle | 노란색 |
| ERROR | 빨간색 | X | 빨간색 |
| SUCCESS | 초록색 | CheckCircle | 초록색 |

## API 연동

### 로그 조회 엔드포인트
```bash
# 추출 태스크 로그
GET /api/extract/validation/{task_id}/logs

# 증강 태스크 로그
GET /api/generate/augmentation/{task_id}/logs
```

### 쿼리 파라미터
- `page`: 페이지 번호 (기본: 1)
- `page_size`: 페이지 크기 (기본: 100)
- `level`: 로그 레벨 필터
- `search`: 텍스트 검색어

## 성능 최적화

### 1. 로컬 캐싱
- Zustand 스토어에 로그 캐시
- 중복 로그 자동 제거
- 페이지별 메모리 관리

### 2. 스마트 폴링
- 활성 태스크에만 2초 폴링
- 완료된 태스크는 폴링 중단
- 최근 로그 기반 활성 상태 판단

### 3. 가상 스크롤 (향후 개선)
- 대용량 로그 처리
- 메모리 효율성 개선
- 부드러운 스크롤 경험

## 사용자 경험

### 🎯 직관적인 디자인
- 로그 레벨별 색상 구분
- 명확한 타임스탬프 표시
- 펼쳐보기/접기 상호작용

### ⚡ 빠른 성능
- 50개 로그씩 페이지네이션
- 비동기 로딩 처리
- 로컬 캐시 활용

### 🔧 편리한 기능
- 즐겨찾는 필터 조합
- 로그 내용 클립보드 복사
- 전체 로그 내보내기 (개발 예정)

## 트러블슈팅

### 로그가 표시되지 않을 때
1. API 엔드포인트 확인
2. 네트워크 연결 상태 확인
3. 태스크 ID 유효성 확인

### 성능이 느릴 때
1. 페이지 크기 줄이기
2. 필터링으로 로그 양 줄이기
3. 자동 스크롤 끄기

### 로그가 중복될 때
- 자동 중복 제거 기능 확인
- 캐시 클리어: `clearTaskLogs(taskId)`