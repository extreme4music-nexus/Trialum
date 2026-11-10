plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.trialum.ziivaiskra"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.trialum.ziivaiskra"
        manifestPlaceholders["trialumInviteScheme"] = "trialum"
        minSdk = 26
        targetSdk = 36
        versionCode = 23
        versionName = "1.5.6-rc1"
        // No social server configured in public/debug APKs until HTTPS endpoint is deployed.
        // Never accept http://, LAN IPs or historical DDNS as the release endpoint.
        val socialApiUrl = (project.findProperty("trialumSocialApiUrl") as? String)
            ?.trim()?.removeSuffix("/") ?: ""
        require(socialApiUrl.isEmpty() ||
            socialApiUrl.matches(Regex("^https://[A-Za-z0-9.-]+(?::443)?$"))) {
            "TRIALUM Social API must use a configured HTTPS hostname"
        }
        resValue("string", "trialum_social_api_url", socialApiUrl)
        // Public Firebase client identifiers, NOT backend service-account secrets.
        // Unset values keep FCM unavailable; no SDK token is requested.
        val fcmAppId = (project.findProperty("trialumFirebaseAppId") as? String)?.trim() ?: ""
        val fcmSenderId = (project.findProperty("trialumFirebaseSenderId") as? String)?.trim() ?: ""
        val fcmProjectId = (project.findProperty("trialumFirebaseProjectId") as? String)?.trim() ?: ""
        val fcmApiKey = (project.findProperty("trialumFirebaseApiKey") as? String)?.trim() ?: ""
        val fcmAll = listOf(fcmAppId,fcmSenderId,fcmProjectId,fcmApiKey)
        require(fcmAll.all { it.isEmpty() } || fcmAll.all { it.isNotEmpty() }) {
            "Firebase client configuration must be entirely supplied or omitted"
        }
        resValue("string", "trialum_firebase_app_id", fcmAppId)
        resValue("string", "trialum_firebase_sender_id", fcmSenderId)
        resValue("string", "trialum_firebase_project_id", fcmProjectId)
        resValue("string", "trialum_firebase_api_key", fcmApiKey)
        // Public Play Games Services IDs are supplied by Play Console.
        // With the default "0", PGS stays disabled and local play is unchanged.
        val pgsProjectId = (project.findProperty("trialumPgsProjectId") as? String)
            ?.trim()?.takeIf { it.matches(Regex("[0-9]{6,25}")) } ?: "0"
        resValue("string", "game_services_project_id", pgsProjectId)
        listOf("first_pet", "first_plant", "learned", "advanced", "ecology", "lab6", "dna").forEach { key ->
            val value = (project.findProperty("trialumPgsAchievement_" + key) as? String)
                ?.trim()?.takeIf { it.matches(Regex("[A-Za-z0-9_-]{0,150}")) } ?: ""
            resValue("string", "pgs_achievement_" + key, value)
        }
        listOf("xp", "species").forEach { key ->
            val value = (project.findProperty("trialumPgsLeaderboard_" + key) as? String)
                ?.trim()?.takeIf { it.matches(Regex("[A-Za-z0-9_-]{0,150}")) } ?: ""
            resValue("string", "pgs_leaderboard_" + key, value)
        }
    }
    // Isolated install for LW-A QA. It never replaces the existing debug APK.
    // It uses its own Android UID, WebView storage and Android Keystore scope.
    buildTypes {
        create("lwa") {
            initWith(getByName("debug"))
            applicationIdSuffix = ".lwa"
            versionNameSuffix = "-lwa"
            isDebuggable = true
            manifestPlaceholders["trialumInviteScheme"] = "trialum-lwa"
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { buildConfig = true }
}
dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.work:work-runtime-ktx:2.10.0")
    implementation("dev.ffmpegkit-maintained:llama-android:0.1.1")
    implementation("com.google.android.gms:play-services-games-v2:22.1.0")
    implementation("com.google.android.gms:play-services-nearby:19.3.0")
    implementation("com.google.firebase:firebase-messaging:25.1.3")
}
// Bundle the same web game in the APK. No remote hosting or duplicated sources needed.
val syncWebAssets by tasks.registering(Copy::class) {
    from(projectDir.parentFile.parentFile) {
        include("index.html", "manifest.webmanifest", "sw.js", "assets/**", "js/**", "locales/**", "vendor/**")
    }
    into(layout.projectDirectory.dir("src/main/assets/web"))
}
tasks.named("preBuild") { dependsOn(syncWebAssets) }
