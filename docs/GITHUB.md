# ТРИАЛУМ 1.1 — GitHub Desktop и приватен GitHub

**Приватен репозиториум:** https://github.com/extreme4music-nexus/Trialum

Овој пакет содржи **целосен локален Git репозиториум (`Trialum/.git/`)**, а не само изворни датотеки. Гранката е `main`, а `origin` веќе покажува кон приватниот репозиториум. Првиот commit на GitHub веќе постои, а новите commit-и за верзијата 1.1 чекаат да бидат испратени од твојот компјутер.

## GitHub Desktop (Windows)

1. Отпакувај го целиот ZIP во обична локална папка, на пример `D:\Projects\TRIALUM`. Во неа ќе се појави подпапката `Trialum`.
2. Стартувај **GitHub Desktop** и најави се со GitHub корисникот `extreme4music-nexus`.
3. Од менито **File → Add local repository… → Choose…**, избери ја *точно* папката `D:\Projects\TRIALUM\Trialum` (онаа што ги содржи `index.html` и скриената `.git` папка).
4. Во горниот лев агол потврди дека е избрана гранката `main`. GitHub Desktop треба да ја прикаже пораката дека локалната гранка е пред серверот за неколку commit-и.
5. Кликни **Push origin**. Потоа отвори https://github.com/extreme4music-nexus/Trialum и провери дека таму се појавиле `js/`, `assets/`, `android-template/`, `docs/` и останатите датотеки.

**Немој** да користиш „Create a new repository“ или „Publish repository“ за овој ZIP: репозиториумот веќе постои. Исто така **немој** да бришеш `.git` или да правиш ново `git init`.

## Резервна варијанта — терминал

Од коренот `Trialum`:

```bash
git status
git remote -v
git log --oneline -3
git push -u origin main
```

За push треба GitHub Desktop или Git со авторизиран GitHub акаунт. ZIP не содржи лозинки, приватни клучеви или авторизациски токени.

## На што да внимаваш

- Отпакувај во **нова папка**; не мешај ја оваа `.git` со некоја друга локална копија од репозиториумот.
- Чувај си копија од JSON-зачувувањата на играта надвор од Git. Не ги прикачувај приватните податоци од твојот свет.
- Ако GitHub Desktop прикаже **Fetch origin** наместо **Push origin**, прво провери `History` и `Repository → Open in Command Prompt` со `git status -sb`; не форсирај push.
- Ако серверот во меѓувреме добил нови commit-и, прво усогласи ја историјата и не користи `force push`.

## Играта

`index.html` е влезната точка. Поради прелистувачки ограничувања, за стабилен офлајн тест може да се стартува локален сервер со `python -m http.server 8000`. APK не е приложен — во `android-template/` е само изворен шаблон.
