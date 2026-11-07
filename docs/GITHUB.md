# Приватен GitHub репозиториум за ТРИАЛУМ

Поврзаниот GitHub акаунт е `extreme4music-nexus`. Во ова издание **кодот не е поставен на GitHub**: достапната интеграција дозволува работа со постоечки репозиториуми, но не и создавање ново приватно репо. Следните команди можеш да ги извршиш во локалната папка на играта.

## Опција A — GitHub CLI (PowerShell / Bash)

Потребни се [Git](https://git-scm.com/) и [GitHub CLI](https://cli.github.com/). Прво:

```bash
gh auth login
```

Потоа, од папката `TRIALUM_v1_1`:

```bash
git init
git add .
git commit -m "TRIALUM v1.1 - Living Spark"
gh repo create extreme4music-nexus/trialum-ziva-iskra --private --source=. --remote=origin --push
```

Ова треба да создаде **приватен** репозиториум и да го постави кодот. Ако постои репозиториум со тоа име, избери друго име и повтори само `gh repo create`.

## Опција B — преку веб

1. Отвори `https://github.com/new`, избери име `trialum-ziva-iskra`, постави **Private**, и создај празен репозиториум **без иницијален README**.
2. Во папката на играта:

```bash
git init
git add .
git commit -m "TRIALUM v1.1 - Living Spark"
git branch -M main
git remote add origin https://github.com/extreme4music-nexus/trialum-ziva-iskra.git
git push -u origin main
```

Не поставувај лични токени, кориснички бекапи и податоци од милениците во репото. `.gitignore` исклучува извештаи, привремени датотеки и тест-слики.
