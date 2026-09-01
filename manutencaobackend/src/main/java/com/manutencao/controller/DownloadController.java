package com.manutencao.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DownloadController {

    @GetMapping(value = "/download", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> downloadPage() {
        String html = """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Download App Manutenção</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .card {
                        background: white;
                        border-radius: 16px;
                        padding: 48px;
                        text-align: center;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        max-width: 400px;
                        width: 90%;
                    }
                    h1 {
                        color: #1a73e8;
                        font-size: 24px;
                        margin-bottom: 8px;
                    }
                    p {
                        color: #666;
                        margin-bottom: 32px;
                        font-size: 14px;
                    }
                    .btn {
                        display: inline-block;
                        background: #1a73e8;
                        color: white;
                        text-decoration: none;
                        padding: 16px 48px;
                        border-radius: 8px;
                        font-size: 18px;
                        font-weight: 600;
                        transition: background 0.2s;
                    }
                    .btn:hover { background: #1557b0; }
                    .icon {
                        font-size: 64px;
                        margin-bottom: 16px;
                    }
                    .version {
                        margin-top: 24px;
                        color: #999;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="icon">📱</div>
                    <h1>Manutenção Industrial</h1>
                    <p>Baixe o aplicativo para Android</p>
                    <a class="btn" href="/aplicativomanutencao/appmanutencao.apk" download>Baixar APK</a>
                    <div class="version">v1.0.0</div>
                </div>
            </body>
            </html>
            """;
        return ResponseEntity.ok(html);
    }
}
