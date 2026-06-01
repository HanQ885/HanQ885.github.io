# 교실에도 명당이 있을까?

좌석 위치와 수업 집중도에 관한 학생 통계대회용 설문 웹앱입니다. HTML, CSS, Vanilla JavaScript만 사용하며 GitHub Pages에서 실행됩니다. 응답 데이터와 개인정보는 GitHub 저장소나 브라우저 저장소에 저장하지 않고, Google Apps Script Web App을 통해 Google Sheets에만 전송합니다.

## 파일 구조

```text
/
  index.html
  styles.css
  script.js
  README.md
  config.example.js
  apps-script/
    Code.gs
```

## 1. Google Sheet 만들기

1. Google Drive에서 새 Google 스프레드시트를 만듭니다.
2. 파일 이름을 정합니다. 예: 교실 좌석 설문 응답
3. Apps Script가 responses 시트와 첫 행 헤더를 자동으로 만듭니다.

## 2. Apps Script 만들기

1. Google Sheet에서 확장 프로그램 > Apps Script를 엽니다.
2. 기본 Code.gs 내용을 모두 지웁니다.
3. 이 저장소의 apps-script/Code.gs 내용을 그대로 붙여넣습니다.
4. 저장합니다.

## 3. Web App으로 배포하기

1. Apps Script에서 배포 > 새 배포를 누릅니다.
2. 유형은 웹 앱을 선택합니다.
3. Execute as는 Me로 설정합니다.
4. Who has access는 Anyone 또는 Anyone with the link로 설정합니다.
5. 배포하고 권한 승인을 완료합니다.
6. Web App URL을 복사합니다.

## 4. SCRIPT_URL 설정하기

1. config.example.js를 복사해 config.js를 만듭니다.
2. config.js 안에 Web App URL을 넣습니다.

```js
const SCRIPT_URL = 'https://script.google.com/macros/s/여기에_배포_ID/exec';
```

config.js에는 비밀번호, API key, private token을 넣지 마세요. Web App URL만 넣으면 됩니다.

## 5. GitHub Pages 켜기

1. GitHub 저장소 Settings > Pages로 이동합니다.
2. Source는 Deploy from a branch로 둡니다.
3. Branch는 main, 폴더는 root로 설정합니다.
4. 저장 후 Pages 주소를 엽니다.

## 6. 모바일에서 테스트하기

1. GitHub Pages 주소를 휴대폰으로 엽니다.
2. 개인정보 동의, 기본 정보, 좌석 선택, 집중도 선택, 제출 전 확인까지 진행합니다.
3. TOP 3 문항은 3개 미만일 때 다음 단계로 넘어가지 않는지 확인합니다.
4. 같은 좌석을 다시 누르면 선택 해제되고 순위가 재정렬되는지 확인합니다.
5. 3개 선택 후 다른 좌석을 누르면 최대 3개 안내가 나오는지 확인합니다.
6. 제출 후 Google Sheet의 responses 시트에 행이 추가되는지 확인합니다.

## 7. Google Sheets 컬럼 순서

```text
timestamp_server
submitted_at_client
privacy_consent
affiliation
name
grade
phone
phone_normalized
normal_prefer_1
normal_prefer_2
normal_prefer_3
normal_avoid_1
normal_avoid_2
normal_avoid_3
group_prefer_1
group_prefer_2
group_prefer_3
group_avoid_1
group_avoid_2
group_avoid_3
focus_score
user_agent
submission_id
```

## 8. 중복 응답 확인 방식

프론트엔드는 전화번호에서 숫자만 남긴 phoneNormalized 값을 함께 보냅니다. Apps Script도 다시 숫자만 남겨 정규화한 뒤 responses 시트의 phone_normalized 컬럼에서 같은 값이 있는지 확인합니다.

같은 전화번호가 이미 있으면 새 행을 추가하지 않고 duplicate true를 반환합니다. 프론트엔드는 이미 제출된 전화번호입니다. 중복 응답은 제출할 수 없습니다. 라고 표시합니다.

Google Apps Script Web App 환경에 따라 CORS 응답을 읽기 어려운 경우가 있습니다. Web App URL이 최신 /exec 주소인지, 접근 권한이 Anyone인지, Apps Script 실행 로그와 Google Sheet 행 추가 여부를 함께 확인하세요.

## 9. 개인정보 관리 주의사항

이 설문은 이름, 학년, 소속, 전화번호를 수집합니다. 개인정보는 대회 연구, 중복 응답 확인, 상품 지급 및 연락 목적으로만 사용해야 합니다.

Google Sheets 공유 권한은 반드시 제한하세요. 링크가 있는 모든 사람이 볼 수 있게 공유하지 말고 담당자 계정에만 접근 권한을 부여하세요.

GitHub 저장소에는 응답 데이터나 개인정보가 저장되지 않습니다. 코드도 localStorage나 sessionStorage에 응답 내용을 저장하지 않습니다.

설문이 종료되고 대회 종료 및 결과 발표가 끝나면 Google Sheets에서 개인정보 컬럼 또는 전체 응답 시트를 삭제해 파기하세요. 필요한 통계 분석 결과만 익명화해 따로 보관하는 방식이 안전합니다.
