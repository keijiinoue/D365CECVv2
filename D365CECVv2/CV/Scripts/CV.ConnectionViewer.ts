/// <reference path="cv.cardcontrol.ts" />
/// <reference path="cv.config.ts" />
/// <reference path="cv.configset.ts" />
/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.crmaccesswebapi.ts" />
/// <reference path="cv.crmlink.ts" />
/// <reference path="cv.crmrecord.ts" />
/// <reference path="cv.demo.ts" />
/// <reference path="cv.forcegraph_circleui.ts" />
/// <reference path="cv.forcegraph_rectangleui.ts" />
/// <reference path="cv.helper.ts" />
/// <reference path="cv.options.ts" />
/// <reference path="cv.cardslayoutmanager.ts" />
/// <reference path="cv.cardslayout.ts" />
/// <reference path="../../myjavascriptlibrary/mygenerallibrary.ts" />
/// <reference path="../../scripts/typings/d3/d3.d.ts" />
/// <reference path="../../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../scripts/typings/jquerymobile/jquerymobile.d.ts" />
/// <reference path="typings/my.jquerymobile.d.ts" />
/// <reference path="typings/my.xrm.d.ts" />
/// <reference path="typings/my.d3.d.ts" />

/**
* ConnectionViewer のルートとなるモジュール。
* Dynamics CRM のつながりデータを可視化する。
* D3.jsのforce layoutを使用している。
* @module
*/
namespace CV {
    /**
    * ConnectionViewerインスタンス
    * @var
    */
    export var connectionViewer: ConnectionViewer;
    /**
    * 力学モデルで表現するオブジェクトを管理する。D3.jsのforce layoutを使用。
    * ConnectionViewerインスタンス内に持つと、d3 の on イベント内で呼べないために、ここで宣言する。
    * @var
    */
    export var forceGraph: ForceGraph_RectangleUI | ForceGraph_CircleUI;
    /**
    * idを扱う際のprefix文字列
    * d3で扱うidの文字列として、数字で始まってはいけない可能性あり。
    * @constant
    */
    export var IDPrefix = "id";
    /**
    * つながりビューワーのメインクラス
    * @class
    */
    export class ConnectionViewer {
        /**
        * Dynamics CRMのソリューションの発行者の接頭辞
        * @constant
        */
        static CRM_PUBLISHER_PREFIX = "mskksamp";
        /**
        * Dynamics CRMのソリューションの名前
        * @constant
        */
        static CRM_SOLUTION_NAME = "D365ConnectionViewer";
        /**
        * カード間の距離
        * @constant
        */
        static CARD_DISTANCE = 180;
        /**
        * コンフィグセット。CRMのXmlタイプのWebリソースで管理している。
        * @property
        */
        configSet: ConfigSet;
        /**
        * 現在、キャンバスをドラッグ中であるかどうか
        */
        static isNowDragging = false;
        /**
        * コンフィグ。ユーザー設定（Options）で変更できるようにしている。
        * @property
        */
        config: Config;
        /**
        * 単体デモ モードであるかどうかを格納する。
        * @property
        */
        IS_DEMO_MODE: boolean;
        /**
        * CRMフォーム内で実行されているかどうかを格納する。
        * @property
        */
        IS_IN_CRM_FORM: boolean;
        /**
        * 現在、カードレイアウトのリプレイ中であるかどうかのフラグ
        * @property
        */
        IS_CardsLaout_Replaying: boolean;
        /**
        * エンティティメタデータのキャッシュ。連想配列。
        * キーはエンティティのロジカル名（小文字）。
        * 値はエンティティメタデータ。
        * @object
        */
        EntityMetadataCacheKeyIsEntityLogicalName: { [key: string]: WebAPI.entityMetadataInterface };
        /**
        * エンティティメタデータのキャッシュ。連想配列。
        * キーはエンティティのObjectTypeCode（int）
        * 値はエンティティメタデータ。
        * @object
        */
        EntityMetadataCacheKeyIsObjectTypeCode: { [key: number]: WebAPI.entityMetadataInterface };
        /**
        * エンティティセット名からエンティティのロジカル名を見つけるためのキャッシュ。連想配列。
        * キーはエンティティセット名（小文字）。
        * 値はエンティティのロジカル名。
        * @object
        */
        EntityLogicalNameKeyIsEntitySetName: { [key: string]: string };
        /**
        * OneToManyRelationshipMetadataのキャッシュ。連想配列。
        * メタデータとしては、OneToManyもManyToOneも両方を扱う。
        * キーはOneToManyRelationshipMetadataのSchemaName（大文字小文字を区別する）。
        * 値はOneToManyRelationshipMetadata。
        * @object
        */
        OneToManyRelationshipMetadataCache: { [key: string]: WebAPI.OTMRelationshipInterface };
        /**
        * ManyToManyRelationshipMetadataのキャッシュ。連想配列。
        * キーManyToManyRelationshipMetadataのSchemaName（大文字小文字を区別する）。
        * 値はManyToManyRelationshipMetadata。
        * @object
        */
        ManyToManyRelationshipMetadataCache: { [key: string]: WebAPI.MTMRelationshipInterface };
        /**
        * CardsLayout 保存先のannotationエンティティとメインのカードのエンティティ間のRelationshipMetadataのキャッシュ。
        * 値はManyToManyRelationshipMetadata。
        * @object
        */
        AnnotationRelationshipMetadataCache: WebAPI.OTMRelationshipInterface;
        /**
        * AttributeMetadataCacheのキャッシュ。連想配列。
        * キーは、エンティティのロジカル名（小文字）。
        * 値はさらに連想配列。キーは、AttributeのLogicalName（小文字）値はAttributeMetadata
        * @object
        */
        AttributeMetadataCache: { [key: string]: { [key: string]: WebAPI.attributeMetadataInterface } };
        /**
        * 取得済みのCRMレコードの配列
        * @property
        */
        CRMRecordArray: CRMRecord[];
        /**
        * 取得済みのCRMコネクションの配列
        * @property
        */
        CRMLinkArray: CRMLink[];
        /**
        * CRMAccessWebAPIインスタンス
        * @property
        */
        crmAccess: CRMAccessWebAPI;
        /**
        * CardsLayoutManagerインスタンス
        * @property
        */
        clm: CardsLayoutManager;
        /**
        * このビューワーが動作するエンティティ論理名。CRMフォームなどから渡されるパラメータのうちの1つ。
        * 小文字で格納する。
        * @property
        */
        paramEntityLogicalName: string;
        /**
        * このビューワーが動作するエンティティレコードのGuid。CRMフォームなどから渡されるパラメータのうちの1つ。
        * 小文字で格納する。
        * @property
        */
        paramGuid: string;
        /**
        * 既に凡例エリアに表示されているエンティティのロジカル名（小文字）の配列
        * @property
        */
        legendAlreadyShownEntityLogicalNameArray: string[];
        /**
        * HTMLのbodyがリサイズされた際に呼び出される。
        * @function
        */
        static bodyResized(): void {
            $("#MySpinnerDiv")
                .css("width", window.innerWidth + "px")
                .css("height", window.innerHeight + "px")
                .css("left", (window.innerWidth - 77) + "px")
                .css("top", (window.innerHeight - 77) + "px");

            if (connectionViewer != null && forceGraph != null) {
                forceGraph.setForceSizeAndStart();
            }
        }
        /**
        * つながりビューワーのメインクラスのコンストラクタ
        * @constructor
        */
        constructor() {
            CV.connectionViewer = this;
            this.CRMRecordArray = [];
            this.CRMLinkArray = [];
            this.crmAccess = new CRMAccessWebAPI(this);
            this.clm = new CardsLayoutManager();

            this.init();
        }
        /**
        * コンストラクタの次に呼ばれる。各種初期処理を行う。
        * @function
        */
        init(): void {
            try {
                this.IS_DEMO_MODE = this.getIsDemoMode();
                ///console.log("IS_DEMO_MODE = ", this.IS_DEMO_MODE);
                this.IS_IN_CRM_FORM = (MyGeneralLibrary.getParams()["id"]) ? true : false; // MyGeneralLibrary.getParams() の戻り値にて、CRMフォーム内で実行しているか否かを判断している。
                ///console.log("IS_IN_CRM_FORM = ", this.IS_IN_CRM_FORM);
                this.IS_CardsLaout_Replaying = (this.getAnnotationIdFromParams()) ? true : false;
                ///console.log("IS_CardsLaout_Replaying = ", this.IS_CardsLaout_Replaying);

                this.initOpenNewWindowButton();

                let entityLogicalNameAndGuidFromParameter = this.getEntityLogicalNameAndGuidFromParameter();
                if (entityLogicalNameAndGuidFromParameter) {
                    this.paramEntityLogicalName = entityLogicalNameAndGuidFromParameter.entityLogicalName.toLowerCase(); // 小文字;
                    this.paramGuid = entityLogicalNameAndGuidFromParameter.guid.toLowerCase(); // 小文字;
                    ///console.log("paramEntityLogicalName = ", this.paramEntityLogicalName, ", paramGuid = ", this.paramGuid);

                    this.crmAccess.retrieveConfigSetXmlTextDeferredized()
                        .then((text: string) => {
                            try {
                                CV.connectionViewer.configSet = ConfigSet.parseConfigSetXmlText(text);
                            } catch (e) {
                                Helper.addErrorMessageln("CV.ConfigSet.parseConfigSetXml()でエラーが発生しました。" + e.message + "プログラム内で用意された既定のConfigSetを利用します。 in init()");
                                CV.connectionViewer.configSet = ConfigSet.getDefaultConfigSet();
                            }

                            CV.connectionViewer.config = CV.Config.initConfigWithOptions(CV.connectionViewer.configSet);
                            if (CV.connectionViewer.config.CardStyle.toString() == CardStyleEnum[CardStyleEnum.Circle]
                                || CV.connectionViewer.config.CardStyle == CardStyleEnum.Circle)
                                CV.forceGraph = new ForceGraph_CircleUI("#MySVGCards", "#MySVGLines", "#MySVGConnectionDescriptions", "#MySVGConnectionRoles");
                            else if (CV.connectionViewer.config.CardStyle.toString() == CardStyleEnum[CardStyleEnum.Rectangle]
                                || CV.connectionViewer.config.CardStyle == CardStyleEnum.Rectangle)
                                CV.forceGraph = new ForceGraph_RectangleUI("#MyCardDiv", "#MyConnectionMaskToClickDiv");
                            else {
                                Helper.addErrorMessageln("CV.connectionViewer.config.CardStyle が不正な値です。既定のカードスタイル 'Circle' を採用します。 in init()");
                                CV.forceGraph = new ForceGraph_CircleUI("#MySVGCards", "#MySVGLines", "#MySVGConnectionDescriptions", "#MySVGConnectionRoles");
                            }
                            CV.forceGraph.initCanvasToDrag();

                            // 単体デモ モードでは、カードレイアウトの管理機能はオフにする
                            if (this.IS_DEMO_MODE) {
                                ///console.log("単体デモ モードでは、カードレイアウトの管理機能はオフにする");
                                CV.connectionViewer.config.CardsLayoutEnabled = false;
                            }
                            if (CV.connectionViewer.config == null) throw "CV.Config.initConfigAndOptions()でエラーが発生しました。オプションで ConfigSet を再度選択頂くことで問題が解決する可能性があります。";

                            CV.connectionViewer.initOptionsPanel();
                        })
                        .then(this.crmAccess.initCRMAccessDeferredized)
                        .then((record: WebAPIRecord) => {
                            // Config の CardsLayoutEnabled をチェックし、メモ機能が有効になっているかなどをチェックして、適切な表示をする。
                            if (CV.connectionViewer.config.CardsLayoutEnabled) {
                                $("#MyCardsLayoutDiv").css("visibility", "visible");
                                if (CV.connectionViewer.AnnotationRelationshipMetadataCache) {
                                    $("#MyCardLayoutAvailableDiv").css("visibility", "visible");
                                    $("#MyCardLayoutUnavailableDiv").css("visibility", "collapse");
                                } else {
                                    $("#MyCardLayoutAvailableDiv").css("visibility", "collapse"); // なぜかこれだけでは領域を占有してしまう。
                                    $("#MyCardLayoutAvailableDiv").css("height", "0px"); // 領域を占有しないように。
                                    $("#MyCardLayoutUnavailableDiv").css("visibility", "visible");
                                }
                            }

                            return CV.connectionViewer.clm.initCardsLayoutReplayDeferredized(record);
                        })
                        .done((recordAndExistCardLayout: { record: WebAPIRecord; existCardLayout: boolean }) => {
                            // MyCardsLayoutRefreshLink の処理
                            if (recordAndExistCardLayout.existCardLayout) {
                                // フォーム内に表示している場合、location.search は以下のような値
                                //   "?OrgLCID=1041&UserLCID=1041&id=%7b0683F907-720F-E711-80E8-480FCFF29761%7d&orgname=org34cba2f6&type=2&typename=contact"
                                // 一方、独立したページで表示している場合、location.search は以下のような値
                                //   "?data=id%3D%7B0683f907-720f-e711-80e8-480fcff29761%7D%26typename%3Dcontact"
                                // どちらにも、data=というパラメータ内で渡す必要がある。
                                let params = MyGeneralLibrary.getParams();
                                let toBeReloadedSearch: string;
                                if (!params["data"]) {
                                    toBeReloadedSearch = location.search;
                                } else {
                                    let dataParams = MyGeneralLibrary.getCRMDataParams();
                                    delete dataParams["annotationId"]; // ここで、既存のannotationIdの要素を削除する。
                                    let dataParamsString = MyGeneralLibrary.getParamsString(dataParams);
                                    params["data"] = encodeURIComponent(dataParamsString);
                                    let paramsString = MyGeneralLibrary.getParamsString(params);

                                    toBeReloadedSearch = "?" + paramsString;
                                }
                                $("#MyCardsLayoutRefreshLink").click(() => {
                                    location.href = "CV.html" + toBeReloadedSearch;
                                });
                                $("#MyCardsLayoutRefreshLink").css("visibility", "visible");
                            }

                            CV.connectionViewer.initialCRMRecordRetrieved(recordAndExistCardLayout.record);
                        }).fail((e) => {
                            Helper.addErrorMessageln(e.toString() + " in init()");
                            ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
                        });
                } else {
                    // フォームのタイプをチェック
                    let formType;
                    if (Xrm.Page.ui != null) {
                        formType = Xrm.Page.ui.getFormType();
                    } else {
                        formType = parent.Xrm.Page.ui.getFormType();
                    }

                    if (formType == 2 // Update 
                        || formType == 3 // Read Only
                        || formType == 4 // Disabled
                    ) {
                        ///console.log("initEntityLogicalNameAndGuidFromParameter()の戻り値が不正です。");
                        throw new Error("initEntityLogicalNameAndGuidFromParameter()の戻り値が不正です。");
                    }
                    else if (formType == 1) {
                        // Create
                        Helper.addInfoMessageln("新規レコード作成時には利用できません。");
                        ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
                    }
                    else {
                        throw new Error("このFormTypeでは利用できません。FormType = " + formType);
                    }
                }
            } catch (e) {
                Helper.addErrorMessageln(e.message + " in init()");
                ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
            }
        }
        /**
        * 新しいウィンドウで表示するボタンを初期化する。
        * CRMフォーム内で実行している場合にそのボタンを表示する。
        * @function
        */
        initOpenNewWindowButton(): void {
            if (this.IS_IN_CRM_FORM) $("#MyOpenNewWindow").css("visibility", "visible");
        }
        /**
        * 単体デモ モードで実行すべきと判断したらtrueを返す。
        * @function
        */
        getIsDemoMode(): boolean {
            return (typeof (Xrm) === "undefined") ? true : false;
        }
        /**
        * CRMレコードのデータの取得を受けて、実際にカードやつながりの描画を開始する。
        * @function
        */
        initialCRMRecordRetrieved(_record: WebAPIRecord): void {
           ///console.log("initialCRMRecordRetrieved()開始");
            var primaryNameAttributeName = this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].PrimaryNameAttribute;
            var primaryImageAttributeName = this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].PrimaryImageAttribute;

            var record = new CRMRecord(
                this.paramGuid
                , this.paramEntityLogicalName
                , this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].SchemaName
                , _record.EntityRecord[primaryNameAttributeName]
                , _record.EntityRecord[primaryImageAttributeName]
                , this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].DisplayName.UserLocalizedLabel.Label
                , this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].ObjectTypeCode
                , _record.EntityRecord
            );

            this.CRMRecordArray.push(record);
            this.showInitialCRMRecord(record);
            this.initTitle(_record.EntityRecord[primaryNameAttributeName]);
        }
        /**
         * URLのパラメーターから、annotationId を取得する。なければ null を返す。
        * @function
         */
        getAnnotationIdFromParams(): string {
            let dataParams = MyGeneralLibrary.getCRMDataParams();
            let annotationId = (dataParams) ? dataParams["annotationId"] : null;

            return annotationId;
        }
        /**
         * CV.connectionViewer.CRMRecordArray の中から、指定した ID を持つものを返す。
         * なければ null を返す。
         * @param id
         */
        findCRMRecordById(id: string): CRMRecord {
            for (let i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                let record = CV.connectionViewer.CRMRecordArray[i];
                if (record.Id == id) return record;
            }
            return null;
        }
        /**
        * WebページのHTMLのタイトルを初期化する。
        * @function
        * @param 対象となるCRMレコードの表示名
        */
        initTitle(name: string): void {
            $("title")[0].textContent = name + " - つながりビューワー";
        }
        /**
        * 対象となるCRMレコードについて、
        * 取得済みのつながりレコードおよびOneToMany関連レコードおよびManyToOne関連レコードを用いて、
        * まだ表示していないコネクターおよび関連するカードを配置して表示する。
        * なお、実際の表示は d3 で行う。
        * @function
        * @param record {CRMRecord} 対象となるCRMレコード
        * @param connectionEntities {WebAPIRecord[]} 取得したつながりレコード群
        * @param connectionTargetCRMEntities {WebAPIRecord[]} 取得したつながりレコード群のターゲットのCRMレコード群
        * @param oneToManyRelationshipEntitiesDic One-To-Manyで取得したレコード群
        * @param manyToOneRelationshipEntitiesDic Many-To-Oneで取得したレコード群
        * @param manyToManyRelationshipEntitiesDic Many-To-Many取得した中間エンティティつながりレコード群
        * @param manyToManyRelationshipTargetCRMEntitiesDic {} Many-To-Many取得したレコード群のターゲットのCRMレコード群を内部に持つ連想配列。キーがMayToManyレコードのID、値が対応するターゲットのCRMレコード群を表すWebAPIRecordを配列化したもの
        */
        ShowCardsAndConnectors(
            record: CRMRecord
            , connectionEntities: WebAPIRecord[]
            , connectionTargetCRMEntities: WebAPIRecord[]
            , oneToManyRelationshipEntitiesDic: { [key: string]: WebAPIRecord[] }
            , manyToOneRelationshipEntitiesDic: { [key: string]: WebAPIRecord[] }
            , manyToManyRelationshipEntitiesDic: { [key: string]: WebAPIRecord[] }
            , manyToManyRelationshipTargetCRMEntitiesDic: { [key: string]: WebAPIRecord[] }): void {
            try {
               ///console.log("ShowCardsAndConnectors()開始");

                var listToBeAddedByConnectionEntities: CRMLink[] = CRMLink.ConvertConnectionEntitiesToCRMLinkList(
                    record
                    , connectionEntities
                    , connectionTargetCRMEntities
                    , CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode
                    , this);
                var listToBeAddedByOneToManyRelationshipEntities: CRMLink[] = CRMLink.ConvertOneToManyRelationshipEntitiesToCRMLinkList(
                    record
                    , oneToManyRelationshipEntitiesDic
                    , CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName
                    , CV.connectionViewer.OneToManyRelationshipMetadataCache
                    , CV.connectionViewer.AttributeMetadataCache);
                var listToBeAddedByManyToOneRelationshipEntities: CRMLink[] = CRMLink.ConvertManyToOneRelationshipEntitiesToCRMLinkList(
                    record
                    , manyToOneRelationshipEntitiesDic
                    , CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName
                    , CV.connectionViewer.OneToManyRelationshipMetadataCache
                    , CV.connectionViewer.AttributeMetadataCache);
                var listToBeAddedByManyToManyEntities: CRMLink[] = CRMLink.ConvertManyToManyEntitiesToCRMLinkList(
                    record
                    , manyToManyRelationshipEntitiesDic
                    , manyToManyRelationshipTargetCRMEntitiesDic
                    , CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName);

                var toBeAddedList: CRMLink[] = [];
                toBeAddedList = listToBeAddedByConnectionEntities.concat(listToBeAddedByOneToManyRelationshipEntities);
                toBeAddedList = toBeAddedList.concat(listToBeAddedByManyToOneRelationshipEntities);
                toBeAddedList = toBeAddedList.concat(listToBeAddedByManyToManyEntities);

                record.CRMLinkArray = toBeAddedList;

                // CV.connectionViewer.CRMLinkArrayに登録する。同時に、CV.forceGraph表示上のカードとリンクを更新する。
                for (var i = 0; i < record.CRMLinkArray.length; i++) {
                    var crmLink: CRMLink = record.CRMLinkArray[i];
                    var alreadyExist = false;
                    var addedAnotherCRMLinkToExistingLink = false;
                    // CV.connectionViewer.CRMLinkArrayのキャッシュに当該CRMLinkが存在していたら以降の処理をパスする。
                    for (var j = 0; j < CV.connectionViewer.CRMLinkArray.length; j++) {
                        var existCrmLink = CV.connectionViewer.CRMLinkArray[j];
                        alreadyExist = existCrmLink.Connector.HaveSameContextInCrmLinkAray(crmLink);

                        // 既存の ConnectorControlおよびリンクに CRMLink インスタンスを紐づける
                        if (!alreadyExist) {


                            if (CRMLink.HaveSameCombinationOfCRMRecords(existCrmLink, crmLink)) {
                                existCrmLink.Connector.addCRMLink(crmLink);
                                crmLink.Connector = existCrmLink.Connector;
                                CV.forceGraph.setMultipleCRMConnetionFound(existCrmLink);
                                addedAnotherCRMLinkToExistingLink = true;
                            }
                        }
                    }
                    if (!alreadyExist && !addedAnotherCRMLinkToExistingLink) {
                        var target: CRMRecord;

                        if (record.Id == crmLink.CRMRecord1.Id) {
                            target = crmLink.CRMRecord2;
                        } else {
                            target = crmLink.CRMRecord1;
                        }

                        // CRMRecordArrayに既にCRMRecordが存在するかどうかをチェックする。
                        var foundRecord: CRMRecord = null; // CRMRecordArrayで見つかった場合に格納する。
                        for (var k = 0; k < this.CRMRecordArray.length; k++) {
                            var existingRecord = this.CRMRecordArray[k];
                            if (existingRecord.Id == target.Id) {
                                foundRecord = existingRecord;
                                break;
                            }
                        }
                        if (!foundRecord) {
                            // CRMRecordArrayに無いCRMRecordをCRMRecordArrayに登録し、処理する。
                            this.CRMRecordArray.push(target);

                            if (CV.connectionViewer.IS_CardsLaout_Replaying) {
                                // リプレイ中の場合
                                let singleCardLayout = CV.connectionViewer.clm.findCardInReplaying(target.Id);
                                if (singleCardLayout) {
                                    // リプレイ中で、保存されているカードが存在した場合
                                    let position = { x: singleCardLayout.X, y: singleCardLayout.Y };
                                    target.CreateCardControlWithDisplayName(position, singleCardLayout.Fixed);
                                } else {
                                    // リプレイ中だけれども、保存されていないカードが存在した場合。
                                    // 保存した後に追加されたレコードがある場合である。
                                    target.CreateCardControlWithDisplayName(null, false);
                                }
                            } else {
                                target.CreateCardControlWithDisplayName(null, false);
                            }
                            this.CheckAndUpdateLegend(target.EntityLogicalName);
                            crmLink.CreateConnector(record.Card, target.Card);
                        } else {
                            // ここは、既にCRMRecordListにキャッシュされているCRMレコードの場合。
                            // 既にコネクタが存在するかどうかを調べる。
                            var connectorWasSet = false;
                            for (var f in foundRecord.CRMLinkArray) {// で、HasSameCombinationOfCRMRecords をしらべて、かつそれがConnectorを持っていたらなにもしない。なければConnectorを作成
                                var conToCheck = foundRecord.CRMLinkArray[f];

                                if (CRMLink.HaveSameContext(crmLink, conToCheck) && conToCheck.Connector != null && crmLink.Connector == null) {
                                    crmLink.Connector = conToCheck.Connector;
                                    connectorWasSet = true;
                                    break;
                                }
                            }
                            if (!connectorWasSet) {
                                // この場合には、既に表示されているカードどおしで、新しいコネクタが作成されることになる。
                                crmLink.CreateConnector(record.Card, foundRecord.Card);
                            }
                        }

                        this.CRMLinkArray.push(crmLink);
                    }
                }

                record.AreConnectionsRetrieved = true;
               ///console.log("ShowCardsAndConnectors()終了");
            } catch (e) {
                        
                        Helper.addErrorMessageln(e.message + " in ShowCardsAndConnectors()");
            }
        }
        /**
        * キャンバスを指定した量だけ移動する
        */
        translateCanvas(x: number, y: number) {
            CV.forceGraph.setCanvasPosition(x, y);
        }
        /**
        * 最初のカードを表示する。
        * @function
        */
        showInitialCRMRecord(record: CRMRecord): void {
            if (CV.connectionViewer.IS_CardsLaout_Replaying) {
                // リプレイ中の場合
                let singleCardLayout = CV.connectionViewer.clm.findCardInReplaying(record.Id);
                if (singleCardLayout) {
                    // リプレイ中で、保存されているカードが存在した場合
                    let position = { x: singleCardLayout.X, y: singleCardLayout.Y };
                    record.CreateCardControlWithDisplayName(position, singleCardLayout.Fixed);
                } else {
                    // リプレイ中だけれども、保存されていないカードが存在した場合。
                    // 実際にどのような場合にこのようなことが起こるかは不明
                    record.CreateCardControlWithDisplayName({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, true);
                }
            } else {
                record.CreateCardControlWithDisplayName({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, true);
            }
            this.clm.PrimaryCRMRecord = record;
            record.Card.Focus();
            this.initLegend();
            this.CheckAndUpdateLegend(record.EntityLogicalName);
        }
        /**
        * 凡例部分のアイコン画像とエンティティ表示名を表示するコントロールの初期化を行う。
        * エンティティ毎のObjectTypeCodeの情報が前もって必要である。
        * @function
        */
        initLegend(): void {
            this.legendAlreadyShownEntityLogicalNameArray = [];
        }
        /**
        * 指定したエンティティの凡例が既に表示しているかどうかチェックして、
        * 表示されていなければ表示する。
        * ただし、CardsLayout のための annotation エンティティは表示しない。
        * @function
        * @param entityLogicalName {string} エンティティのロジカル名
        */
        CheckAndUpdateLegend(entityLogicalName: string): void {
            if (this.legendAlreadyShownEntityLogicalNameArray.indexOf(entityLogicalName) < 0
                && CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName != null
                && (entityLogicalName in CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName)
                && CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName] != null
                && entityLogicalName != "annotation") {
                // アイコン画像URL
                let objectTypeCode = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].ObjectTypeCode;
                let entitySchemaName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].SchemaName;
                let url = CV.CardControl.GetIcon32UrlStatic(objectTypeCode, entitySchemaName);

                // エンティティ表示名
                let entityDisplayName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].DisplayName.UserLocalizedLabel.Label;

                // HTML動的生成
                let MyLegendTable = document.getElementById("MyLegendTable");
                let elemTR = document.createElement("TR");
                let elemTD1 = document.createElement("TD");
                let elemSPAN = document.createElement("SPAN");
                elemSPAN.className = "entityLegend";
                elemSPAN.style.backgroundColor = CV.CardControl.getEntityColor(entityLogicalName);
                elemTD1.appendChild(elemSPAN);
                let elemIMG = document.createElement("IMG");
                elemIMG.className = "cardImage";
                elemIMG.setAttribute("src", url);
                elemIMG.setAttribute("title", entityDisplayName);
                elemSPAN.appendChild(elemIMG);
                let elemTD2 = document.createElement("TD");
                elemTD2.innerHTML = ": " + entityDisplayName;
                elemTR.appendChild(elemTD1);
                elemTR.appendChild(elemTD2);
                MyLegendTable.appendChild(elemTR);

                this.legendAlreadyShownEntityLogicalNameArray.push(entityLogicalName);
            }
        }
        /**
        * オプション パネルを初期化する。事前にconfigSetがCRMから取得されている必要がある。
        * @function
        */
        initOptionsPanel(): void {
            this.initConfigInOptionsPanel();
            if (!CV.connectionViewer.IS_DEMO_MODE) this.initCardsLayoutInOptionPanel();
        }
        /**
        * オプション パネルのコンフィグ部分を初期化する。事前にconfigSetがCRMから取得されている必要がある。
        * @function
        */
        initConfigInOptionsPanel(): void {
           ///console.log("in initOptionsPanel()");
            // 今システムとして既定とみなされるコンフィグ
            var currentDefaultConfig = Config.getCurrentDefaultConfig(CV.connectionViewer.configSet);

            // 最初に、特に指定しない選択肢を表示
            var id = "config" + (0).toString(); // HTML要素としてのid
            var dataCvConfigId = "";
            var displayDataCvConfigId = ""; // コンフィグのID
            var title = "";
            var aText = "特に指定しない";
            var configRemark = "";
            // configRemarkの処理
            if ((!CV.Options.getUserOptions()) || (CV.Options.getUserOptions() && CV.Options.getUserOptions().ConfigID == dataCvConfigId)) {
                // 現在の選択
                configRemark += "[ 現在の選択 ] ";
            }
            var configDescription = "常にシステムで最新の既定のコンフィグを利用します。";

            var $li = $('<li/>');

            // 最初のli
            $li.addClass("ui-first-child");

            var $a = $('<a/>');
            $a.addClass("configItem ui-btn ui-btn-icon-right ui-icon-carat-r");
            $a.attr("id", id);
            $a.attr("data-cv-config-id", dataCvConfigId);
            $a.attr("href", "#");
            $a.attr("data-rel", "close");
            $a.attr("title", title);
            $a.append(aText);

            if (configRemark) {
                var $configRemark = $('<div/>');
                $configRemark.addClass("configRemark");
                $configRemark.append(configRemark);
                $a.append($configRemark);
            }
            if (configDescription) {
                var $configDescription = $('<div/>');
                $configDescription.addClass("configDescription");
                $configDescription.append(configDescription);
                $a.append($configDescription);
            }
            $li.append($a);

            // tap時の挙動を定義
            $li.bind("tap", function (event) {
                var CvConfigId = $(event.target).attr("data-cv-config-id");
                if (!CvConfigId) {
                    CvConfigId = $(event.target).parents("a").attr("data-cv-config-id");
                }

                // 現在のユーザーのオプションと異なるかどうかチェック
                var currentUserOptionsConfigID = "";
                if (CV.Options.getUserOptions()) {
                    currentUserOptionsConfigID = CV.Options.getUserOptions().ConfigID;
                }
                if (CvConfigId != currentUserOptionsConfigID) {
                    // 異なる場合、ユーザーオプションをセット（ブラウザへの保存）
                    var newOption = new CV.Options(CvConfigId);
                    CV.Options.setUserOptions(newOption);
                    setTimeout(function () { location.reload(); }, 200); // 少しだけ間をおいてリロードする。気持ちいい間。
                }
                $('#MyOptionsPanel').panel('close');
            });

            $('#MyListview').append($li);

            // 次に、ConfigSetの内容から選択肢群を表示
            for (var i = 0; i < this.configSet.ConfigArray.length; i++) {
                var config = this.configSet.ConfigArray[i];

                /**
                サンプル。用意したHTMLにはないクラスが追加されている。jQuery Mobileが動的にクラスを追加している。
                    <ul class="ui-listview ui-listview-inset ui-corner-all ui-shadow" data-role="listview" data-inset="true">
                        <li class="ui-first-child">
                            <a title="" class="configItem ui-btn ui-btn-icon-right ui-icon-carat-r" id="config0" href="#" data-rel="close" data-cv-config-id="">
                                特に指定しない
                                <div class="configRemark">[ 現在の選択 ]</div>
                                <div class="configDescription">常にシステムで最新の既定のコンフィグを利用します。</div>
                            </a>
                        </li>
                        <li>
                            <a title="sales" class="configItem ui-btn ui-btn-icon-right ui-icon-carat-r" id="config1" href="#" data-rel="close" data-cv-config-id="sales">
                                sales
                                <div class="configRemark">[ 現在の選択 ] [ 既定 ]</div>
                                <div class="configDescription">営業部門向けのコンフィグです。</div>
                            </a>
                        </li>
                        <li class="ui-last-child">
                            <a title="service" class="configItem ui-btn ui-btn-icon-right ui-icon-carat-r" id="config02" href="#" data-rel="close" data-cv-config-id="service">
                                service
                                <div class="configDescription">サービス部門向けのコンフィグです。</div>
                            </a>
                        </li>
                    </ul>
                */

                var id = "config" + (i + 1).toString(); // HTML要素としてのid
                var dataCvConfigId = config.ID;
                var displayDataCvConfigId = config.ID; // コンフィグのID
                var title = displayDataCvConfigId;
                var aText = config.ID;
                var configRemark = "";
                // configRemarkの処理
                if (CV.Options.getUserOptions() && CV.Options.getUserOptions().ConfigID == dataCvConfigId) {
                    // 現在の選択
                    configRemark += "[ 現在の選択 ] ";
                }
                if (config.ID == currentDefaultConfig.ID) {
                    // 既定
                    configRemark += "[ 既定 ]";
                }
                var configDescription = config.Description;

                var $li = $('<li/>');

                if (i == this.configSet.ConfigArray.length - 1) {
                    // 最後のli
                    $li.addClass("ui-last-child");
                }

                var $a = $('<a/>');
                $a.addClass("configItem ui-btn ui-btn-icon-right ui-icon-carat-r");
                $a.attr("id", id);
                $a.attr("data-cv-config-id", dataCvConfigId);
                $a.attr("href", "#");
                $a.attr("data-rel", "close");
                $a.attr("title", title);
                $a.append(aText);

                if (configRemark) {
                    var $configRemark = $('<div/>');
                    $configRemark.addClass("configRemark");
                    $configRemark.append(configRemark);
                    $a.append($configRemark);
                }
                if (configDescription) {
                    var $configDescription = $('<div/>');
                    $configDescription.addClass("configDescription");
                    $configDescription.append(configDescription);
                    $a.append($configDescription);
                }
                $li.append($a);

                // tap時の挙動を定義
                $li.bind("tap", function (event) {
                    var CvConfigId = $(event.target).attr("data-cv-config-id");
                    if (!CvConfigId) {
                        CvConfigId = $(event.target).parents("a").attr("data-cv-config-id");
                    }

                    // 現在のユーザーのオプションと異なるかどうかチェック
                    var currentUserOptionsConfigID = "";
                    if (CV.Options.getUserOptions()) {
                        currentUserOptionsConfigID = CV.Options.getUserOptions().ConfigID;
                    }
                    if (CvConfigId != currentUserOptionsConfigID) {
                        // 異なる場合、ユーザーオプションをセット（ブラウザへの保存）
                        var newOption = new CV.Options(CvConfigId);
                        CV.Options.setUserOptions(newOption);
                        setTimeout(function () { location.reload(); }, 200); // 少しだけ間をおいてリロードする。気持ちいい間。
                    }
                    $('#MyOptionsPanel').panel('close');
                });

                $('#MyListview').append($li);
            }
        }
        /**
        * オプション パネルの展開されたカードレイアウト部分を初期化する。
        * 対象となっているエンティティで、メモ機能が有効になっていない場合には、カードレイアウト機能は利用できない。
        * 後にinit()内でメモ機能が有効になっていることを判断して表示するようにする。
        * @function
        */
        initCardsLayoutInOptionPanel(): void {
            // ここでメモ機能が有効になっているかをチェックしたいが、この時点ではそもそも読み込んでいないのでNG。何もしない。collapseのまま。
            if (CV.connectionViewer.config.CardsLayoutEnabled) {
                $("#MyCardsLayoutDescriptionInput").val(CV.connectionViewer.config.DefaultCardsLayoutDescription);

                $("#MyCardsLayoutSaveButton").bind("tap", (event) => {
                    CV.connectionViewer.clm.SaveCurrentCardsLayoutDeferredized($("#MyCardsLayoutDescriptionInput").val())
                        .then(() => {
                            CV.Helper.addMessageln("展開されたカードレイアウトのデータが保存されました。")
                        })
                        .fail((e) => {

                            CV.Helper.addErrorMessageln(e.toString() + " in initCardsLayoutInOptionPanel()");
                        });
                });

                $("#MyCardsLayoutLoadButton").bind("tap", (event) => {
                    try {
                        CV.connectionViewer.clm.LoadCardsLayoutListDeferredized()
                            .then((list: CRMAnnocationRecord[]) => {
                                $("#MyCardsLayoutListview").empty();

                                if (list.length == 0) {
                                    let $li = $('<li/>');
                                    $li.append("一件もありません。");
                                    $("#MyCardsLayoutListview").append($li);
                                    $("#MyCardsLayoutListview").listview("refresh"); // 再描画して、縦に適切なスクロールができるようにする。
                                }
                                else {
                                    for (let i = 0; i < list.length; i++) {
                                        let annotation = list[i];

                                        /* サンプル
                                        <ul id="MyCardsLayoutListview" data-role="listview" data-inset="true">
                                            <li class="ui-first-child">
                                                <a title="" class="ui-btn ui-btn-icon-right ui-icon-carat-r" id="cardslayout0" href="#" data-rel="close" data-cv-annotation-id="aaaa">
                                                    <div class="cardlayoutTitleItem">2017/04/09 16:08</div>
                                                    <div class="cardlayoutItem">職歴にフォーカスしたもの</div>
                                                    <div class="cardlayoutItem">作成者: ユーザー 太郎</div>
                
                                                </a>
                                            </li>
                                            <li>
                                                <a title="sales" class="ui-btn ui-btn-icon-right ui-icon-carat-r" id="cardslayout1" href="#" data-rel="close" data-cv-annotation-id="bbbbb">
                                                    <div class="cardlayoutTitleItem">2017/03/09 16:08</div>
                                                    <div class="cardlayoutItem">プライベートな付き合いを表すレイアウト</div>
                                                    <div class="cardlayoutItem">作成者: ユーザー 太郎</div>
                                                </a>
                                            </li>
                                            <li class="ui-last-child">
                                                <a title="service" class="ui-btn ui-btn-icon-right ui-icon-carat-r" id="cardslayout2" href="#" data-rel="close" data-cv-annotation-id="ccccc">
                                                    <div class="cardlayoutTitleItem">日時日本3</div>
                                                    <div class="cardlayoutItem">作成者: ユーザー 太郎</div>
                                                </a>
                                            </li>
                                        </ul>
                                        */

                                        let id = "cardslayout" + (i + 0).toString(); //HTML要素としてのid
                                        let annotationId = annotation.Id;
                                        let createdon = annotation.CreatedonFormattedValue;
                                        let description = annotation.Notetext;
                                        let createdby = annotation.CreatedbyFormattedValue;

                                        let $li = $('<li/>');
                                        if (i == 0) $li.addClass("ui-first-child");
                                        else if (i == list.length - 1) $li.addClass("ui-last-child");

                                        let $a = $('<a/>');
                                        $a.addClass("ui-btn ui-btn-icon-right ui-icon-carat-r");
                                        $a.attr("id", id);
                                        $a.attr("data-cv-annotation-id", annotationId);
                                        $a.attr("href", "#");
                                        $a.attr("data-rel", "close");
                                        $a.attr("title", description + "\n作成日時: " + createdon + "\n作成者: " + createdby);

                                        if (description) {
                                            let $description = $('<div/>');
                                            $description.addClass("cardlayoutDescriptionItem");
                                            $description.append(description);
                                            $a.append($description);
                                        }

                                        if (createdon) {
                                            let $createdon = $('<div/>');
                                            $createdon.addClass("cardlayoutItem");
                                            $createdon.append("作成日時: " + createdon);
                                            $a.append($createdon);
                                        }

                                        if (createdby) {
                                            let $createdby = $('<div/>');
                                            $createdby.addClass("cardlayoutItem");
                                            $createdby.append("作成者: " + createdby);
                                            $a.append($createdby);
                                        }
                                        $li.append($a);

                                        // tap時の挙動を定義
                                        $li.bind("tap", (event) => {
                                            let CvAnnotationId = $(event.target).attr("data-cv-annotation-id");
                                            if (!CvAnnotationId) {
                                                CvAnnotationId = $(event.target).parents("a").attr("data-cv-annotation-id");
                                            }

                                            // パラメーターを渡してリロードする。 
                                            setTimeout(() => {
                                                // フォーム内に表示している場合、location.search は以下のような値
                                                //   "?OrgLCID=1041&UserLCID=1041&id=%7b0683F907-720F-E711-80E8-480FCFF29761%7d&orgname=org34cba2f6&type=2&typename=contact"
                                                // 一方、独立したページで表示している場合、location.search は以下のような値
                                                //   "?data=id%3D%7B0683f907-720f-e711-80e8-480fcff29761%7D%26typename%3Dcontact"
                                                // どちらにも、data=というパラメータ内で渡す必要がある。
                                                let params = MyGeneralLibrary.getParams();
                                                let annotationParam = "annotationId=" + CvAnnotationId;
                                                let toBeReloadedSearch: string;
                                                if (!params["data"]) {
                                                    toBeReloadedSearch = location.search + "&data=" + encodeURIComponent(annotationParam);
                                                } else {
                                                    let dataParams = MyGeneralLibrary.getCRMDataParams();
                                                    dataParams["annotationId"] = CvAnnotationId; // ここで、既存のannotationIdの値が渡されていたとしても、上書きする。
                                                    let dataParamsString = MyGeneralLibrary.getParamsString(dataParams);
                                                    params["data"] = encodeURIComponent(dataParamsString);
                                                    let paramsString = MyGeneralLibrary.getParamsString(params);

                                                    toBeReloadedSearch = "?" + paramsString;
                                                }

                                                location.search = toBeReloadedSearch;
                                            }, 200); // 少しだけ間をおいてリロードする。気持ちいい間。

                                            $('#MyOptionsPanel').panel('close');
                                        });

                                        $("#MyCardsLayoutListview").append($li);
                                        $("#MyCardsLayoutListview").listview("refresh"); // 再描画して、縦に適切なスクロールができるようにする。
                                    }
                                }
                                $("#MyCardsLayoutCancelButton").css("visibility", "visible");
                            }).fail((e) => {
                                CV.Helper.addErrorMessageln(e.toString() + " in initCardsLayoutInOptionPanel()");
                            });
                    } catch (e) {
                        CV.Helper.addErrorMessageln(e.toString() + " in initCardsLayoutInOptionPanel()");
                    }
                });
            }
        }
        /**
        * 現在 非同期処理を実行中であることを示す
        * @function
        * @param {boolean} show 表示する場合にはtrue、表示しない場合にはfalseを指定する。
        */
        static showCurrentlyRetrievingStoryboard(show: boolean): void {
            $("#MySpinnerDiv").css("visibility", show ? "visible" : "hidden");
        }
        /**
        * このHTMLページへのパラメータから、CRMのエンティティ名（ロジカル名）とGUIDを取得する。
        * @function
        * @return { entityLogicalName: string; guid: string } ただし、エラーが発生したらnullを返す。
        */
        getEntityLogicalNameAndGuidFromParameter(): { entityLogicalName: string; guid: string } {
            try {
                var id, entityName;

                // idの文字をtrimする。
                // CRM2015Updateまでは{D1A44731-A697-E411-80C5-00155D5CDC71}のように{}を含む。CRM2015Update1では%7bA52D1120-ECFA-E411-80DE-C4346BC520C0%7dのように%7bと%7dを含む。
                var trim = function (idStr) {
                    var trimmedId;
                    if (idStr[0] == "{") trimmedId = idStr.substr(1, id.length - 2);
                    else if (idStr.substr(0, 3).toLowerCase() == "%7b") trimmedId = idStr.substr(3, id.length - 6);
                    else if (idStr != null && idStr != "") trimmedId = idStr; // v9.0 for Unified Interface
                    else trimmedId = null;

                    return trimmedId;
                }

                if (this.IS_DEMO_MODE) {
                    // var primaryRecord = Demo_Data.getPrimaryRecord();
                    // id = primaryRecord.getId(CV.connectionViewer); これは動作しない。エンティティメタデータを取得する前だから。
                    // entityName = primaryRecord.getEntityLogicalName(CV.connectionViewer); これは動作しない。エンティティメタデータを取得する前だから。
                    id = Demo_Data.getEntityLogicalNameAndGuidFromParameter().guid;
                    entityName = Demo_Data.getEntityLogicalNameAndGuidFromParameter().entityLogicalName;
                } else {
                    // CRMフォーム内で有効
                    var params = MyGeneralLibrary.getParams();
                    id = params["id"]; // CRM2015Updateまでは{D1A44731-A697-E411-80C5-00155D5CDC71}のように{}を含む。CRM2015Update1では%7bA52D1120-ECFA-E411-80DE-C4346BC520C0%7dのように%7bと%7dを含む。
                    if (id) {
                        this.IS_IN_CRM_FORM = true;
                        id = trim(id);
                        entityName = params["typename"];
                    } else {
                        this.IS_IN_CRM_FORM = false;
                        // 独立したウィンドウで表示している場合に有効
                        params = MyGeneralLibrary.getCRMDataParams();
                        id = params["id"];
                        id = trim(id);
                        entityName = params["typename"];
                    }
                }
               ///console.log("paramGuid = ", id, ", paramEntityLogicalName = ", entityName);

                return {
                    entityLogicalName: entityName,
                    guid: id
                };
            }
            catch (e) {
                return null;
            }
        }
        /**
        * iOSのSafariでタッチ操作するとページをスクロールしようとする挙動を止める。
        * @function
        */
        static preventSafariTouchScroll(): void {
            $("div#MyCardConnectionDiv").bind("touchstart", function () {
                event.preventDefault();
            });
        }
        /**
        * CRMフォーム内にiframeで埋め込むと、なぜかbodyのスタイルシートのtouch-action属性がnoneではなく、autoに変わってしまう。動的に変える関数。
        * @function
        */
        static changeTouchActionStyle(): void {
            $("body").css("touch-action", "none");
           ///console.log("bodyのtouch-action: ", $("body").css("touch-action"));
        }
        /**
        * 新しいウィンドウを開く。パラメーターは同じものを渡す。
        * @function
        */
        static openNewWindow(): void {
            var id = CV.connectionViewer.paramGuid;
            var entityLogicalName = CV.connectionViewer.paramEntityLogicalName;
            window.open(Xrm.Page.context.getClientUrl() + "/WebResources/" + CV.ConnectionViewer.CRM_PUBLISHER_PREFIX + "_/" + CV.ConnectionViewer.CRM_SOLUTION_NAME + "/CV/CV.html?data=id%3D%7B" + id + "%7D%26typename%3D" + entityLogicalName);
        }
        /**
        * つながりビューワーの処理の起点
        * @function
        */
        static run(): void {
            new CV.ConnectionViewer();

            CV.ConnectionViewer.preventSafariTouchScroll();
            CV.ConnectionViewer.changeTouchActionStyle();
        }
    }
}
