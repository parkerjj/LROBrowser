package com.ioft.lroclient.probe

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.system.Os
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  private var keepAlive = true

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    // Rust 通过环境变量读取参数（Android 没有命令行）。
    Os.setenv("PROBE_AUTO", "1", true)
    Os.setenv("PROBE_DURATION_S", intent.getIntExtra("probeDurationS", 60).toString(), true)
    keepAlive = !intent.getBooleanExtra("noKeepAlive", false)
    super.onCreate(savedInstanceState)
    if (keepAlive) {
      if (Build.VERSION.SDK_INT >= 33) requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
      startForegroundService(Intent(this, KeepAliveService::class.java))
    }
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    if (keepAlive) webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false)
  }
}
