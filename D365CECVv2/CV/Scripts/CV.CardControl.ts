/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.helper.ts" />
/// <reference path="cv.crmrecord.ts" />
/// <reference path="cv.forcegraph_circleui.ts" />
/// <reference path="cv.forcegraph_rectangleui.ts" />

namespace CV {
    /**
    * カード情報を格納するクラス
    * 表示の実態は d3 を利用している。
    * @class
    */
    export class CardControl {
        /**
        * カードの横幅。単位はpx。
        * css内のdiv.cardのwidthと同じであるべき。
        * @constant
        */
        static CARD_WIDTH = 128;
        /**
        * カードの高さ。単位はpx。
        * @constant
        */
        static CARD_HEIGHT = 40;
        /**
        * 表示名が空の場合に表示する文字列
        * @constant
        */
        static EMPTY_EXPLANATION_STRING = "<<空です>>";
        /**
        * 対応するCRMRecord
        * @property
        */
        CrmRecord: CRMRecord;
        /**
        * 関連するつながりデータを取得済みであるか否か
        * @property
        */
        _areConnectionsRetrieved: boolean;
        /**
        * 関連するつながりデータを取得済みであるか否か
        * getter
        * @property
        */
        get AreConnectionsRetrieved(): boolean {
            return this._areConnectionsRetrieved;
        }
        /**
        * 関連するつながりデータを取得済みであるか否か
        * setter
        * @property
        */
        set AreConnectionsRetrieved(retrieved: boolean) {
            this._areConnectionsRetrieved = retrieved;
            CV.forceGraph.connectionRetrieved(this.CrmRecord.Id, retrieved);
        }
        /**
        * カードの表示名
        */
        DisplayName: string;
        /**
        * カードに表示するレコードの画像
        */
        EntityImage: string;
        /**
        * フォーカスされているか否か
        * @property
        */
        private _isFocused: boolean;
        /**
        * フォーカスされているか否か
        * getter
        * @property
        */
        get IsFocused(): boolean {
            return this._isFocused;
        }
        /**
        * 別ページ／ウィンドウを開くためのURL
        * @property
        */
        NavigateUri: string;
        /**
        * EntityLogicalNameのgetter
        * @property
        */
        get EntityLogicalName(): string {
            return this.CrmRecord.EntityLogicalName;
        }
        /**
        * EntitySchemaNameのgetter
        * @property
        */
        get EntitySchemaName(): string {
            return this.CrmRecord.EntitySchemaName;
        }
        /**
        * ObjectTypeCodeのgetter
        * @property
        */
        get ObjectTypeCode(): number {
            return this.CrmRecord.ObjectTypeCode;
        }
        /**
        * 関連するConnectorControlを保持する配列
        * @property
        */
        connectorColtrolArray: ConnectorControl[];
        /**
        * コンストラクタ
        * @constructor
        */
        constructor(crmRecord: CRMRecord) {
            this.CrmRecord = crmRecord;
            this.connectorColtrolArray = [];
            this._areConnectionsRetrieved = false;
        }
        /**
        * ConnectorControlを追加する。
        * @function
        */
        AddConnectionConltrol(con: ConnectorControl): void {
            this.connectorColtrolArray.push(con);
        }
        /**
        * フォーカスする。同時に、必要なCRMレコード群を取得する非同期処理を実行し、カードやコネクタを表示する。
        * フォーカスした際のUIの変更は、ForceGraph_RectangleUIクラスにて、d3側で実装
        * CardsLayoutManager で管理されるところのカード群が展開されたレイアウトのための処理も扱う。
        * setter
        * @property
        */
        Focus(): void {
            ///console.log("in CardControl.Focus()");

            this._isFocused = true;
            if (CV.connectionViewer.config.CardStyle.toString() == CardStyleEnum[CardStyleEnum.Circle]
                || CV.connectionViewer.config.CardStyle == CardStyleEnum.Circle){
                ForceGraph_CircleUI.focusACardControlByCRMRecordId(this.CrmRecord.Id);
            } else if (CV.connectionViewer.config.CardStyle.toString() == CardStyleEnum[CardStyleEnum.Rectangle]
                || CV.connectionViewer.config.CardStyle == CardStyleEnum.Rectangle)
                ForceGraph_RectangleUI.focusACardControlByCRMRecordId(this.CrmRecord.Id);
            else {
                Helper.addErrorMessageln("CV.connectionViewer.config.CardStyle が不正な値です。既定のカードスタイル 'Circle' を採用します。 in CV.CardControl.Focus()");
                ForceGraph_CircleUI.focusACardControlByCRMRecordId(this.CrmRecord.Id);
            }

            CV.connectionViewer.clm.SetLastFocusedId(this.CrmRecord.Id);

            if (!this.AreConnectionsRetrieved) {
                connectionViewer.crmAccess.retrieveConnAndOTMAndMTOAndMTMRDeferredized(this.CrmRecord)
                    .done((record: CRMRecord) => {
                        ///console.log("retrieveConnectionsAndOneToManyAndManyToOneRelationshipsDeferredized()終了");
                        CV.connectionViewer.clm.AddFocusedId(record.Id);

                        connectionViewer.ShowCardsAndConnectors(
                            record
                            , connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC
                            , connectionViewer.crmAccess.asyncRetrievedConnTargetCRMRecordRetrievedEC
                            , connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic
                            , connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic
                            , connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic
                            , connectionViewer.crmAccess.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic
                        );

                        if (CV.connectionViewer.IS_CardsLaout_Replaying) setTimeout(CV.connectionViewer.clm.nextCardsLayoutReplay, 100);

                        if (CV.connectionViewer.config.SmallerSizeEnabled) CV.forceGraph.changeUISizeForFarCards();
                    });
            } else {
                // ここで、setTImeoutで非同期処理として、上記のCRMアクセスする場合と同じような挙動をさせることが重要。
                // 非同期処理として、、SVG要素の onclick の処理が先に実行するようにする。
                // 先に changeUISizeForFarCards() の処理が走ると想定していない挙動となる。
                setTimeout(() => {
                    if (CV.connectionViewer.config.SmallerSizeEnabled) CV.forceGraph.changeUISizeForFarCards();
                }, 100);
            }
        }
        /**
        * アンフォーカスする。
        * アンフォーカスした際のUIの変更は、ForceGraph_RectangleUIクラスにて、d3側で実装
        * setter
        * @property
        */
        Unfocus() {
            this._isFocused = false;
            ForceGraph_CircleUI.unfocusACardControlByCRMRecordId(this.CrmRecord.Id);
        }
        /**
        * エンティティを表す32pxのアイコンのURLの絶対パスを返す。ホスト名などは含まない。
        * カスタムエンティティは、標準のアイコンから変更できるのだが、未対応。
        * @function
        * @returns {string} "/_imgs/Navbar/ActionImgs/Account_32.png"のような文字列
        */
        GetIcon32Url(): string {
            /*調査したこと
            _imgs\Navbar\ActionImgsフォルダに、
            Account_32.png とか
            Contact_32.png とか
            CustomEntity_32.png とか
            のファイルがアイコンである。
            つまり、エンティティのスキーマ名を使って自動的に生成できる。
            */
            return CardControl.GetIcon32UrlStatic(this.CrmRecord.ObjectTypeCode, this.EntitySchemaName);
        }
        /**
        * エンティティを表す32pxのアイコンのURLの絶対パスを返す。ホスト名などは含まない。
        * カスタムエンティティは、標準のアイコンから変更できるのだが、未対応。
        * @function
        * @returns {string} "/_imgs/Navbar/ActionImgs/Account_32.png"のような文字列
        */
        static GetIcon32UrlStatic(objectTypeCode: number, entitySchemaName: string): string {
            if (objectTypeCode < 10000) {
                var name;
                // 標準エンティティの場合
                if (entitySchemaName == "Incident") name = "Cases";
                else if (entitySchemaName == "SalesOrder") name = "Order";
                else if (entitySchemaName == "SystemUser") name = "User";
                else name = entitySchemaName; // 上記以外の標準エンティティ。これは完全に対応している訳ではない。
                return "/_imgs/Navbar/ActionImgs/" + name + "_32.png";
            } else {
                // カスタムエンティティの場合
                return "/_imgs/Navbar/ActionImgs/CustomEntity_32.png";
            }
        }
        /**
        * 特定のCRMレコードについて、新たにCRMフォームを開く。
        * @function
        * @param elm DOM上の要素
        */
        static OpenNewCRMFormWindow(elm): void {
            if (!connectionViewer.IS_DEMO_MODE) {
                let id = $(elm).parent().attr("id");
                let crmRecord: CRMRecord = null;
                for (let i in connectionViewer.CRMRecordArray) {
                    if (id == CV.IDPrefix + connectionViewer.CRMRecordArray[i].Id) crmRecord = connectionViewer.CRMRecordArray[i];
                }
                if (crmRecord && crmRecord.Card.NavigateUri) window.open(crmRecord.Card.NavigateUri, id, "");
            }
        }
        /**
        * CRMのエンティティとその色の対応を保持する。CRM2015の電話用CRM（ブラウザから利用したもの）を参考にしている。
        * @constant
        */
        static EntityColor = {
            account: "#CE7200"
            , lead: "#3052A6"
            , opportunity: "#3E7239"
            , contact: "#0072C6"
            , incident: "#7A278F"
            , systemuser: "#578837"
            , phonecall: "#C0172B"
            , task: "#C0172B"
            , email: "#C0172B"
            , letter: "#C0172B"
            , appointment: "#C0172B"
            , serviceappointment: "#C0172B"
            , _other: "#0072c6"
        };
        /**
        * CRMの特定エンティティについてのその対応する色を返す。
        * @function
        * @return 色を表す文字列。例："#0072c6"
        * @param entityName {string} エンティティロジカル名
        */
        static getEntityColor(entityName: string): string {
            if (entityName in CardControl.EntityColor) {
                return CardControl.EntityColor[entityName];
            } else {
                return CardControl.EntityColor["_other"];
            }
        }
    }
}