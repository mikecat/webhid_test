WebHID Test
===========

[WebHID API](https://developer.mozilla.org/ja/docs/Web/API/WebHID_API) によるデータの送受信の実験を行える。

[https://mikecat.github.io/webhid_test/](https://mikecat.github.io/webhid_test/)

## ログのデータ

### 共通

* `time` : ログを記録した時刻
* `kind` : ログの種類

### 状態変化 (kind = "status")

* `value` : 変化後の状態

### エラー (kind = "error")

* `target` : エラーが発生した操作
* `message` : エラーの説明

### 送受信 (kind = "communication")

* `action` : 送受信の種類
* `data` : 送信または受信したデータ
* `reportId` : 送信または受信したレポートID
