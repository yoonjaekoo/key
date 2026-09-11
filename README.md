# ADOFAI Key Viewer

ChromeOS에서 다른 Chrome 탭/창을 플레이하면서 키뷰어를 옆에 띄워 두기 위한 Chrome 확장 프로그램 모드가 포함되어 있습니다.

## 설치

1. 이 저장소를 다운로드합니다.
2. Chrome에서 `chrome://extensions` 를 엽니다.
3. 오른쪽 위의 개발자 모드를 켭니다.
4. `압축해제된 확장 프로그램을 로드합니다`를 눌러 이 저장소 폴더를 선택합니다.
5. 확장 프로그램 아이콘을 누르면 키뷰어 `index.html`이 열립니다.
6. 다른 Chrome 탭 또는 다른 Chrome 창을 활성화해도 해당 웹페이지에서 누른 키가 키뷰어로 전달됩니다.

## 제한

- `chrome://` 페이지, Chrome Web Store 등 Chrome이 content script 주입을 금지하는 페이지에서는 동작하지 않습니다.
- 비밀번호/채팅 등 개인정보 입력을 보호하기 위해 `input`, `textarea`, `select`, `contenteditable` 요소에 입력 중인 키는 전달하지 않습니다.
- Chrome 밖의 Android/Linux 앱이나 다른 데스크톱 앱의 전역 키 입력은 받을 수 없습니다.
