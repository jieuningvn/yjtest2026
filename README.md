# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

## 🛠️ HTTPS 개발 서버 구동 및 모바일 마이크 테스트 방법

모바일 기기에서 마이크(`getUserMedia`)에 접근하기 위해서는 보안 콘텍스트(Secure Context, 즉 `HTTPS` 혹은 `localhost`)가 필수적입니다. 로컬 네트워크상에서 모바일 기기로 테스트할 수 있도록 HTTPS 개발 서버가 설정되어 있습니다.

### 1. HTTPS 개발 서버 실행
다음 명령어로 개발 서버를 실행합니다:
```bash
npm run dev:https
```
이 명령어는 `0.0.0.0` 호스트로 모든 네트워크 인터페이스를 수신 대기시키며, 자체 서명된 인증서(`@vitejs/plugin-basic-ssl`)를 활용하여 HTTPS 서버를 실행합니다.

### 2. 모바일 기기로 접속
1. 개발용 데스크톱/노트북과 테스트용 모바일 기기가 **동일한 Wi-Fi(로컬 네트워크)**에 연결되어 있어야 합니다.
2. 터미널 출력 창에 표시되는 로컬 IP 주소(Network)를 통해 모바일 브라우저로 접속합니다.
   * *예시 접속 주소*: `https://192.168.0.12:5173`
   * **⚠️ 중요**: 프로토콜이 반드시 `https://`로 시작해야 마이크 기능이 차단되지 않습니다.

### 3. 모바일 브라우저 보안 경고 해결 방법
자체 서명된 임시 인증서를 사용하므로 모바일 크롬이나 삼성 인터넷에서 `"연결이 비공개로 설정되어 있지 않습니다"`와 같은 보안 경고가 나타납니다.
* **해결법**: 화면 하단의 **[고급]** 또는 **[상세 정보 보기]**를 탭한 후, **`192.168.x.x(으)로 계속 진행(안전하지 않음)`** 링크를 눌러 접속하시면 정상적으로 마이크 접근 권한을 획득할 수 있습니다.
