# ТРИАЛУМ 1.4.1 — Google Play подготовка

**Ажурирано: 8 ноември 2026 · статус: НЕ Е ОБЈАВЕНО.** Овој документ е checklist за *идна* публикација. Не се активираат наплата, production signing, кориснички сметки или објавување.

**Статус:** ТРИАЛУМ **1.4.1** е постојниот функционален **debug/test build** и **можен релис-кандидат по неколкудневно рачно тестирање**. Не е прогласен за конечен релис, нема Play Store објава и оваа документациска ревизија **не менува код, APK или број на верзија**.

**Google Play не е предмет на сегашниот тест-период.** Прво неколку дена го проверуваме 1.4.1 како можен релис-кандидат; откако ќе се решат критичните проблеми, одделно ќе се планира Play compliance. Актуелната официјална [Google Play API политика](https://support.google.com/googleplay/android-developer/answer/11926878) бара `targetSdk 36+` за нови телефонски апликации од 31 август 2026; `targetSdk 35` на ТРИАЛУМ сè уште е непроменет.
## Моментална техничка состојба

| Ставка | Состојба |
|---|---|
| Android package/application ID | `com.trialum.ziivaiskra` |
| Android верзија | `versionName 1.4.1`, `versionCode 15` |
| Android SDK | `minSdk 26`, `compileSdk 35`, `targetSdk 35` |
| Android Gradle Plugin / Gradle | 8.7.3 / CI 8.9 |
| Дистрибуција сега | GitHub Actions **debug APK** за тестирање, не потпишан production AAB |
| Библиотеки | WebView, WorkManager, AndroidX, native локален `llama.cpp` runtime |
| Дополнителен модел | Смол GGUF пакет во GitHub Releases, не е во APK |

**Важно:** од **31 август 2026** нови Android телефонски апликации и ажурирања за Google Play треба да таргетираат **Android 16 / API 36+**. Актуелниот `targetSdk=35` не ги исполнува барањата за ново објавување во ноември 2026. Види: https://support.google.com/googleplay/android-developer/answer/11926878.

## Пред да започне Play Console објавување

- [ ] Отвори Google Play Console developer account; заврши identity/contact verification. Регистрацијата обично има еднократна такса **US$25**. https://support.google.com/googleplay/android-developer/answer/6112435
- [ ] Ако е нов **личен** developer account создаден по 13.11.2023, испланирај **12 континуирано пријавени тестери за најмалку 14 дена**, по што се бара production access. Правилото зависи од типот/датумот на account. https://support.google.com/googleplay/android-developer/answer/14151465
- [ ] Задржи го постојниот `applicationId` ако сакаш истиот идентитет на апликацијата, а зголемувај `versionCode` за секој следен Play build.
- [ ] Надгради ги `compileSdk` и `targetSdk` на API 36+, со соодветна AGP/Gradle верзија, па повтори регресија и физички Android тестови.
- [ ] Создај **приватен upload keystore**, не го прикачувај во Git, ZIP или логови; постави **Play App Signing**, направи потпишан **`.aab`** (`bundleRelease`), не само `assembleDebug`.
- [ ] Провери upgrade од debug до production signing: debug APK може да бара деинсталација поради потпис. **Извези JSON и тестирај restore пред какво било бришење на локални податоци.**

## Физичко QA — не заменувај со „Build Successful“

- [ ] Почетен свет, првите минути, премини и ресурси; долг свет со многу миленици/флора.
- [ ] 5 главни и сите секундарни менија; Живеалишта, ДНК, Пријатели, Дневник, Поставки.
- [ ] JSON backup/import преку Storage Access Framework; screenshot и sharesheet/FileProvider.
- [ ] Push не е потребен за нотификации: провери `POST_NOTIFICATIONS`, звучен notification channel, launcher badge и WorkManager одложувања при Doze/Battery Saver.
- [ ] WebRTC P2P на иста Wi-Fi и на различни мобилни мрежи, со и без STUN; документирај NAT ограничувања.
- [ ] Опционален SmolLM2-135M GGUF: преземање/откажување, checksum, простор, CPU/RAM/батерија/температура, локален чат и прекин кога апликацијата е неактивна.
- [ ] Возрасни категории, пристапност, локализација и стабилност на вистински Android уреди.

## Play Store листинг

- [ ] Икона **512×512 PNG**; feature graphic **1024×500** (дозволен формат според Play Console).
- [ ] Вистински screenshots од апликацијата (не mockup со функции што не работат).
- [ ] Краток/долг опис, контакт e-mail, category, content rating и target audience.
- [ ] Јавно достапна URL за **Privacy Policy**, точна **Data safety** декларација и процена на применливите Families/child-directed барања.

Официјални упатства: https://support.google.com/googleplay/android-developer/answer/9866151 · https://support.google.com/googleplay/android-developer/answer/10787469 · https://support.google.com/googleplay/android-developer/answer/9842756.

## Приватност и надворешни услуги — потврди фактички пред декларација

- **Локално:** свет, миленици, дневник, DNA варијанти, фотографии, истражување, бесплатни кредити и chat history.
- **P2P:** при директна WebRTC врска се разменуваат доброволно избрани профилни/миленички податоци и можни мрежни адреси. Опционален јавен Google STUN открива мрежни метаподатоци. Нема сопствен gaming backend и нема cloud sync.
- **LLM:** GGUF тежини се преземаат од pin-уван Hugging Face URL по експлицитно корисничко барање; самата генерација на одговор е локална. Преземањето може да открие IP/network metadata на надворешниот hosting provider. Проверувај лиценца, checksum, CDN политики и трети страни.
- **Android system Sharesheet:** корисникот сам избира трета апликација. Таа може да обработува содржина според своите правила.
- **Нема рекламен SDK, активни купувања или платежни информации** во оваа верзија. Не тврди „не собира никакви податоци“ пред да направиш целосна проверка на Android permission/network однесувањето.

## Идни плаќања — исклучени

Играта во 1.4.1 **не продава** истражувачки кредити и нема активни billing производи. Ако подоцна се воведуваат реални купувања за виртуелни токени или забрзување, прво провери ги тековните **Google Play Payments** правила и интегрирај Play Billing со серверска/серверлес проверка на трансакции, двојно исполнување, откажувања и refund-и. Не е задолжителен посебен хост за P2P играта, но client-only доверба во купувањата не е доволна.

Референци: https://support.google.com/googleplay/android-developer/answer/9858738 · https://developer.android.com/google/play/billing.

## Ограничување

Овој checklist **не е потврда за Play compliance** и не е инструкција за објавување сега. При реалното објавување, повторно провери ги тековните Google Play правила. Поврзано: [ANDROID.md](ANDROID.md) · [UI_QA_V1.4.1.md](UI_QA_V1.4.1.md).
