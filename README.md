# 무한던전

Turn-based HTML5 RPG prototype

설명
- 게임 이름: 무한던전
- 장르: 턴 기반 RPG (모바일용, HTML5)
- 클라이언트: Phaser 3 + TypeScript
- 서버: Java (Spring Boot) - WebSocket으로 턴/룸 통신

목표
- 초기 MVP: 플레이어 생성, 간단한 턴 전투(공격/스킬), 서버와 WebSocket 연결 샘플

실행 방법 (개발용)

1) 클라이언트

cd client
npm install
npm run dev

브라우저로 http://localhost:5173 접속(기본 Vite 포트)

2) 서버

cd server
./mvnw spring-boot:run

서버가 8080 포트에서 실행됩니다. (WebSocket 엔드포인트: /ws/game)

향후 작업
- 턴 관리 로직(서버 사이드)을 확장
- 플레이어 인증 및 저장(DB)
- 모바일 최적화 및 PWA 래핑
