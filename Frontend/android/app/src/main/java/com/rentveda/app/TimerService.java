package com.rentveda.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class TimerService extends Service {
    public static final String ACTION_START = "ACTION_START";
    public static final String ACTION_PAUSE = "ACTION_PAUSE";
    public static final String ACTION_RESUME = "ACTION_RESUME";
    public static final String ACTION_STOP = "ACTION_STOP";
    public static final String TICK_EVENT = "com.rentveda.app.TIMER_TICK";

    private static final String CHANNEL_ID = "TimerServiceChannel";
    private static final int NOTIFICATION_ID = 101;

    private int secondsElapsed = 0;
    private boolean isPaused = false;
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable runnable;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            switch (action) {
                case ACTION_START:
                    secondsElapsed = intent.getIntExtra("startTime", 0);
                    isPaused = false;
                    startTimer();
                    startForegroundServiceWithNotification();
                    break;
                case ACTION_PAUSE:
                    isPaused = true;
                    updateNotification();
                    sendActionBroadcast("pause");
                    break;
                case ACTION_RESUME:
                    isPaused = false;
                    updateNotification();
                    sendActionBroadcast("resume");
                    break;
                case ACTION_STOP:
                    stopTimer();
                    sendActionBroadcast("stop");
                    stopForeground(true);
                    stopSelf();
                    break;
            }
        }
        return START_NOT_STICKY;
    }

    private void startTimer() {
        if (runnable != null) {
            handler.removeCallbacks(runnable);
        }
        runnable = new Runnable() {
            @Override
            public void run() {
                if (!isPaused) {
                    secondsElapsed++;
                    updateNotification();
                    
                    TimerPlugin plugin = TimerPlugin.getInstance();
                    if (plugin != null) {
                        plugin.sendTickEvent(secondsElapsed);
                    }
                }
                handler.postDelayed(this, 1000);
            }
        };
        handler.post(runnable);
    }

    private void stopTimer() {
        if (runnable != null) {
            handler.removeCallbacks(runnable);
        }
    }

    private void startForegroundServiceWithNotification() {
        Notification notification = buildNotification();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                // For Android 14+ specific foreground service type might be required if targeted
                if (Build.VERSION.SDK_INT >= 34) { // Android 14+
                    int type = ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE;
                    startForeground(NOTIFICATION_ID, notification, type);
                } else {
                    startForeground(NOTIFICATION_ID, notification);
                }
            } catch (Exception e) {
                startForeground(NOTIFICATION_ID, notification);
            }
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void updateNotification() {
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.notify(NOTIFICATION_ID, buildNotification());
        }
    }

    private Notification buildNotification() {
        // Formatted time (HH:MM:SS)
        int hours = secondsElapsed / 3600;
        int minutes = (secondsElapsed % 3600) / 60;
        int secs = secondsElapsed % 60;
        String timeString = String.format("%02d:%02d:%02d", hours, minutes, secs);

        Intent openAppIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingOpenAppIntent = PendingIntent.getActivity(this, 0, openAppIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Tracker Active")
                .setContentText("Elapsed time: " + timeString)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingOpenAppIntent)
                .setOngoing(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOnlyAlertOnce(true);

        // Add Pause/Resume button
        if (isPaused) {
            Intent resumeIntent = new Intent(this, TimerActionReceiver.class);
            resumeIntent.setAction(ACTION_RESUME);
            PendingIntent pResumeIntent = PendingIntent.getBroadcast(this, 1, resumeIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            builder.addAction(0, "Resume", pResumeIntent);
        } else {
            Intent pauseIntent = new Intent(this, TimerActionReceiver.class);
            pauseIntent.setAction(ACTION_PAUSE);
            PendingIntent pPauseIntent = PendingIntent.getBroadcast(this, 2, pauseIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            builder.addAction(0, "Pause", pPauseIntent);
        }

        // Add Stop button
        Intent stopIntent = new Intent(this, TimerActionReceiver.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent pStopIntent = PendingIntent.getBroadcast(this, 3, stopIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        builder.addAction(0, "Stop", pStopIntent);

        return builder.build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Timer Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            serviceChannel.setDescription("Shows active timer and controls.");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private void sendActionBroadcast(String action) {
        TimerPlugin plugin = TimerPlugin.getInstance();
        if (plugin != null) {
            plugin.sendActionEvent(action);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        stopTimer();
        super.onDestroy();
    }
}
