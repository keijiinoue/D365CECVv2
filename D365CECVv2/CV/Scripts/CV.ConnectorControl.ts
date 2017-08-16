/// <reference path="cv.helper.ts" />
/// <reference path="cv.cardcontrol.ts" />
/// <reference path="cv.crmlink.ts" />

namespace CV {
    /**
    * コネクタコントロール。つながりあるいはOneToMany関連を表すコントロールを格納するクラス
    * 表示の実態は d3 を利用している。
    * @class
    */
    export class ConnectorControl {
        /**
        * 対応するCRMLinkの配列
        * @property
        */
        CrmLinkArray: CRMLink[];
        private _card1: CardControl;
        /**
        * 関連するCardの1つ目のgetter
        */
        get Card1(): CardControl {
            return this._card1;
        }
        /**
        * 関連するCardの1つ目のsetter
        */
        set Card1(value: CardControl) {
            this._card1 = value;
            this._card1.AddConnectionConltrol(this);
        }
        private _card2: CardControl;
        /**
        * 関連するCardの2つ目のgetter
        */
        get Card2(): CardControl {
            return this._card2;
        }
        /**
        * 関連するCardの2つ目のsetter
        */
        set Card2(value: CardControl) {
            this._card2 = value;
            this._card2.AddConnectionConltrol(this);
        }
        /**
        * @property
        */
        Description: string;
        /**
        * @property
        */
        Role1: string;
        /**
        * @property
        */
        Role2: string;
        /**
        * コンストラクタ
        * @constructor
        */
        constructor(crmLink: CRMLink) {
            this.CrmLinkArray = [];
            this.CrmLinkArray.push(crmLink);
        }
        /**
        * CRMLinkを追加する。
        * @function
        */
        addCRMLink(crmLink: CRMLink) {
            this.CrmLinkArray.push(crmLink);
            this.Description = "<<複数の関係>>";
            this.Role1 = "";
            this.Role2 = "";
        }
        /**
        * このインスタンスが持つCrmLinkArrayの中に、
        * 渡されたCRMLinkと等価な意味合いを持つCRMLinkであると判断できるものがが存在するかどうかを調べる。
        * @function
        * `return {boolean} 存在する場合true
        */
        HaveSameContextInCrmLinkAray(crmLink: CRMLink): boolean {
            for (var i in this.CrmLinkArray) {
                var cl = this.CrmLinkArray[i];
                if (CRMLink.HaveSameContext(cl, crmLink)) return true;
            }
            return false;
        }
    }
}