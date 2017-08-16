/// <reference path="cv.helper.ts" />
/// <reference path="cv.cardcontrol.ts" />
/// <reference path="cv.crmlink.ts" />
var CV;
(function (CV) {
    /**
    * コネクタコントロール。つながりあるいはOneToMany関連を表すコントロールを格納するクラス
    * 表示の実態は d3 を利用している。
    * @class
    */
    var ConnectorControl = (function () {
        /**
        * コンストラクタ
        * @constructor
        */
        function ConnectorControl(crmLink) {
            this.CrmLinkArray = [];
            this.CrmLinkArray.push(crmLink);
        }
        Object.defineProperty(ConnectorControl.prototype, "Card1", {
            /**
            * 関連するCardの1つ目のgetter
            */
            get: function () {
                return this._card1;
            },
            /**
            * 関連するCardの1つ目のsetter
            */
            set: function (value) {
                this._card1 = value;
                this._card1.AddConnectionConltrol(this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConnectorControl.prototype, "Card2", {
            /**
            * 関連するCardの2つ目のgetter
            */
            get: function () {
                return this._card2;
            },
            /**
            * 関連するCardの2つ目のsetter
            */
            set: function (value) {
                this._card2 = value;
                this._card2.AddConnectionConltrol(this);
            },
            enumerable: true,
            configurable: true
        });
        /**
        * CRMLinkを追加する。
        * @function
        */
        ConnectorControl.prototype.addCRMLink = function (crmLink) {
            this.CrmLinkArray.push(crmLink);
            this.Description = "<<複数の関係>>";
            this.Role1 = "";
            this.Role2 = "";
        };
        /**
        * このインスタンスが持つCrmLinkArrayの中に、
        * 渡されたCRMLinkと等価な意味合いを持つCRMLinkであると判断できるものがが存在するかどうかを調べる。
        * @function
        * `return {boolean} 存在する場合true
        */
        ConnectorControl.prototype.HaveSameContextInCrmLinkAray = function (crmLink) {
            for (var i in this.CrmLinkArray) {
                var cl = this.CrmLinkArray[i];
                if (CV.CRMLink.HaveSameContext(cl, crmLink))
                    return true;
            }
            return false;
        };
        return ConnectorControl;
    }());
    CV.ConnectorControl = ConnectorControl;
})(CV || (CV = {}));
//# sourceMappingURL=cv.connectorcontrol.js.map