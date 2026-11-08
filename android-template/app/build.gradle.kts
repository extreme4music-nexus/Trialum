plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.trialum.ziivaiskra"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.trialum.ziivaiskra"
        minSdk = 26
        targetSdk = 35
        versionCode = 13
        versionName = "1.3.0"
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
}
// Bundle the same web game in the APK. No remote hosting or duplicated sources needed.
val syncWebAssets by tasks.registering(Copy::class) {
    from(projectDir.parentFile.parentFile) {
        include("index.html", "manifest.webmanifest", "sw.js", "assets/**", "js/**", "vendor/**")
    }
    into(layout.projectDirectory.dir("src/main/assets/web"))
}
tasks.named("preBuild") { dependsOn(syncWebAssets) }
