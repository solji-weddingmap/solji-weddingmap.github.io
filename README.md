# WEDDING MAP

수도권 웨딩홀을 한눈에, 나에게 맞는 웨딩홀을 쉽게 찾는 지도 서비스입니다.

"네이버 지도처럼 웨딩홀을 찾고, 웨딩 플랫폼처럼 웨딩홀 정보를 비교하는 서비스"를 목표로 합니다.

---

## Features

- Kakao Map (수도권 지도, 마커 클러스터링, 커스텀 오버레이)
- Wedding Hall Search (웨딩홀명 / 주소 / 지역 검색)
- Address Search (카카오 주소 검색 → 좌표 자동 변환, 지도에서 위치 직접 조정)
- Wedding Hall Registration / Edit / Delete
- Wedding Hall Database (Supabase PostgreSQL)
- Region Filter (서울 / 경기 / 인천 + 세부 지역)
- Meal Price Filter / Rental Fee Filter / Minimum Guest Filter / Ceremony Type Filter
- Sort (추천순 / 식대 낮은순 / 대관료 낮은순 / 최소보증인원 낮은순 / 최신 등록순)
- Favorites (LocalStorage 기반, 추후 로그인 연동 구조로 분리됨)
- List ↔ Map 실시간 연동
- Responsive Design (PC: 리스트+지도, 모바일: 지도+바텀시트)
- Admin table view (웨딩홀 관리)

> 참고: 주차 정보는 상세 화면에서만 표시되며, 필터/정렬 조건으로는 사용하지 않습니다.

---

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Lucide React (아이콘)
- Kakao Maps JavaScript API
- Supabase (PostgreSQL + Storage)
- GitHub Actions + GitHub Pages

---

## 프로젝트 구조

```text
wedding-map/
├── .github/workflows/deploy.yml   # GitHub Actions 자동 배포
├── src/
│   ├── components/                # Header, SearchBar, Filter, WeddingCard,
│   │                               # WeddingList, KakaoMap, WeddingDetail,
│   │                               # WeddingForm, Favorite, Admin 등
│   ├── pages/                     # Home, WeddingRegister, Admin
│   ├── hooks/                     # useWeddingHalls, useFavorites, useKakaoLoader
│   ├── services/                  # weddingHallService, favoriteService, storageService
│   ├── lib/                       # supabase.ts, kakao.ts (SDK 로더 / 지오코딩)
│   ├── types/                     # WeddingHall 등 도메인 타입
│   ├── data/                      # mockWeddingHalls.ts (샘플 데이터, 20개+)
│   └── utils/                     # 포맷터, 필터/정렬 로직, 에러 타입
├── supabase/
│   ├── schema.sql                 # 테이블 + RLS 정책 + Storage 버킷
│   └── seed.sql                   # (선택) 샘플 데이터 삽입
├── .env.example
└── vite.config.ts                 # GitHub Pages base 경로 설정
```

---

## Local Development

```bash
npm install
npm run dev
```

Kakao API Key와 Supabase 설정이 없어도 **Mock 데이터**로 전체 UI/필터/등록/수정/삭제 흐름을 테스트할 수 있습니다
(등록/수정/삭제는 새로고침 시 초기화됩니다 - Supabase 연결 후 영구 저장됩니다).

---

## Environment Variables

`.env.example`을 복사해 `.env`를 만들고 값을 채워주세요.

```bash
cp .env.example .env
```

```env
VITE_KAKAO_MAP_KEY=YOUR_KAKAO_JAVASCRIPT_KEY
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

`.env`는 `.gitignore`에 포함되어 있어 GitHub에 절대 커밋되지 않습니다.

⚠️ **Supabase Service Role Key는 절대 프론트엔드(.env, 코드, GitHub Actions 빌드)에 넣지 마세요.**
프론트엔드에는 항상 `anon` (public) key만 사용합니다.

---

## Supabase Setup

1. https://supabase.com 에서 새 프로젝트를 생성합니다.
2. Project Settings → API 에서 **Project URL**과 **anon public key**를 복사해 `.env`에 입력합니다.
3. SQL Editor를 열고 [`supabase/schema.sql`](./supabase/schema.sql) 내용을 실행합니다.
   - `wedding_halls` 테이블, RLS 정책, `wedding-halls` Storage 버킷이 함께 생성됩니다.
4. (선택) 샘플 데이터를 채우고 싶다면 [`supabase/seed.sql`](./supabase/seed.sql)도 실행합니다.
5. `.env`에 값을 채운 뒤 `npm run dev`를 재시작하면 앱이 Mock 데이터 대신 Supabase 데이터를 사용합니다.

### 이미지 업로드

- 웨딩홀 등록/수정 화면에서 이미지를 업로드하면 Supabase Storage의 `wedding-halls` 버킷에 저장되고,
  공개 URL이 `main_image` / `images` 컬럼에 저장됩니다.
- Supabase가 연결되지 않은 상태에서는 브라우저 임시 미리보기 URL을 사용합니다 (새로고침 시 사라짐).

---

## Kakao Maps Setup

1. https://developers.kakao.com 에서 애플리케이션을 생성합니다.
2. **내 애플리케이션 → 앱 키**에서 **JavaScript 키**를 복사합니다. (REST API 키가 아닙니다!)
3. `.env`의 `VITE_KAKAO_MAP_KEY`에 입력합니다.
4. **내 애플리케이션 → 플랫폼 → Web → 사이트 도메인**에 사용 중인 도메인을 등록합니다.
   - 로컬 개발: `http://localhost:5173`
   - 배포 후: `https://<GitHub-사용자명>.github.io` (경로 없이 origin만 등록)
   - 커스텀 도메인을 쓴다면 해당 도메인도 함께 등록합니다.

Kakao API Key가 없어도 앱은 정상적으로 실행되며, 지도 영역에는 안내 메시지가 표시되고 나머지 기능(목록/필터/검색 등)은
정상 작동합니다.

---

## GitHub Pages Deployment

이 프로젝트는 GitHub Pages의 **GitHub Actions 배포 방식**을 기준으로 구성되어 있습니다.

```text
로컬 개발 → GitHub Repository → GitHub Actions → Build → GitHub Pages → 실제 웹사이트
```

### 1. Repository 이름에 맞게 base 경로 수정

GitHub Pages 프로젝트 사이트는 `https://<사용자명>.github.io/<저장소이름>/` 형태로 배포됩니다.
저장소 이름을 `wedding-map`이 아닌 다른 이름으로 만들었다면 [`vite.config.ts`](./vite.config.ts)의
`REPO_NAME` 값을 실제 저장소 이름으로 바꿔주세요.

```ts
const REPO_NAME = '실제-저장소-이름'
```

(User/Organization 사이트로 배포하거나 커스텀 도메인을 쓴다면 `REPO_NAME = ''`로 설정하세요.)

### 2. 라우팅 문제 방지

이 프로젝트는 `HashRouter`를 사용합니다 (`src/main.tsx`). GitHub Pages는 정적 호스팅이라
`BrowserRouter`를 쓰면 새로고침 시 404가 발생할 수 있는데, `HashRouter`는 항상 `index.html`을 먼저
로드하므로 새로고침/직접 접근 시에도 문제가 없습니다.

### 3. Repository Secrets 등록

GitHub 저장소 → **Settings → Secrets and variables → Actions → New repository secret**에서 아래 3개를 등록합니다.

| Name | Value |
|---|---|
| `VITE_KAKAO_MAP_KEY` | Kakao JavaScript 키 |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

(Service Role Key는 절대 등록하지 마세요.)

### 4. GitHub Pages 활성화

**Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택합니다.

### 5. 배포

`main` 브랜치에 push하면 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)이 자동으로

```text
Checkout → Node 설치 → npm ci → npm run build → Pages Artifact 업로드 → Pages 배포
```

를 실행합니다. Actions 탭에서 진행 상황을 확인할 수 있고, 완료되면
`https://<사용자명>.github.io/<저장소이름>/`에서 사이트를 확인할 수 있습니다.

---

## GitHub Repository 생성부터 배포까지 (처음이신 경우)

1. GitHub에서 새 Repository 생성 (예: `wedding-map`)
2. 이 프로젝트 코드를 다운로드/압축 해제
3. `npm install`
4. `.env` 생성 (`.env.example` 복사)
5. Kakao Maps API Key 입력
6. Supabase URL / anon key 입력
7. `npm run dev`로 로컬 확인
8. 아래 명령어로 GitHub에 push:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<사용자명>/<저장소이름>.git
   git push -u origin main
   ```

9. GitHub 저장소 → Settings → Pages
10. Source → **GitHub Actions** 선택
11. Settings → Secrets and variables → Actions에서 위 3개 환경변수 등록
12. `main`에 다시 push하거나 Actions 탭에서 워크플로우를 재실행 → 자동 배포 확인

---

## Future Features

- 관리자 로그인
- 웨딩홀 업체 계정
- 리뷰
- 웨딩홀 비교
- 찜 목록 (Supabase 기반으로 전환)
- 예산 계산
- 예식 날짜 기반 추천
- 사용자 리뷰
