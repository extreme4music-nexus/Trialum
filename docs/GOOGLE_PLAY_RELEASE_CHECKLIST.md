# ТРИАЛУМ — подготовка за Google Play (НЕ е објавено)

## Статус, ноември 2026
- Играта останува 100% бесплатна, без реклами, наплата или корисничка сметка.
- GitHub Actions создава **debug APK за тестирање**. Debug APK не е продукциско Play Store издание.
- Android проектот моментно има `targetSdk = 35` и AGP 8.7.3. **Play Store бара API 36+ од 31.08.2026**; пред објавување треба AGP 8.9+ (според Android документацијата), compileSdk и targetSdk 36+ и темелни тестови на Android 16/17.
- Истиот package ID треба да се задржи (`com.trialum.ziivaiskra`), а `versionCode` да расте со секое издание.

## Регистрација и тестери
1. Создај Google Play Console профил: https://play.google.com/console/about/
2. **Еднократна такса US$25** за целосна дистрибуција (самиот проект може да биде бесплатен).
3. Верификација на идентитет/контакт на издавачот.
4. Ако се отвори **нова лична сметка**, вообичаениот услов е затворено тестирање со **12 доброволни тестери непрекинато 14 дена**, по што се поднесува барање за Production. Провери ги условите на твојот конкретен профил.
5. Постави реална категорија, возрасна публика и содржински рејтинг. Ако е наменета за деца, дополнителните Families барања мора да се оценат посебно.

## Техничко издание
1. Направи **траен приватен upload keystore** за release потпишување. НИКОГАШ не го ставај во GitHub или ZIP.
2. Постави заштитени GitHub Actions Secrets само кога ќе одлучиш дека ќе правиш release.
3. Креирај **потпишан .aab** со `bundleRelease`, не `assembleDebug`. Активирај Play App Signing преку Play Console.
4. Верификувај ја надградбата без губење на IndexedDB: debug APK од GitHub може да има различен потпис од финалната Play апликација. Извези и тестирај JSON backup пред деинсталирање.
5. Инструментални тестови на вистински Android телефони за: P2P на Wi-Fi и мобилна мрежа, background WorkManager/известувања, screenshot FileProvider, Android share, Storage Access Framework, резервна копија, нови и стари светови, рестарт.
6. Одобри ја јавната политика за приватност пред објава.

## Store listing
- Оригинална Play Store икона: **512×512 PNG со alpha, максимум 1 MB**.
- Feature graphic: **1024×500 JPG или 24-bit PNG без alpha**.
- Реални, ненаведувачки screenshots од играта; краток и долг опис; е-пошта за контакт.
- Точна **Data safety** декларација и јавна URL адреса на **Privacy Policy**; Google ја бара дури и ако не се собираат кориснички податоци.

## Приватност — што треба да се провери пред пополнување декларации
- World/save, истражување, миленици, DNA-дизајнер и screenshot датотеки се локални.
- P2P врските може да откриваат мрежни метаподатоци и IP адреси меѓу соговорниците; *опционалниот* јавен STUN сервер може да види мрежни адреси. Точно опиши го тоа.
- Sharing преку Android chooser е **само по корисничка акција**; избраната трета апликација има свои услови.
- Не декларирај „не собираме никакви податоци“ без финален преглед на сите SDK, permissions, WebRTC и реалното однесување.
- Не прави автоматско објавување на детски профили или скриени идентификатори.

## Линкови
- Регистрација: https://support.google.com/googleplay/android-developer/answer/6112435
- 12 тестери/14 дена: https://support.google.com/googleplay/android-developer/answer/14151465
- Target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Android 16 SDK: https://developer.android.com/about/versions/16/setup-sdk
- Слики и графика: https://support.google.com/googleplay/android-developer/answer/9866151
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756
