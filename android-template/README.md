# ТРИАЛУМ 1.4.1 — Android WebView апликација

**Статус:** ТРИАЛУМ **1.4.1** е постојниот функционален **debug/test build** и **можен релис-кандидат по неколкудневно рачно тестирање**. Не е прогласен за конечен релис, нема Play Store објава и оваа документациска ревизија **не менува код, APK или број на верзија**.

Овој фолдер е **изграден Android Kotlin проект**, не само план или непроверен шаблон. **Debug APK** се добива од [GitHub Actions](https://github.com/extreme4music-nexus/Trialum/actions/workflows/build-android.yml); во самиот source фолдер не се складира APK. Не е изработен production `.aab` за Google Play.

## Конфигурација и структура

| Поле | Вредност |
|---|---|
| Android package | `com.trialum.ziivaiskra` |
| Верзија | `versionName=1.4.1`, `versionCode=15` |
| SDK | `minSdk=26`, `compileSdk=35`, `targetSdk=35` |
| Build | Gradle 8.9 во CI, JDK 17, Android Gradle Plugin 8.7.3 |
| APK workflow | `Build Trialum Android APK`, артефакт `Trialum-Android-v1.4.1-debug` |

`syncWebAssets` ги пакува постојните `index.html`, `assets/`, `js/` и `vendor/` без двојна копија од логиката. `WebViewAssetLoader` ги вчитува локално преку `https://appassets.androidplatform.net/assets/web/`. Светот се зачувува локално, без наш game server.

## Native мост и известувања

- `saveBackup` / `chooseBackup`: JSON зачувување и увоз преку Android системски document picker; **не е потребна широка storage дозвола**.
- `shareImage` / `saveImage`: споделување на PNG преку `FileProvider` / Sharesheet и системски избор на датотека.
- `copyText` / `shareText`: WebRTC P2P покана и одговор преку clipboard / Android Sharesheet.
- `updateState`: локален SharedPreferences snapshot за `CareWorker`. WorkManager бара проверка на приближно 6 часа; Doze/Battery Saver може да го одложи. Не се извршува цела еволуција во позадина.
- `POST_NOTIFICATIONS` се бара **од Поставки**, не автоматски при стартување. Каналот `trialum-care-v14` има звук и барање за badge; вистинскиот број на иконата зависи од Android launcher.
- `INTERNET` се користи за опционално GGUF преземање и директни P2P врски; **нема cloud LLM backend**.

## Опционален локален LLM

APK го содржи `ModelRuntime.kt` и `dev.ffmpegkit-maintained:llama-android:0.1.1` (native `llama.cpp` wrapper), **не GGUF тежините**. По отклучување **Синапсо или повисок**, **миленик ниво 22+** и **лабораторија 6+**, корисникот експлицитно презема `SmolLM2-135M-Instruct-Q3_K_M.gguf` (93,510,208 бајти / ~89.2 MiB).

При преземање се проверуваат форматот, големината и SHA-256. Генерирање се активира само при порака; по одговор native handle се ослободува, а при `onStop` се бара откажување. Реална брзина, RAM/батерија, македонски разговор и откажување во native слој **не се тестирани на физички уред**. [Документ за LLM пакет](../model-packs/smollm2-135m/README.md).

## Безбедна тест-инсталација

1. Преземи успешен build од `main` во GitHub Actions и отпакувај го debug APK.
2. Пред инсталирање над стара debug верзија направи **JSON бекап**. Ако потписите се различни, Android може да го одбие update; не деинсталирај без проверен бекап.
3. Инсталирај на Android тест-уред, провери нов/стар свет, менија, дозволи, нотификации, screenshot и P2P.
4. За локална компилација отвори `android-template/` во Android Studio со соодветниот SDK; користи `assembleDebug`.
5. Провери LLM само по отклучување/преземање, со вклучен и исклучен интернет и мерење на RAM/батерија.

**Автоматскиот build е успешен, но физичкото тестирање е отворено.** Нема реклами, платени трансакции или објава на Google Play. За нова Play телефонска апликација треба API 36+; тука SDK останува непроменет на 35.

**Поврзано:** [главен README](../README.md) · [Android детали](../docs/ANDROID.md) · [UI/QA план](../docs/UI_QA_V1.4.1.md).
