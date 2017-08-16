/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.helper.ts" />
/// <reference path="cv.crmrecord.ts" />
/// <reference path="cv.forcegraph_circleui.ts" />
/// <reference path="cv.forcegraph_rectangleui.ts" />
var CV;
(function (CV) {
    /**
    * カード情報を格納するクラス
    * 表示の実態は d3 を利用している。
    * @class
    */
    var CardControl = (function () {
        /**
        * コンストラクタ
        * @constructor
        */
        function CardControl(crmRecord) {
            this.CrmRecord = crmRecord;
            this.connectorColtrolArray = [];
            this._areConnectionsRetrieved = false;
        }
        Object.defineProperty(CardControl.prototype, "AreConnectionsRetrieved", {
            /**
            * 関連するつながりデータを取得済みであるか否か
            * getter
            * @property
            */
            get: function () {
                return this._areConnectionsRetrieved;
            },
            /**
            * 関連するつながりデータを取得済みであるか否か
            * setter
            * @property
            */
            set: function (retrieved) {
                this._areConnectionsRetrieved = retrieved;
                CV.forceGraph.connectionRetrieved(this.CrmRecord.Id, retrieved);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CardControl.prototype, "IsFocused", {
            /**
            * フォーカスされているか否か
            * getter
            * @property
            */
            get: function () {
                return this._isFocused;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CardControl.prototype, "EntityLogicalName", {
            /**
            * EntityLogicalNameのgetter
            * @property
            */
            get: function () {
                return this.CrmRecord.EntityLogicalName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CardControl.prototype, "EntitySchemaName", {
            /**
            * EntitySchemaNameのgetter
            * @property
            */
            get: function () {
                return this.CrmRecord.EntitySchemaName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CardControl.prototype, "ObjectTypeCode", {
            /**
            * ObjectTypeCodeのgetter
            * @property
            */
            get: function () {
                return this.CrmRecord.ObjectTypeCode;
            },
            enumerable: true,
            configurable: true
        });
        /**
        * ConnectorControlを追加する。
        * @function
        */
        CardControl.prototype.AddConnectionConltrol = function (con) {
            this.connectorColtrolArray.push(con);
        };
        /**
        * フォーカスする。同時に、必要なCRMレコード群を取得する非同期処理を実行し、カードやコネクタを表示する。
        * フォーカスした際のUIの変更は、ForceGraph_RectangleUIクラスにて、d3側で実装
        * CardsLayoutManager で管理されるところのカード群が展開されたレイアウトのための処理も扱う。
        * setter
        * @property
        */
        CardControl.prototype.Focus = function () {
            ///console.log("in CardControl.Focus()");
            this._isFocused = true;
            if (CV.connectionViewer.config.CardStyle.toString() == CV.CardStyleEnum[CV.CardStyleEnum.Circle]
                || CV.connectionViewer.config.CardStyle == CV.CardStyleEnum.Circle) {
                CV.ForceGraph_CircleUI.focusACardControlByCRMRecordId(this.CrmRecord.Id);
            }
            else if (CV.connectionViewer.config.CardStyle.toString() == CV.CardStyleEnum[CV.CardStyleEnum.Rectangle]
                || CV.connectionViewer.config.CardStyle == CV.CardStyleEnum.Rectangle)
                CV.ForceGraph_RectangleUI.focusACardControlByCRMRecordId(this.CrmRecord.Id);
            else {
                CV.Helper.addErrorMessageln("CV.connectionViewer.config.CardStyle が不正な値です。既定のカードスタイル 'Circle' を採用します。 in CV.CardControl.Focus()");
                CV.ForceGraph_CircleUI.focusACardControlByCRMRecordId(this.CrmRecord.Id);
            }
            CV.connectionViewer.clm.SetLastFocusedId(this.CrmRecord.Id);
            if (!this.AreConnectionsRetrieved) {
                CV.connectionViewer.crmAccess.retrieveConnAndOTMAndMTOAndMTMRDeferredized(this.CrmRecord)
                    .done(function (record) {
                    ///console.log("retrieveConnectionsAndOneToManyAndManyToOneRelationshipsDeferredized()終了");
                    CV.connectionViewer.clm.AddFocusedId(record.Id);
                    CV.connectionViewer.ShowCardsAndConnectors(record, CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC, CV.connectionViewer.crmAccess.asyncRetrievedConnTargetCRMRecordRetrievedEC, CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic, CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic, CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic, CV.connectionViewer.crmAccess.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic);
                    if (CV.connectionViewer.IS_CardsLaout_Replaying)
                        setTimeout(CV.connectionViewer.clm.nextCardsLayoutReplay, 100);
                    if (CV.connectionViewer.config.SmallerSizeEnabled)
                        CV.forceGraph.changeUISizeForFarCards();
                });
            }
            else {
                // ここで、setTImeoutで非同期処理として、上記のCRMアクセスする場合と同じような挙動をさせることが重要。
                // 非同期処理として、、SVG要素の onclick の処理が先に実行するようにする。
                // 先に changeUISizeForFarCards() の処理が走ると想定していない挙動となる。
                setTimeout(function () {
                    if (CV.connectionViewer.config.SmallerSizeEnabled)
                        CV.forceGraph.changeUISizeForFarCards();
                }, 100);
            }
        };
        /**
        * アンフォーカスする。
        * アンフォーカスした際のUIの変更は、ForceGraph_RectangleUIクラスにて、d3側で実装
        * setter
        * @property
        */
        CardControl.prototype.Unfocus = function () {
            this._isFocused = false;
            CV.ForceGraph_CircleUI.unfocusACardControlByCRMRecordId(this.CrmRecord.Id);
        };
        /**
        * エンティティを表す32pxのアイコンのURLの絶対パスを返す。ホスト名などは含まない。
        * カスタムエンティティは、標準のアイコンから変更できるのだが、未対応。
        * @function
        * @returns {string} "/_imgs/Navbar/ActionImgs/Account_32.png"のような文字列
        */
        CardControl.prototype.GetIcon32Url = function () {
            /*調査したこと
            _imgs\Navbar\ActionImgsフォルダに、
            Account_32.png とか
            Contact_32.png とか
            CustomEntity_32.png とか
            のファイルがアイコンである。
            つまり、エンティティのスキーマ名を使って自動的に生成できる。
            */
            return CardControl.GetIcon32UrlStatic(this.CrmRecord.ObjectTypeCode, this.EntitySchemaName);
        };
        /**
        * エンティティを表す32pxのアイコンのURLの絶対パスを返す。ホスト名などは含まない。
        * カスタムエンティティは、標準のアイコンから変更できるのだが、未対応。
        * @function
        * @returns {string} "/_imgs/Navbar/ActionImgs/Account_32.png"のような文字列
        */
        CardControl.GetIcon32UrlStatic = function (objectTypeCode, entitySchemaName) {
            if (objectTypeCode < 10000) {
                var name;
                // 標準エンティティの場合
                if (entitySchemaName == "Incident")
                    name = "Cases";
                else if (entitySchemaName == "SalesOrder")
                    name = "Order";
                else if (entitySchemaName == "SystemUser")
                    name = "User";
                else
                    name = entitySchemaName; // 上記以外の標準エンティティ。これは完全に対応している訳ではない。
                return "/_imgs/Navbar/ActionImgs/" + name + "_32.png";
            }
            else {
                // カスタムエンティティの場合
                return "/_imgs/Navbar/ActionImgs/CustomEntity_32.png";
            }
        };
        /**
        * 特定のCRMレコードについて、新たにCRMフォームを開く。
        * @function
        * @param elm DOM上の要素
        */
        CardControl.OpenNewCRMFormWindow = function (elm) {
            if (!CV.connectionViewer.IS_DEMO_MODE) {
                var id = $(elm).parent().attr("id");
                var crmRecord = null;
                for (var i in CV.connectionViewer.CRMRecordArray) {
                    if (id == CV.IDPrefix + CV.connectionViewer.CRMRecordArray[i].Id)
                        crmRecord = CV.connectionViewer.CRMRecordArray[i];
                }
                if (crmRecord && crmRecord.Card.NavigateUri)
                    window.open(crmRecord.Card.NavigateUri, id, "");
            }
        };
        /**
        * CRMの特定エンティティについてのその対応する色を返す。
        * @function
        * @return 色を表す文字列。例："#0072c6"
        * @param entityName {string} エンティティロジカル名
        */
        CardControl.getEntityColor = function (entityName) {
            if (entityName in CardControl.EntityColor) {
                return CardControl.EntityColor[entityName];
            }
            else {
                return CardControl.EntityColor["_other"];
            }
        };
        return CardControl;
    }());
    /**
    * カードの横幅。単位はpx。
    * css内のdiv.cardのwidthと同じであるべき。
    * @constant
    */
    CardControl.CARD_WIDTH = 128;
    /**
    * カードの高さ。単位はpx。
    * @constant
    */
    CardControl.CARD_HEIGHT = 40;
    /**
    * 表示名が空の場合に表示する文字列
    * @constant
    */
    CardControl.EMPTY_EXPLANATION_STRING = "<<空です>>";
    /**
    * CRMのエンティティとその色の対応を保持する。CRM2015の電話用CRM（ブラウザから利用したもの）を参考にしている。
    * @constant
    */
    CardControl.EntityColor = {
        account: "#CE7200",
        lead: "#3052A6",
        opportunity: "#3E7239",
        contact: "#0072C6",
        incident: "#7A278F",
        systemuser: "#578837",
        phonecall: "#C0172B",
        task: "#C0172B",
        email: "#C0172B",
        letter: "#C0172B",
        appointment: "#C0172B",
        serviceappointment: "#C0172B",
        _other: "#0072c6"
    };
    CV.CardControl = CardControl;
})(CV || (CV = {}));
//# sourceMappingURL=CV.CardControl.js.map