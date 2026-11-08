package com.zincir.app;

import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Rutin Zinciri: the web app from docs/ ships inside the APK and is shown full screen.
 * Pages load from the APK itself, so the app works without a connection.
 */
public class MainActivity extends Activity {
    /** Android reserves this host for apps serving their own files; these requests never reach the network. */
    static final String HOST = "appassets.androidplatform.net";
    static final String START = "https://" + HOST + "/index.html";

    private WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(getColor(R.color.bg));
        web = new WebView(this);
        web.setBackgroundColor(getColor(R.color.bg));
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);
        drawBehindSystemBars(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        // The optional sync with a home PC speaks plain http inside the home network
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setUserAgentString(s.getUserAgentString() + " RutinZinciriApp/" + BuildConfig.VERSION_NAME);
        web.setWebViewClient(new Client());

        if (state == null || web.restoreState(state) == null) web.loadUrl(START);
    }

    /** Content runs edge to edge (required from Android 15 on) and is padded clear of the bars and the keyboard. */
    private void drawBehindSystemBars(View root) {
        Window w = getWindow();
        boolean night = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        if (Build.VERSION.SDK_INT >= 30) {
            w.setDecorFitsSystemWindows(false);
            WindowInsetsController c = w.getInsetsController();
            if (c != null) {
                int light = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                c.setSystemBarsAppearance(night ? 0 : light, light);
            }
        } else {
            int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
            if (!night) {
                flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                if (Build.VERSION.SDK_INT >= 26) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
            w.getDecorView().setSystemUiVisibility(flags);
        }
        if (Build.VERSION.SDK_INT < 35) {
            w.setStatusBarColor(Color.TRANSPARENT);
            w.setNavigationBarColor(Color.TRANSPARENT);
        }
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int left, top, right, bottom;
            if (Build.VERSION.SDK_INT >= 30) {
                Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                Insets ime = insets.getInsets(WindowInsets.Type.ime());
                left = bars.left; top = bars.top; right = bars.right; bottom = Math.max(bars.bottom, ime.bottom);
            } else {
                left = insets.getSystemWindowInsetLeft(); top = insets.getSystemWindowInsetTop();
                right = insets.getSystemWindowInsetRight(); bottom = insets.getSystemWindowInsetBottom();
            }
            v.setPadding(left, top, right, bottom);
            return insets;
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        web.destroy();
        super.onDestroy();
    }

    private class Client extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (!HOST.equals(u.getHost())) return null;   // fonts and the PC sync go to the network as usual
            String path = u.getPath();
            String name = path == null || path.equals("/") ? "index.html" : path.substring(1);
            if (!name.matches("[A-Za-z0-9_-][A-Za-z0-9._-]*")) return notFound();
            try {
                InputStream in = getAssets().open(name);
                Map<String, String> headers = new HashMap<>();
                headers.put("Cache-Control", "no-cache");
                String type = mime(name);
                return new WebResourceResponse(type, type.startsWith("image/") ? null : "utf-8", 200, "OK", headers, in);
            } catch (IOException e) {
                return notFound();
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (HOST.equals(u.getHost())) return false;
            // Links to other sites (privacy policy, PC program guide) open in the browser
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, u));
            } catch (Exception ignored) {
            }
            return true;
        }
    }

    private static WebResourceResponse notFound() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<>(), new ByteArrayInputStream(new byte[0]));
    }

    private static String mime(String name) {
        if (name.endsWith(".html")) return "text/html";
        if (name.endsWith(".js")) return "text/javascript";
        if (name.endsWith(".webmanifest")) return "application/manifest+json";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }
}
