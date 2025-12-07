# MemeGaging 🎯

> **Memekathon Seoul 2025 Hackathon Product**  
> 밈 크리에이터 활동 점수화 및 후원 플랫폼

MemeGaging은 소셜 미디어(MemeX) 활동 데이터와 블록체인 후원 데이터를 결합하여 크리에이터의 영향력을 정량화하고, 팬들이 직접 후원할 수 있는 Web3 플랫폼입니다.

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [시스템 아키텍처](#-시스템-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [핵심 기능](#-핵심-기능)
- [시작하기](#-시작하기)
- [API 엔드포인트](#-api-엔드포인트)
- [스마트 컨트랙트](#-스마트-컨트랙트)
- [기술 스택](#-기술-스택)

---

## 🎯 프로젝트 개요

### 핵심 가치

1. **크리에이터 평가 시스템**: 소셜 미디어 활동 + 후원 데이터를 기반으로 한 공정한 점수화
2. **투명한 후원**: 블록체인 기반 후원으로 모든 거래 기록이 투명하게 공개
3. **AI 기반 분석**: OpenAI를 활용한 크리에이터 활동 인사이트 제공

### 주요 사용 시나리오

- 📊 **크리에이터**: 자신의 영향력을 객관적으로 확인하고 성장 방향 파악
- 💰 **팬/후원자**: 좋아하는 크리에이터에게 암호화폐로 직접 후원
- 🏆 **리더보드**: 상위 크리에이터 순위를 통해 트렌디한 인플루언서 발견

---

## 🏗 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                      │
│  - 리더보드 / 크리에이터 상세 / 대시보드                                 │
│  - Wagmi/Viem (Web3 지갑 연결 및 트랜잭션)                            │
└────────────┬────────────────────────────────────┬────────────────┘
             │                                    │
             │ REST API                           │ RPC Call
             ↓                                    ↓
┌────────────────────────┐           ┌─────────────────────────────┐
│  Backend (Express.js)  │           │  Smart Contract (Solidity)  │
│  - Creator Management  │           │   MemeTipLoggerV2.sol       │
│  - Scoring Service     │←──────────┤  - 후원 이벤트 로깅             │
│  - Tip Notification    │  Event    │  - 크리에이터별 누적 통계         │
│  - Dashboard API       │  Indexing │  - Pausable/Ownable         │
└──────┬─────────────┬───┘           └─────────────────────────────┘
       │             │                         ↑
       │             │                         │
       ↓             ↓                         │ Tip TX
┌──────────────┐  ┌──────────────────┐         │
│  PostgreSQL  │  │  AI Backend      │         │
│  (Prisma)    │  │  (Flask/OpenAI)  │   ┌────────────┐
│              │  │  - MemeScore     │   │   User     │
│  - creator   │  │    계산 및 분석     │   │  (Wallet)  │
│  - tip       │  │  - 봇 점수 감지     │   └────────────┘
│  - score     │  │  - AI 코멘터리      │
└──────────────┘  └──────────────────┘
       ↑
       │ External API Call
       ↓
┌──────────────────┐
│  MemeX API       │
│  - User Profile  │
│  - Social Stats  │
└──────────────────┘
```

### 데이터 흐름

1. **후원 프로세스**
   ```
   User → Smart Contract (tipWithNative) → Event Emission
     ↓
   Backend (event indexing) → DB 저장 → MemeScore 재계산
     ↓
   AI Backend 호출 → AI 분석 결과 반환
     ↓
   Frontend 업데이트
   ```

2. **점수 계산 프로세스**
   ```
   Backend → MemeX API (소셜 통계) + DB (후원 통계)
     ↓
   Scoring Service (calcMemeScoreV2)
     ↓
   Score DB 저장 + Creator.meme_score 업데이트
     ↓
   AI Backend 호출 (선택적) → 분석 리포트 생성
   ```

---

## 📁 프로젝트 구조

```
MemeGaging/
├── app/                        # Frontend (Next.js 16 + React 19)
│   ├── src/
│   │   ├── app/               # App Router
│   │   │   ├── page.tsx       # 리더보드 (메인)
│   │   │   ├── dashboard/     # 내 대시보드
│   │   │   └── creator/[id]/  # 크리에이터 상세
│   │   ├── components/        # UI 컴포넌트
│   │   ├── contexts/          # React Context
│   │   ├── hooks/             # Custom Hooks
│   │   └── lib/
│   │       ├── api.ts         # Backend API 클라이언트
│   │       └── type.ts        # 타입 정의
│   └── package.json
│
├── backend/                    # Backend API (Express + Prisma)
│   ├── src/
│   │   ├── index.ts           # Express 앱 진입점
│   │   ├── routes/            # API 라우트
│   │   │   ├── creator.ts     # 크리에이터 조회/검색/랭킹
│   │   │   ├── dashboard.ts   # 대시보드 (내 후원 통계)
│   │   │   ├── tip.ts         # 후원 알림 처리
│   │   │   ├── score.ts       # 점수 이력 조회
│   │   │   └── wallet.ts      # 지갑 연결
│   │   ├── services/
│   │   │   ├── scoringService.ts      # MemeScore 계산 로직
│   │   │   └── aiAnalysisService.ts   # AI 분석 호출
│   │   ├── clients/
│   │   │   ├── memexClient.ts         # MemeX API 클라이언트
│   │   │   └── aiBackendClient.ts     # AI Backend 클라이언트
│   │   └── utils/
│   │       └── conversion.ts          # Wei ↔ ETH 변환
│   ├── prisma/
│   │   └── schema.prisma      # DB 스키마 (creator, tip, score)
│   └── package.json
│
├── AI_backend/                 # AI Analysis Server (Flask + OpenAI)
│   ├── flask_server.py         # Flask API 서버
│   │   └── POST /analyze       # MemeScore 분석 및 AI 코멘터리
│   ├── Pipfile                 # Python 의존성
│   └── .env.example
│
├── contract/                   # Smart Contract (Solidity + Foundry)
│   ├── src/
│   │   └── MemeTipLoggerV2.sol # 후원 컨트랙트
│   ├── script/
│   │   └── DeployMemeTipLoggerV2.s.sol
│   ├── test/
│   │   └── MemeTipLoggerV2.t.sol
│   └── foundry.toml
│
└── docker-compose-local.yaml   # PostgreSQL 로컬 개발 환경
```

---

## 💡 핵심 기능

### 1. 리더보드 (Leaderboard)

- MemeScore 기준 상위 크리에이터 랭킹
- 실시간 검색 (display_name 필터링)
- 크리에이터 카드: 프로필, 점수, 후원 통계

**API**: `GET /creators/ranking/top?limit=20&search=keyword`

### 2. 크리에이터 상세 페이지

- 소셜 미디어 프로필 (MemeX 연동)
- MemeScore 분해 (Engagement, Virality, Community, Monetization)
- AI 분석 리포트 (활동 평가, 봇 점수)

**API**: `GET /creators/:id`

### 3. 내 대시보드

- 내 MemeScore 및 통계
- 내가 후원한 크리에이터 목록
- 총 후원 금액 및 횟수

**API**: `GET /dashboard/:address`

### 4. 후원 기능 (Tipping)

- 지갑 연결 (Wagmi + Viem)
- 스마트 컨트랙트를 통한 후원
- 후원 완료 후 자동 점수 재계산

**Flow**:
```typescript
// Frontend
tipWithNative(toAddress, memexUserName, memexUserNameTag, amount)
  ↓
// Smart Contract Event
TippedWithNative(from, to, amount, memexUserName, memexUserNameTag, ...)
  ↓
// Backend
POST /tips/notify → recomputeMemeScoreForCreator()
```

### 5. AI 분석

- OpenAI GPT-4를 활용한 자연어 분석
- 봇 감지 점수 (0-100)
- 점수별 인사이트 및 개선 제안

**API**: `POST /analyze` (AI Backend)

---

### Score Breakdown 매핑

| 항목 | 의미 | 가중치 |
|------|------|--------|
| `engagement_quality` | 좋아요, 댓글, 리포스트, 인용 | 10 |
| `virality_potential` | 조회수 | 5 |
| `community_strength` | 팔로워 수 | 8 |
| `monetization_health` | 후원 횟수 + 금액 | 3+2 |

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- Python 3.10+
- PostgreSQL 15+
- Foundry (Solidity 개발)

### 1. PostgreSQL 실행

```bash
docker-compose -f docker-compose-local.yaml up -d
```

### 2. Backend 실행

```bash
cd backend

# 의존성 설치
npm install

# Prisma 클라이언트 생성
npm run prisma:generate

# DB 마이그레이션
npm run prisma:migrate

# 개발 서버 실행 (http://localhost:4000)
npm run dev
```

**환경 변수** (`.env`):
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/memegaging?schema=public"
MEMEX_BASE_URL="https://memex-api-url"
AI_BACKEND_URL="http://localhost:4100"
PORT=4000
```

### 3. AI Backend 실행

```bash
cd AI_backend

# Pipenv 가상환경 생성 및 의존성 설치
pipenv install

# 환경 변수 설정 (선택)
cp .env.example .env
# OPENAI_API_KEY 설정 (없으면 더미 응답 사용)

# 서버 실행 (http://localhost:4100)
pipenv run python flask_server.py
```

### 4. Frontend 실행

```bash
cd app

# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:3000)
pnpm dev
```

**환경 변수** (`.env.local`):
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### 5. Smart Contract 배포 (Foundry)

```bash
cd contract

# 컴파일
forge build

# 테스트
forge test

# 배포 (예: Sepolia testnet)
forge script script/DeployMemeTipLoggerV2.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast
```

---

## 🔌 API 엔드포인트

### Backend API (Port 4000)

#### 크리에이터

- `GET /creators/search?q=keyword` - 크리에이터 검색
- `GET /creators/:id` - 크리에이터 상세 정보
- `GET /creators/from-address/:address` - 지갑 주소로 크리에이터 조회
- `GET /creators/ranking/top?limit=20&search=` - 리더보드

#### 대시보드

- `GET /dashboard/:address` - 내 대시보드 (후원 통계)

#### 후원

- `POST /tips/notify` - 후원 완료 알림
  ```json
  {
    "to_creator_id": 1,
    "from_creator_id": 2,
    "token_address": "0x...",
    "amount": "1000000000000000000",
    "tx_hash": "0x..."
  }
  ```

#### 점수

- `GET /scores/creator/:creatorId?limit=10` - 크리에이터 점수 이력

#### 지갑

- `POST /wallet/connect` - 지갑 연결
  ```json
  {
    "wallet_address": "0x..."
  }
  ```

### AI Backend API (Port 4100)

- `GET /health` - 서버 상태 확인
- `POST /analyze` - MemeScore 분석
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

---

## 🔐 스마트 컨트랙트

### MemeTipLoggerV2.sol

블록체인에서 후원 거래를 처리하고 통계를 기록하는 컨트랙트입니다.

#### 주요 기능

1. **tipWithNative**: 네이티브 토큰(M(ETH))으로 후원
   ```solidity
   function tipWithNative(
       address payable to,
       string calldata memexUserName,
       string calldata memexUserNameTag
   ) external payable
   ```

2. **이벤트 로깅**
   ```solidity
   event TippedWithNative(
       address indexed from,
       address indexed to,
       uint256 amount,
       string memexUserName,
       string memexUserNameTag,
       uint256 totalByCreator,
       uint256 totalByNative
   );
   ```

3. **통계 추적**
   - `totalTipsByCreator[bytes32]`: 크리에이터별 누적 후원액
   - `totalTipsByNative`: 전체 후원 총액

#### 보안 기능

- `ReentrancyGuard`: 재진입 공격 방지
- `Pausable`: 긴급 정지 기능
- `Ownable`: 관리자 권한 관리
- `withdraw`: 관리자 출금 (수수료 수집용)

#### 배포된 네트워크

- **Insectarium Testnet**: [Contract Address]
  - 체인 ID: 43522
  - 배포 기록: `contract/broadcast/DeployMemeTipLoggerV2.s.sol/43522/`

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Web3**: Wagmi 3, Viem 2
- **State**: TanStack Query (React Query)
- **Language**: TypeScript 5

### Backend
- **Runtime**: Node.js + Express 5
- **ORM**: Prisma 7 (PostgreSQL)
- **Language**: TypeScript 5
- **External APIs**: 
  - MemeX API (소셜 데이터)
  - AI Backend (분석 데이터)

### AI Backend
- **Framework**: Flask (Python)
- **AI**: OpenAI GPT-4 API
- **Math**: NumPy (점수 계산)
- **Language**: Python 3.9+

### Smart Contract
- **Language**: Solidity 0.8.23
- **Framework**: Foundry
- **Libraries**: 
  - OpenZeppelin (ReentrancyGuard, Ownable, Pausable)
  - Solady (LibString)

### Database
- **Primary**: PostgreSQL 15
- **Containerization**: Docker Compose

### DevOps
- **Version Control**: Git
- **Package Manager**: pnpm (Frontend), npm (Backend), pipenv (Python)

---

## 📈 향후 개선 방향

- [ ] 실시간 이벤트 인덱싱 (The Graph 또는 Moralis)
- [ ] 다중 체인 지원 (Ethereum, Polygon, Base 등)
- [ ] ERC20 토큰 후원 지원
- [ ] 크리에이터 전용 대시보드 (수익 분석)
- [ ] 배지/업적 시스템
- [ ] 소셜 로그인 통합

---

## 📄 라이선스

MIT License

---

## 👥 팀

**Memekathon Seoul 2025** - SLAB Team (MemeGaging)

---

## 🔗 링크

- [MemeX Platform](https://memex.com)
- [Foundry Book](https://book.getfoundry.sh/)

---

**Built with ❤️ for the Meme Community**
