package com.rentveda.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.PermissionState;

@CapacitorPlugin(
    name = "Timer",
    permissions = {
        @Permission(
            alias = "notifications",
            strings = { "android.permission.POST_NOTIFICATIONS" }
        )
    }
)
public class TimerPlugin extends Plugin {

    private static TimerPlugin instance;

    public static TimerPlugin getInstance() {
        return instance;
    }

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    @Override
    protected void handleOnDestroy() {
        if (instance == this) {
            instance = null;
        }
        super.handleOnDestroy();
    }

    public void sendTickEvent(int time) {
        JSObject ret = new JSObject();
        ret.put("time", time);
        notifyListeners("onTick", ret);
    }

    public void sendActionEvent(String action) {
        JSObject ret = new JSObject();
        ret.put("action", action);
        notifyListeners("onAction", ret);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33) { // Android 13+
            if (getPermissionState("notifications") != PermissionState.GRANTED) {
                requestPermissionForAlias("notifications", call, "notificationsPermsCallback");
                return;
            }
        }
        startServiceInternal(call);
    }

    @PermissionCallback
    private void notificationsPermsCallback(PluginCall call) {
        if (getPermissionState("notifications") == PermissionState.GRANTED) {
            startServiceInternal(call);
        } else {
            call.reject("Notification permission is required to display the tracker.");
        }
    }

    private void startServiceInternal(PluginCall call) {
        int startTime = call.getInt("startTime", 0);
        Intent intent = new Intent(getContext(), TimerService.class);
        intent.setAction(TimerService.ACTION_START);
        intent.putExtra("startTime", startTime);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void pause(PluginCall call) {
        Intent intent = new Intent(getContext(), TimerService.class);
        intent.setAction(TimerService.ACTION_PAUSE);
        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void resume(PluginCall call) {
        Intent intent = new Intent(getContext(), TimerService.class);
        intent.setAction(TimerService.ACTION_RESUME);
        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Intent intent = new Intent(getContext(), TimerService.class);
        intent.setAction(TimerService.ACTION_STOP);
        getContext().startService(intent);
        call.resolve();
    }
}
