package com.ioft.lroclient.probe

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.IBinder
import android.os.PowerManager

class KeepAliveService : Service() {
  private var wakeLock: PowerManager.WakeLock? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val nm = getSystemService(NotificationManager::class.java)
    nm.createNotificationChannel(NotificationChannel("keepalive", "保持在线", NotificationManager.IMPORTANCE_LOW))
    val notification = Notification.Builder(this, "keepalive")
      .setContentTitle("LRO 探针正在保持在线")
      .setSmallIcon(applicationInfo.icon)
      .setOngoing(true)
      .build()
    startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
    if (wakeLock == null) {
      wakeLock = getSystemService(PowerManager::class.java)
        .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "lroprobe:keepalive").apply { acquire() }
    }
    return START_STICKY
  }

  override fun onDestroy() {
    wakeLock?.release()
    super.onDestroy()
  }
}
