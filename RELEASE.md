# 릴리즈 가이드

## 사전 준비

```bash
eas login
```

---

## iOS (TestFlight → App Store)

```bash
# 빌드 + TestFlight 자동 제출 (추천)
eas build --platform ios --profile production --auto-submit

# 빌드만 (제출은 나중에)
eas build --platform ios --profile production

# 최신 빌드를 TestFlight에 제출
eas submit --platform ios --latest
```

---

## Android (Play Console)

```bash
# 빌드 (AAB 생성) → EAS 대시보드에서 다운로드 → Play Console 수동 업로드
eas build --platform android --profile production
```

빌드 완료 후 AAB 다운로드:
https://expo.dev/accounts/pndsoftware/projects/jeonju-festa/builds

---

## 양쪽 동시 빌드

```bash
eas build --platform all --profile production
```

---

## OTA 업데이트 (심사 없이 즉시 배포)

JS/TS 코드, 이미지, 스타일, 스플래시 MP4 등 네이티브가 아닌 변경사항은 심사 없이 배포 가능.

```bash
eas update --branch production --message "변경 내용 설명"
```

| 변경 유형 | 방법 | 심사 |
|---|---|---|
| JS/TS 코드, 이미지, 스타일, MP4 | `eas update` | 없음 (즉시) |
| 네이티브 (새 라이브러리, 권한, app.json) | `eas build` → 스토어 제출 | 필요 |

---

## 버전 관리

| 항목 | 파일 | 변경 시점 |
|---|---|---|
| version (릴리즈 버전) | `app.json` → `"version"` | 기능 추가/변경 시 수동 |
| versionCode (Android) | `app.json` → `"android.versionCode"` | 매 릴리즈 수동 증가 |
| buildNumber (iOS) | 자동 | `autoIncrement: true`로 자동 증가 |

### 릴리즈 버전 올리는 법

`app.json`에서 수정:
```json
{
  "expo": {
    "version": "3.1.0",
    "android": {
      "versionCode": 1117
    }
  }
}
```

---

## 빌드 상태 확인

```bash
eas build:list
```

웹: https://expo.dev/accounts/pndsoftware/projects/jeonju-festa/builds

---

## 프로젝트 정보

| 항목 | 값 |
|---|---|
| Android 패키지명 | `com.jeonju.fest` |
| iOS Bundle ID | `com.jeonju.fest` |
| iOS Team ID | `5N6H6PNW9A` |
| ASC App ID | `1564049929` |
| Expo 프로젝트 | `@pndsoftware/jeonju-festa` |
| EAS Project ID | `022a4cfb-1864-47eb-b276-c9bf525ad7cf` |
