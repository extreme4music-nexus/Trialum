# ТРИАЛУМ 1.4.1 — GitHub, GitHub Desktop и автоматски build

**Веќе постоечки приватен репозиториум:** https://github.com/extreme4music-nexus/Trialum · основна гранка: `main`.

Овој документ не претпоставува дека ZIP содржи `.git`, ниту дека репозиториумот е приватен. **Клонирањето** од GitHub ја обезбедува точната историја и `origin`; обичен ZIP преку **Code → Download ZIP** не содржи `.git` и не може директно да се push-ира со GitHub Desktop како локален репозиториум.

**Статус:** ТРИАЛУМ **1.4.1** е постојниот функционален **debug/test build** и **можен релис-кандидат по неколкудневно рачно тестирање**. Не е прогласен за конечен релис, нема Play Store објава и оваа документациска ревизија **не менува код, APK или број на верзија**.

**Гранката останува `main`.** Ова документациско усогласување не создава нова гранка и не менува изворен код, CI конфигурации, SDK, модел или APK. Поради `on: push` на `main` и документациски commit може да активира **нов CI run**, но тоа **не означува нова верзија**.
## GitHub Desktop (Windows)

1. Отвори **GitHub Desktop → File → Clone repository… → URL**.
2. Внеси `https://github.com/extreme4music-nexus/Trialum.git` и избери локална папка по желба (на пример `D:\Projects\Trialum`).
3. Потврди дека гранката е `main`, па кликни **Fetch origin** / **Pull origin** за да ги земеш последните измени.
4. Направи ги потребните локални измени. Пред секој commit прегледај **Changes**, не додавај JSON бекапи, API клучеви, `.keystore` и големи GGUF тежини.
5. По commit избери **Push origin**. Ако `main` добил промени во меѓувреме, прво **Pull origin** и реши ги конфликтите. Не користи `force push`.

Ако веќе имаш валиден локален `.git` со правилен `origin`, наместо клонирање можеш **File → Add local repository…** и да ја избереш постојната папка.

## Терминал

```bash
git clone https://github.com/extreme4music-nexus/Trialum.git
cd Trialum
git branch --show-current
git remote -v
git pull --ff-only origin main
git status -sb
```

За документациски измени е безбедно да се користи посебна гранка и Pull Request:

```bash
git switch -c docs/my-change
# Измени само README.md и docs/*.md
git add README.md docs/
git commit -m "docs: align documentation"
git push -u origin docs/my-change
```

Нема потреба од `git init`, `gh repo create` или нов репозиториум — ТРИАЛУМ веќе е поставен на GitHub. При повлекување `git clone` ќе добиеш целосен Git репозиториум, за разлика од ZIP артефактите.

## Автоматско компајлирање и тестови

**[Build Trialum Android APK](https://github.com/extreme4music-nexus/Trialum/actions/workflows/build-android.yml)** автоматски се активира при push на `main` и рачно преку **Run workflow**.

Workflow:
1. Го презема кодот и поставува JDK 17, Android SDK 35 и Gradle 8.9.
2. Поставува `jsdom@26.1.0` за browser-like DOM тестирање.
3. Ги извршува `engine`, `evolution`, `progression`, `longplay` и `ui` regression тестовите и `node --check` на `js/*.js`.
4. Гради `android-template :app:assembleDebug` и при успех прикачува **`Trialum-Android-v1.4.1-debug`** како артефакт (7 дена retention).

Последен потврден успешен Android build за 1.4.1: https://github.com/extreme4music-nexus/Trialum/actions/runs/42451814003. GitHub build поминувањата не се потврда за реална телефонска/UX проверка.

## Одделен модел — GitHub Releases

**[Package optional mini LLM for Trialum](https://github.com/extreme4music-nexus/Trialum/actions/workflows/publish-llm-pack.yml)** пакува изворен GGUF модел од pin-уван upstream со SHA-256 проверка, а потоа го објавува во **[trialum-mini-llm-v0.1](https://github.com/extreme4music-nexus/Trialum/releases/tag/trialum-mini-llm-v0.1)**.

- ZIP содржи `model-pack/` со GGUF, manifest, README и checksum.
- GGUF тежини **не** се commit-ираат во Git историјата; `.gitignore` ги исклучува.
- Android апликацијата го презема потребниот GGUF од проверениот upstream при корисничко барање; не го презема автоматски при секое отворање и не треба да користи model release ZIP како APK.
- Ова е реален, но многу мал **135M** LLM. Нема плаќања и нема cloud inference.

## Верзија, безбедност и QA

- `main` содржи 1.4.1; Android `versionName=1.4.1`, `versionCode=15`, `targetSdk=35`.
- GitHub release/AAB за Play Store **не** е изработен. Потребна е потпишана production верзија и API 36+.
- Чувај оригинален Android signing keystore надвор од репото; поставувај CI secrets само во соодветни заштитени поставки ако е потребно.
- Не верувај дека `PASS` на CI гарантира P2P меѓу различни оператори, LLM резултати или badge нотификации на конкретен Android launcher.

## Зачувани светови не се Git датотеки

JSON бекапите се лични податоци од играта. Се чуваат локално и се увезуваат/извезуваат во **Повеќе → Поставки**. Не ги додавај во јавно репо, во PR, ZIP за дистрибуција или GitHub Issue.

За управување со апликацијата види [ANDROID.md](ANDROID.md), а за тест-процедурата [UI_QA_V1.4.1.md](UI_QA_V1.4.1.md).
