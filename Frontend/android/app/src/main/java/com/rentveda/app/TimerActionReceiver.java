package com.rentveda.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class TimerActionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action != null) {
            Intent serviceIntent = new Intent(context, TimerService.class);
            serviceIntent.setAction(action);
            context.startService(serviceIntent);
        }
    }
}
