var CV;
(function (CV) {
    /**
    * ConnectionViewerのヘルパーを格納するモジュール
    * @module
    */
    var Helper;
    (function (Helper) {
        /**
        * 位置を示すポイント
        * @class
        */
        var Point = (function () {
            /**
            * X座標の位置とY座標の位置を指定するコンストラクタ
            * @constructor
            * @param x X座標の位置
            * @param y Y座標の位置
            */
            function Point(x, y) {
                this.x = x;
                this.y = y;
            }
            return Point;
        }());
        Helper.Point = Point;
        /**
        * メッセージを追加して表示する。
        * @function
        * @param message メッセージ
        */
        function addMessage(message) {
            document.getElementById("MyMessageDiv").innerHTML += message;
        }
        Helper.addMessage = addMessage;
        /**
        * メッセージを追加して表示し、<BR/>で改行する。
        * @function
        * @param message メッセージ
        */
        function addMessageln(message) {
            document.getElementById("MyMessageDiv").innerHTML += message + "<BR/>";
        }
        Helper.addMessageln = addMessageln;
        /**
        * エラーメッセージを追加して表示し、<BR/>で改行する。
        * @function
        * @param message エラーメッセージ
        */
        function addErrorMessageln(message) {
            addMessageln("Error: " + message);
        }
        Helper.addErrorMessageln = addErrorMessageln;
        /**
        * Infoレベルのメッセージを追加して表示し、<BR/>で改行する。
        * @function
        * @param message エラーメッセージ
        */
        function addInfoMessageln(message) {
            addMessageln("Info: " + message);
        }
        Helper.addInfoMessageln = addInfoMessageln;
        /**
        * userAgentを表示する。
        * @function
        */
        function showUserAgent() {
            addMessage(navigator.userAgent);
        }
        Helper.showUserAgent = showUserAgent;
    })(Helper = CV.Helper || (CV.Helper = {}));
})(CV || (CV = {}));
//# sourceMappingURL=cv.helper.js.map