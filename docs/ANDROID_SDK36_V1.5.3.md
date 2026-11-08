> **TRIALUM 1.5.5 — тековен статус; овој документ е историска основа.** Историска SDK 36 миграција 1.5.3. Верзијата 1.5.5 ја зачувува compileSdk=36, targetSdk=36 и minSdk=26; versionName=1.5.5, versionCode=21. Тестирај системски ленти, viewport, portrait/landscape и WebView на физички уред. [Канонски план](../PROJECT_ROADMAP.md) · [Релис и тестови](RELEASE_V1.5.5.md).

---

# ТРИАЛУМ 1.5.3 — изолирана миграција на Android SDK 36

> **Актуелен развоен статус — ТРИАЛУМ 1.5.4 / Google Play Games:** SDK 36 останува потврден од 1.5.3, а во посебната `feature/trialum-v1.5.4-play-games` гранка е додаден Google Play Games Services v2 (профил, постигнувања, рангирања, Cloud Save и Cloud Restore). **Без реален Play Console Game project ID, OAuth сертификат, Saved Games ON и одобрени тестери интеграцијата останува неконфигурирана**; локалната игра и JSON Бекап и враќање не се менуваат. Реалната Google синхронизација и судир меѓу две облачни верзии сè уште чекаат тест на два уреда. [Целосно упатство](GOOGLE_PLAY_GAMES_V1.5.4.md).


> **Статус:** развојна гранка `feature/trialum-v1.5.3-android36`, не продукциски релис. Основата е проверената 1.5.2 со поправени очи. Стабилната `main` засега останува 1.4.1.

## Цел и граници

**Еден чекор → посебен APK → тест на вистински телефон → дозвола за следниот чекор.** Оваа верзија се занимава **само** со Android API level 36 и неопходните build алатки. Нема нов Google Play Games, нов LLM, промени во логиката на еволуцијата, XP, DNA, плаќање, дневник или JSON формат. Android package останува `com.trialum.ziivaiskra`.

| Компонента | Потврдена 1.5.2 | Развојна 1.5.3 |
|---|---|---|
| `compileSdk` | 35 | **36** |
| `targetSdk` | 35 | **36** |
| `minSdk` | 26 | **26 — непроменет** |
| Android Gradle Plugin | 8.7.3 | **8.10.1** |
| Gradle | 8.9 | **8.11.1** |
| Kotlin Gradle Plugin | 2.0.21 | **2.2.21** |
| JDK | 17 | **17 — непроменет** |
| Android `versionName` | 1.5.2 | **1.5.3** |
| Android `versionCode` | 18 | **19** |
| Gameplay/save format marker | 1.5.2 | **1.5.3 (метаподаток, без промена на механиките)** |
| Локален модел / WorkManager / P2P | постојни | **исти библиотеки и однесување** |

Официјална компатибилност: [Android Gradle plugin vs API](https://developer.android.com/build/releases/about-agp), [AGP 8.10](https://developer.android.com/build/releases/agp-8-10-0-release-notes), [Kotlin/Gradle матрица](https://kotlinlang.org/docs/gradle-configure-project.html).

## Зошто не е само бројот 35 → 36

AGP 8.7.3 не е официјално поддржан за API 36. Затоа CI го инсталира SDK `platforms;android-36`, користи AGP 8.10.1 и Gradle 8.11.1; JDK останува 17. Kotlin 2.2.21 е усогласен со избраниот Gradle и AGP. CI експлицитно проверува во APK manifest `targetSdkVersion:36`, `sdkVersion:26` и `versionName:1.5.3`.

## Ризици при `targetSdk 36` — што мора рачно да се провери

Android 16 има промени што не можат да се докажат само со успешен build:

1. **Edge-to-edge / системски ленти:** статусниот дел, камерата/notch и долната navigation bar не смеат да го преклопат HDR ресурсниот приказ, биосветот, долното мени и текстовите. Постојниот Android код веќе применува горен WindowInset; долниот приказ мора да се провери на уред.
2. **Predictive Back:** физичкото или гест копчето Back, отворање/затворање дијалози и враќање од системскиот file picker мора правилно да функционираат.
3. **Промена на големина и ориентација:** на tablet/foldable со ширина 600dp+, ограничувањата за фиксна ориентација можат да се игнорираат. Тестирај portrait/landscape, пауза и рестарт.
4. **WebView, native LLM и P2P:** провери дека локалната игра, GGUF преземањето, генерацијата по директно барање и WebRTC одговараат исто како на 1.5.2.
5. **Backup & Restore, нотификации и MediaStore:** извези JSON, врати без губење миленици, провери датотека во Галерија, дозвола/звук за известувања и WorkManager без двојни известувања.
6. **Инсталација над 1.5.2:** debug signing certificate од различни GitHub runner-и може да биде различен. **Не ја деинсталирај претходната верзија без успешно зачуван и проверен бекап.**

Официјални промени: [Android 16 / targetSdk 36](https://developer.android.com/about/versions/16/behavior-changes-16).

## Автоматски проверки

GitHub Actions: `Build Trialum Android APK` на посебната SDK36 гранка. Тестовите мора да опфатат engine, evolution, progression, longplay, menu/UI, GIF, blinking eyes, JS syntax, компајлирање, проверка на локални web assets и manifest API 36. **CI PASS не значи физички Android PASS.**

## Одлука после тестот

- Ако се стартува играта, сите главни менија работат, стариот свет и бекапот се враќаат, нема преклопувања, крашеви или проблем со Back → **1.5.3 Android SDK 36 е потврдена за следна развојна фаза**.
- Ако некој дел откаже, **стоп**: дефектот се пријавува со Android верзија, чекори, screenshot/log, и се коригира **само SDK36 миграцијата** пред следниот APK.
- **Google Play Games** е следна одвоена фаза, не дел од 1.5.3. Потоа се планира напреден локален LLM само со експлицитна согласност и реални проверки на RAM/CPU.

**Овој документ е валиден само за развојната 1.5.3, а старите README секции подолу се зачувани како историски записи.**
