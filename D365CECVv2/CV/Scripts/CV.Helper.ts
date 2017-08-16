namespace CV {
    /**
    * ConnectionViewerのヘルパーを格納するモジュール
    * @module
    */
    export module Helper {
        /**
        * 位置を示すポイント
        * @class
        */
        export class Point {
            x: number;
            y: number;
            /**
            * X座標の位置とY座標の位置を指定するコンストラクタ
            * @constructor
            * @param x X座標の位置
            * @param y Y座標の位置
            */
            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
            }
        }
        /**
        * メッセージを追加して表示する。
        * @function
        * @param message メッセージ
        */
        export function addMessage(message: string): void {
            document.getElementById("MyMessageDiv").innerHTML += message;
        }
        /**
        * メッセージを追加して表示し、<BR/>で改行する。
        * @function
        * @param message メッセージ
        */
        export function addMessageln(message: string): void {
            document.getElementById("MyMessageDiv").innerHTML += message + "<BR/>";
        }
        /**
        * エラーメッセージを追加して表示し、<BR/>で改行する。
        * @function
        * @param message エラーメッセージ
        */
        export function addErrorMessageln(message: string): void {
            addMessageln("Error: " + message);
        }
        /**
        * Infoレベルのメッセージを追加して表示し、<BR/>で改行する。
        * @function
        * @param message エラーメッセージ
        */
        export function addInfoMessageln(message: string): void {
            addMessageln("Info: " + message);
        }
        /**
        * userAgentを表示する。
        * @function
        */
        export function showUserAgent() {
            addMessage(navigator.userAgent);
        }
    }
}