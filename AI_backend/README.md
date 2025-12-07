# AI Backend - MemeScore AI 분석 서버

Flask 기반 API 서버로, 크리에이터의 활동 데이터를 받아 AI 기반 MemeScore 분석 결과를 반환합니다.

## ⚙️ 실행방법

### Flask API 서버 실행

```bash
# 1. Pipenv 가상환경 생성 및 의존성 설치
pipenv install

# 2. .env 파일 생성 (선택사항)
cp .env.example .env
# OPENAI_API_KEY를 설정하지 않으면 더미 응답을 사용합니다

# 3. 서버 실행
pipenv run python flask_server.py
```

서버는 기본적으로 `http://localhost:4100`에서 실행됩니다.

**API 엔드포인트:**
- `GET /health` - 서버 상태 확인
- `POST /analyze` - MemeScore 분석 (백엔드에서 호출)

**확인:**
```bash
curl http://localhost:4100/health
```

## 🧮 API 사용 예시

### POST /analyze

**Request:**
```json
{
  "likes": 180,
  "comments": 45,
  "reposts": 22,
  "quotes": 8,
  "views": 14500,
  "followers": 520,
  "tip_count": 4,
  "tip_amount": 1.2
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "🤖 AI 활동 요약 (7일)\\n\\n▪ 현재 활동 수준은 보통이며...",
  "score_breakdown": {
    "engagement_quality": 24.1,
    "virality_potential": 20.8,
    "community_strength": 21.7,
    "monetization_health": 2.8
  },
  "bot_score": 12.5
}
```

## 📝 환경 변수

**`.env` 파일 (선택사항):**
```bash
# OpenAI API Key - 없으면 더미 응답 사용
OPENAI_API_KEY=sk-proj-XXXXXX

# 사용할 모델 (기본값: gpt-4o-mini)
MEME_EXPLAINER_MODEL=gpt-4o-mini

# 서버 포트 (기본값: 4100)
AI_BACKEND_PORT=4100
```

## 🎯 주요 기능

- **MemeScore v2 계산**: 7일 활동 데이터 기반 점수 계산 (Backend와 동일한 공식 사용)
- **봇 감지**: 비정상 활동 패턴 자동 감지 (점수 0-100)
- **AI 분석**: OpenAI GPT를 통한 자연어 설명 생성
- **Graceful Fallback**: OpenAI API 없어도 더미 응답으로 작동

## 📊 MemeScore v2 공식

Backend와 동일한 점수 계산 방식을 사용합니다:

```
engagement_score = log10(1 + total_engagement) * 10
view_score = log10(1 + views) * 5
follow_score = log10(1 + followers) * 8
tip_score = log10(1 + tip_count) * 3 + log10(1 + tip_amount) * 2

meme_score = engagement_score + view_score + follow_score + tip_score
```

**Score Breakdown 매핑:**
- `engagement_quality` = engagement_score (참여도)
- `virality_potential` = view_score (확산력)
- `community_strength` = follow_score (커뮤니티)
- `monetization_health` = tip_score (수익화)

## 📂 파일 구조

```
AI_backend/
├── flask_server.py    # Flask API 서버 (메인)
├── Pipfile           # Pipenv 의존성
├── .env.example      # 환경변수 템플릿
├── .gitignore        # Git 제외 파일
└── README.md         # 이 파일
```

## 🔧 개발

### Pipenv Shell 진입
```bash
pipenv shell
python flask_server.py
```

### 의존성 추가
```bash
pipenv install <package-name>
```

### 디버그 모드
Flask 서버는 기본적으로 debug=True로 실행됩니다.

## 📚 더 많은 정보

프로젝트 루트의 문서를 참고하세요:
- `START_HERE.md` - 빠른 시작 가이드
- `SETUP_AI_INTEGRATION.md` - 상세 통합 가이드
