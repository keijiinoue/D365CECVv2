/// <reference path="../../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.helper.ts" />
/// <reference path="cv.crmrecord.ts" />
/// <reference path="cv.webapirecord.ts" />
/// <reference path="cv.connectionviewer.ts" />
/// <reference path="typings/my.sdk.webapiquery.js.d.ts" />

namespace CV {
    /**
    * Dynamics 365 (CRM) にアクセスするクラス
    * Dynamics 365 Web API を利用している。
    * @class
    */
    export class CRMAccessWebAPI {
        /**
        * 一度の Web API リクエストでの最大で取得するレコード数。Web API の仕様から、5000 以下である必要がある。
        */
        static readonly MaxPageSize = 5000;
        /**
        * ConnectionViewer への参照
        */
        connectionViewer: ConnectionViewer;
        /**
        * 取得過程のエンティティメタデータのオブジェクトが値に入るディクショナリ。
        * キーはエンティティのロジカル名（小文字）
        */
        asyncEMRetrievedEMDicLogical: { [key: string]: WebAPI.entityMetadataInterface };
        /**
        * 取得過程のエンティティメタデータのオブジェクトが値に入るディクショナリ。
        * キーはエンティティのObjectTypeCode
        */
        asyncEMRetrievedEMDicOTC: { [key: number]: WebAPI.entityMetadataInterface };
        /**
        * 取得過程のエンティティセット名からエンティティのロジカル名を見つけるためのディクショナリ。
        * キーはエンティティセット名（小文字）。
        * 値はエンティティのロジカル名。
        * @object
        */
        asyncEMRetrievedEMDicEntitySetName: { [key: string]: string };
        /**
        * 取得過程のOneToManyRelationshipMetadataのオブジェクトが値に入る連想配列。
        * キーはOneToManyRelationshipMetadataのスキーマ名（大文字小文字を区別する）
        * @property
        */
        asyncOTMRetrievedMetadataDicSchema: { [key: string]: WebAPI.OTMRelationshipInterface };
        /**
        * 取得過程のManyToOneRelationshipMetadataのオブジェクトが値に入る連想配列。
        * キーはManyToOneRelationshipMetadataのスキーマ名（大文字小文字を区別する）
        * @property
        */
        asyncMTORetrievedMetadataDicSchema: { [key: string]: WebAPI.OTMRelationshipInterface };
        /**
        * 取得過程のManyToManyRelationshipMetadataのオブジェクトが値に入る連想配列。
        * キーはManyToManyRelationshipMetadataのスキーマ名（大文字小文字を区別する）
        * @property
        */
        asyncMTMRetrievedMetadataDicSchema: { [key: string]: WebAPI.MTMRelationshipInterface };
        /**
        * 一度の非同期処理で取得したCRMつながりレコード群の配列
        * @property
        */
        asyncRetrievedConnRetrievedEC: WebAPIRecord[];
        /**
        * 一度の非同期処理で取得したCRMつながりレコード群 asyncRetrievedConnRetrievedEC の際に
        * 対応するターゲットのCRMレコード群として取得したもののエンティティロジカル名とレコードオブジェクトの配列
        * @property
        */
        asyncRetrievedConnTargetCRMRecordRetrievedEC: WebAPIRecord[];
        /**
        * 一度の非同期処理でOneToMany関連で取得したCRMレコード（Entity）群を格納する連想配列
        * キーはOneToManyRelationshipMetadataのSchemaName
        * 値は、キーとなるOneToManyRelationshipMetadataに関して検索して取得したレコード群(entity)を格納する配列
        * @property
        */
        asyncRetrievedOTMRRetrievedECDic: { [key: string]: WebAPIRecord[] };
        /**
        * 一度の非同期処理でManyToOne関連で取得したCRMレコード（Entity）群を格納する連想配列
        * キーはOneToManyRelationshipMetadataのSchemaName
        * 値は、キーとなるOneToManyRelationshipMetadataに関して検索して取得したレコード群(entity)を格納する配列
        * @property
        */
        asyncRetrievedMTORRetrievedECDic: { [key: string]: WebAPIRecord[] };
        /**
        * 一度の非同期処理でManyToMany関連で取得したCRMレコード（Entity）群（中間エンティティレコード群）を格納する連想配列
        * キーはManyToManyRelationshipMetadataのSchemaName
        * 値は、キーとなるManyToManyRelationshipMetadataに関して検索して取得したレコード群(entity)を格納する配列
        * @property
        */
        asyncRetrievedMTMRRetrievedECDic: { [key: string]: WebAPIRecord[] };
        /**
        * 一度の非同期処理で取得したManyToManyレコード群 asyncRetrievedMTMRRetrievedECDic の際に
        * 対応するターゲットのCRMレコード群として取得したもののを含む連想配列
        * キーがMayToManyレコードのID、値が対応するターゲットのCRMレコード群を表すEntityCollectionを配列化したもの
        * @property
        */
        asyncRetrievedMTMRTargetCRMRecordRetrievedECDic: { [key: string]: WebAPIRecord[] };
        /**
        * コンストラクタ
        * @constructor
        */
        constructor(connectionViewer: ConnectionViewer) {
            this.connectionViewer = connectionViewer;
            this.asyncOTMRetrievedMetadataDicSchema = {};
            this.asyncMTORetrievedMetadataDicSchema = {};
            this.asyncMTMRetrievedMetadataDicSchema = {};
            this.asyncEMRetrievedEMDicLogical = {};
            this.asyncEMRetrievedEMDicOTC = {};
            this.asyncEMRetrievedEMDicEntitySetName = {};
        }
        /**
        * 最初のDynamics CRMアクセスを行う。
        * メタデータの取得・キャッシュ、および対象CRMレコードの取得を行う。
        * JQueryPromiseで１件のレコードを返す。
        * @function
        */
        initCRMAccessDeferredized(): JQueryPromise<WebAPIRecord> {
            ///console.log("initCRMAccess()開始");
            var deferred: JQueryDeferred<WebAPIRecord> = $.Deferred<WebAPIRecord>();

            ConnectionViewer.showCurrentlyRetrievingStoryboard(true);
            CV.connectionViewer.crmAccess.initCRMMetadataCacheDeferredized()
                .then(CV.connectionViewer.crmAccess.initCRMRecordAccessDeferredized)
                .done(function (record: WebAPIRecord) {
                    ///console.log("initCRMAccess()最終");
                    ///console.log("false");
                    ConnectionViewer.showCurrentlyRetrievingStoryboard(false);

                    deferred.resolve(record);
                }).fail(function (e) {
                    deferred.reject(e.toString());
                });

            return deferred.promise();
        }
        /**
        * Dynamics CRM にアクセスしてメタデータを取得・キャッシュするための一連の処理を行う。
        * @function
        */
        initCRMMetadataCacheDeferredized(): JQueryPromise<void> {
            ///console.log("initCRMMetadataCacheDeferredized()開始");
            var deferred: JQueryDeferred<void> = $.Deferred<void>();

            $.Deferred<void>().resolve().promise().then(function () {
                return CV.connectionViewer.crmAccess.initAllMetadataCacheDeferredized();
            }).done(function () {
                ///console.log("initCRMMetadataCacheDeferredized()最終");

                deferred.resolve();
            }).fail(function (e) {
                deferred.reject(e.toString());
            });

            return deferred.promise();
        }
        /**
        * すべてのメタデータのキャッシュを取得する。
        * OneToManyRelationshipおよびManyToManyRelationshipのメタデータを先に取得する。
        * 次に、Entityのメタデータを取得する。この時、Configで指定したエンティティに加えて、
        * OneToManyRelationshipおよびManyToManyRelationshipに関係するEntityについても取得する。
        * 次に、取得済みのAttributeMetadataを、扱いやすいようにキャッシュする。
        * @function
        */
        initAllMetadataCacheDeferredized(): JQueryPromise<void> {
            ///console.log("initAllMetadataCachesDeferredized()開始");

            let deferred: JQueryDeferred<void> = $.Deferred<void>();

            $.Deferred<void>().resolve().promise().then(function () {
                return CV.connectionViewer.crmAccess.initRelationshipMetadataCacheDeferredized();
            }).then((entityList: string[]) => {
                return CV.connectionViewer.crmAccess.initEntityMetadataCacheDeferredized(entityList);
            }).fail((e) => {
                deferred.reject(e.toString());
            }).then(() => {
                // CRM2013ConnectionViewer時代のInitAttributeMetadataCaches(); に相当する部分。
                // 既にAttributeメタデータは取得している。
                CV.connectionViewer.AttributeMetadataCache = {};

                for (let entityName in CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName) {
                    for (let i = 0; i < CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityName].Attributes.length; i++) {
                        let attributeMetadata = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityName].Attributes[i];
                        if (CV.connectionViewer.AttributeMetadataCache[entityName] == null) {
                            CV.connectionViewer.AttributeMetadataCache[entityName] = {};
                        }
                        CV.connectionViewer.AttributeMetadataCache[entityName][attributeMetadata.LogicalName] = attributeMetadata;
                    }
                }
                ///console.log("initAllMetadataCachesDeferredized()終了");

                deferred.resolve();
            });

            return deferred.promise();
        }
        /**
        * OneToManyRelationshipMetadata、ManyToOneRelationshipMetadataおよびManyToManyRelationshipMetadataを取得し、
        * CV.connectionViewer.OneToManyRelationshipMetadataCache、CV.connectionViewer.ManyToOneRelationshipMetadataCacheおよびCV.connectionViewer.ManyToManyRelationshipMetadataCacheに各々キャッシュする。
        * 同時に、それらを取得する過程で得たエンティティメタデータについても、
        * CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalNameとCV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCodeにキャッシュする。
        * @function
        * @returns {JQueryPromise<string[]>} 関連メタデータの取得過程で判明した、それらが関係するエンティティのロジカル名の配列
        */
        initRelationshipMetadataCacheDeferredized(): JQueryPromise<string[]> {
            ///console.log("in initRelationshipMetadataCacheDeferredized()");

            let deferred: JQueryDeferred<string[]> = $.Deferred<string[]>();
            let entityList: string[];
            $.Deferred<void>().resolve().promise().then(function () {
                try {
                    return CV.connectionViewer.crmAccess.retrieveRMCacheDeferredized(CV.connectionViewer.config.RelationshipSchemaNameList);
                } catch (e) {
                    deferred.reject(e.message);
                }
            }).then((list: string[]) => {
                entityList = list;
                CV.connectionViewer.OneToManyRelationshipMetadataCache = CV.connectionViewer.crmAccess.asyncOTMRetrievedMetadataDicSchema;
                CV.connectionViewer.ManyToManyRelationshipMetadataCache = CV.connectionViewer.crmAccess.asyncMTMRetrievedMetadataDicSchema;
                ///console.log("retrieveRelationshipMetadataCacheDeferredized()終了");
                try {
                    return CV.connectionViewer.crmAccess.retrieveAnnotationRMCacheDeferredized(CV.connectionViewer.paramEntityLogicalName);
                } catch (e) {
                    deferred.reject(e.message);
                }
            }).then((annotationRM: WebAPI.OTMRelationshipInterface) => {
                CV.connectionViewer.AnnotationRelationshipMetadataCache = annotationRM;

                ///console.log("retrieveAnnotationRMCacheDeferredized()終了");
                deferred.resolve(entityList);
            }).fail((e) => {
                deferred.reject(e.toString());
            });

            return deferred.promise();
        }
        /**
        * CRMにアクセスして OneToManyRelationshipMetadata と ManyToManyRelationSHipMetadata を取得し、キャッシュする。
        * @function
        * @param asyncRMToBeRetrievedList {string[]} 取得すべき関連付けのスキーマ名のリスト
        * @returns {JQueryPromise<string[]>} srting[]は、関係するエンティティ論理名のリスト。重複はない。
        */
        retrieveRMCacheDeferredized(asyncRMToBeRetrievedList: string[]): JQueryPromise<string[]> {
            let deferred: JQueryDeferred<string[]> = $.Deferred<string[]>();

            if (0 < asyncRMToBeRetrievedList.length) {
                if (CV.connectionViewer.IS_DEMO_MODE) {
                    try {
                        let relationshipArray: any[] = CV.Demo_Data.RelationshipMetadataSample;
                        // 1:N の 1側 あるいは N側 、およびN:Nの両側のエンティティの論理名を格納するリスト。重複データは格納しない。
                        let entityList: string[] = [];

                        for (let i in relationshipArray) {
                            let relationship = relationshipArray[i];
                            if (0 <= relationship["@odata.type"].indexOf("OneToManyRelationshipMetadata")) {
                                let otmRelationship: WebAPI.OTMRelationshipInterface = relationship;
                                CV.connectionViewer.crmAccess.asyncOTMRetrievedMetadataDicSchema[otmRelationship.SchemaName] = otmRelationship;

                                if (entityList.indexOf(relationship.ReferencedEntity) < 0) entityList.push(relationship.ReferencedEntity);
                                if (entityList.indexOf(relationship.ReferencingEntity) < 0) entityList.push(relationship.ReferencingEntity);
                            } else if (0 <= relationship["@odata.type"].indexOf("ManyToManyRelationshipMetadata")) {
                                let mtmRelationship: WebAPI.MTMRelationshipInterface = relationship;
                                CV.connectionViewer.crmAccess.asyncMTMRetrievedMetadataDicSchema[mtmRelationship.SchemaName] = mtmRelationship;

                                if (entityList.indexOf(mtmRelationship.Entity1LogicalName) < 0) entityList.push(mtmRelationship.Entity1LogicalName);
                                if (entityList.indexOf(mtmRelationship.Entity2LogicalName) < 0) entityList.push(mtmRelationship.Entity2LogicalName);
                                if (entityList.indexOf(mtmRelationship.IntersectEntityName) < 0) entityList.push(mtmRelationship.IntersectEntityName);
                            }
                        }

                        deferred.resolve(entityList);
                        setTimeout(function () {
                            ///console.log("retrieveRMCacheDeferredized() 最終");
                            deferred.resolve(entityList);
                        }, Demo_Const.CRMSdkResponseTime);
                    } catch (error) {
                        deferred.reject("このHTMLファイルは単体デモモードでは利用できません。");
                    }
                } else {
                    // 例： /RelationshipDefinitions?$filter=SchemaName eq 'contact_customer_accounts' or SchemaName eq 'account_parent_account' or SchemaName eq 'opportunitycompetitors_association'
                    let uri = "/RelationshipDefinitions";

                    // $filterの文字列を生成
                    for (let i = 0; i < asyncRMToBeRetrievedList.length; i++) {
                        if (i == 0) uri += "?$filter=";
                        else uri += " or ";
                        uri += "SchemaName eq '" + asyncRMToBeRetrievedList[i] + "'";
                    }

                    ///console.log("uri = " + uri);
                    WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                        .then((request) => {
                            let relationshipArray: any[] = JSON.parse(request.response).value;
                            // 1:N の 1側 あるいは N側 、およびN:Nの両側のエンティティの論理名を格納するリスト。重複データは格納しない。
                            let entityList: string[] = [];

                            for (let i in relationshipArray) {
                                let relationship = relationshipArray[i];
                                if (0 <= relationship["@odata.type"].indexOf("OneToManyRelationshipMetadata")) {
                                    let otmRelationship: WebAPI.OTMRelationshipInterface = relationship;
                                    CV.connectionViewer.crmAccess.asyncOTMRetrievedMetadataDicSchema[otmRelationship.SchemaName] = otmRelationship;

                                    if (entityList.indexOf(relationship.ReferencedEntity) < 0) entityList.push(relationship.ReferencedEntity);
                                    if (entityList.indexOf(relationship.ReferencingEntity) < 0) entityList.push(relationship.ReferencingEntity);
                                } else if (0 <= relationship["@odata.type"].indexOf("ManyToManyRelationshipMetadata")) {
                                    let mtmRelationship: WebAPI.MTMRelationshipInterface = relationship;
                                    CV.connectionViewer.crmAccess.asyncMTMRetrievedMetadataDicSchema[mtmRelationship.SchemaName] = mtmRelationship;

                                    if (entityList.indexOf(mtmRelationship.Entity1LogicalName) < 0) entityList.push(mtmRelationship.Entity1LogicalName);
                                    if (entityList.indexOf(mtmRelationship.Entity2LogicalName) < 0) entityList.push(mtmRelationship.Entity2LogicalName);
                                    if (entityList.indexOf(mtmRelationship.IntersectEntityName) < 0) entityList.push(mtmRelationship.IntersectEntityName);
                                }
                            }

                            ///console.log("retrieveRMCacheDeferredized() 最終");
                            deferred.resolve(entityList);
                        })
                        .catch(function (e) { deferred.reject(e.message); });
                }
            }
            else {
                ///console.log("Relationship取得すべきメタデータの対象エンティティはありません。");
                deferred.resolve();
            }
            return deferred.promise();
        }
        /**
        * CRMにアクセスして CardsLayout 保存先のannotationエンティティとメインのカードのエンティティ間の RelationshipMetadata を取得し、キャッシュする。
        * @function
        * @param entityLogicalName {string} メインのカードのエンティティ論理名
        * @@returns {JQueryPromise<WebAPI.OTMRelationshipInterface>} 取得した RelationshipMetadata
        */
        retrieveAnnotationRMCacheDeferredized(entityLogicalName: string): JQueryPromise<WebAPI.OTMRelationshipInterface> {
            let deferred: JQueryDeferred<WebAPI.OTMRelationshipInterface> = $.Deferred<WebAPI.OTMRelationshipInterface>();

            if (CV.connectionViewer.IS_DEMO_MODE) {
                let otmRelationship = CV.Demo_Data.AnnotationRelationshipMetadataSample;

                setTimeout(() => {
                    ///console.log("retrieveAnnotationRMCacheDeferredized() 最終");
                    deferred.resolve(otmRelationship);
                }, Demo_Const.CRMSdkResponseTime);
            } else {
                // 例： /RelationshipDefinitions/Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata?$filter=ReferencedEntity eq 'contact' and ReferencingEntity eq 'annotation' and ReferencingAttribute eq 'objectid'
                let uri = "/RelationshipDefinitions/Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata?$filter=ReferencedEntity eq '";
                uri += CV.connectionViewer.paramEntityLogicalName
                uri += "' and ReferencingEntity eq 'annotation' and ReferencingAttribute eq 'objectid'";

                ///console.log("uri = " + uri);
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then((request) => {
                        let relationshipArray: any[] = JSON.parse(request.response).value;
                        let otmRelationship: WebAPI.OTMRelationshipInterface = relationshipArray[0] // 1件しかないはず

                        ///console.log("retrieveAnnotationRMCacheDeferredized() 最終");
                        deferred.resolve(otmRelationship);
                    });
            }
            return deferred.promise();
        }
        /**
        * エンティティメタデータを取得し、キャッシュする。
        * @function
        * @param entityListFromRelationship {string[]} 関連メタデータ取得の過程で判明した関係するエンティティのロジカル名の配列
        */
        initEntityMetadataCacheDeferredized(entityListFromRelationship: string[]): JQueryPromise<void> {
            ///console.log("in initEntityMetadataCacheDeferredized()");
            let deferred: JQueryDeferred<void> = $.Deferred<void>();

            $.Deferred<void>().resolve().promise().then(function () {
                // まずは、つながりデータと3種の関連で関係するすべてにおいて、メタデータをキャッシュしておくべきエンティティをリストアップする。
                // つながり
                let entitiesToBeCached: string[] = [].concat(entityListFromRelationship);
                for (let i = 0; i < CV.connectionViewer.config.EntitiesForConnectionList.length; i++) {
                    let entityName = CV.connectionViewer.config.EntitiesForConnectionList[i];
                    if (entitiesToBeCached.indexOf(entityName) < 0) entitiesToBeCached.push(entityName);
                }
                // 「つながり」エンティティ自身も追加する
                if (entitiesToBeCached.indexOf("connection") < 0) entitiesToBeCached.push("connection");

                return CV.connectionViewer.crmAccess.retrieveEMCacheDeferredized(entitiesToBeCached);
            }).fail((e) => {
                deferred.reject(e.toString());
            }).then(() => {
                CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName = CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicLogical;
                CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode = CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicOTC;
                CV.connectionViewer.EntityLogicalNameKeyIsEntitySetName = CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicEntitySetName;

                deferred.resolve();
            });
            return deferred.promise();
        }
        /**
        * CRMにアクセスしてEntityMetadataを取得し、キャッシュする。
        * @function
        * @param asyncEMToBeRetrievedEMList {string[]} 対象となるエンティティ名の配列
        */
        retrieveEMCacheDeferredized(asyncEMToBeRetrievedEMList: string[]): JQueryPromise<void> {
            ///console.log("in retrieveEMCacheDeferredized()");
            ///console.log("asyncEMToBeRetrievedEMList: " + asyncEMToBeRetrievedEMList.join(", "));

            var deferred: JQueryDeferred<void> = $.Deferred<void>();

            // CV.connectionViewer.crmAccess.asyncEMToBeRetrievedEntityMetadataList にあるエンティティのメタデータを実際にCRMから取得する。
            if (CV.connectionViewer.IS_DEMO_MODE) {
                for (let i in CV.Demo_Data.EntityMetadataSample) {
                    let entity = CV.Demo_Data.EntityMetadataSample[i];

                    CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicLogical[entity.LogicalName] = entity;
                    CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicOTC[entity.ObjectTypeCode] = entity;
                    CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicEntitySetName[entity.EntitySetName] = entity.LogicalName;
                }

                setTimeout(function () {
                    ///console.log("retrieveEMCacheDeferredized() 最終");
                    deferred.resolve();
                }, Demo_Const.CRMSdkResponseTime);
            } else {
                // 例： /EntityDefinitions?$select=LogicalName,EntitySetName,ObjectTypeCode,PrimaryIdAttribute,PrimaryImageAttribute,PrimaryNameAttribute,SchemaName,DisplayName&$filter=LogicalName eq 'contact' or LogicalName eq 'account'&$expand=Attributes($select=AttributeType,SchemaName,DisplayName,LogicalName,IsPrimaryId,IsPrimaryName;$filter=IsPrimaryId eq true or IsPrimaryName eq true or AttributeType eq Microsoft.Dynamics.CRM.AttributeTypeCode'Lookup' or AttributeType eq Microsoft.Dynamics.CRM.AttributeTypeCode'Customer' or AttributeType eq Microsoft.Dynamics.CRM.AttributeTypeCode'Uniqueidentifier')
                let uri = "/EntityDefinitions?$select=LogicalName,EntitySetName,ObjectTypeCode,PrimaryIdAttribute,PrimaryImageAttribute,PrimaryNameAttribute,SchemaName,DisplayName&$filter=";

                // $filterの文字列を生成
                for (let i = 0; i < asyncEMToBeRetrievedEMList.length; i++) {
                    if (i > 0) uri += " or ";
                    uri += "LogicalName eq '" + asyncEMToBeRetrievedEMList[i] + "'";
                }
                uri += "&$expand=Attributes($select=AttributeType,SchemaName,DisplayName,LogicalName,IsPrimaryId,IsPrimaryName;$filter=IsPrimaryId eq true or IsPrimaryName eq true or AttributeType eq Microsoft.Dynamics.CRM.AttributeTypeCode'Lookup' or AttributeType eq Microsoft.Dynamics.CRM.AttributeTypeCode'Customer' or AttributeType eq Microsoft.Dynamics.CRM.AttributeTypeCode'Uniqueidentifier')";

                ///console.log("uri = " + uri);
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then((request) => {
                        let entityMultiple: WebAPI.entityMultipleResponseInterface = JSON.parse(request.response);
                        let entityArray: WebAPI.entityMetadataInterface[] = entityMultiple.value;

                        for (let i in entityArray) {
                            let entity = entityArray[i];

                            CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicLogical[entity.LogicalName] = entity;
                            CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicOTC[entity.ObjectTypeCode] = entity;
                            CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicEntitySetName[entity.EntitySetName] = entity.LogicalName;
                        }
                        ///console.log("retrieveEMCacheDeferredized() 最終");
                        deferred.resolve();
                    })
                    .catch((e) => { deferred.reject(e.message + " in retrieveEMCacheDeferredized()"); });
            }
            return deferred.promise();
        }
        /**
        * Dynamics CRM にアクセスして対象CRMレコードの取得する処理を行う。
        * メタデータの取得・キャッシュは既に済んでいる。
        * JQueryPromise<any>で1件のレコードを返す。
        * @function
        */
        initCRMRecordAccessDeferredized(): JQueryPromise<WebAPIRecord> {
            ///console.log("initCRMRecordAccessDeferredized()開始");
            let deferred: JQueryDeferred<WebAPIRecord> = $.Deferred<WebAPIRecord>();

            if (CV.connectionViewer.IS_DEMO_MODE) {
                let webAPIRecord = CV.Demo_Data.getPrimaryRecord();

                setTimeout(function () {
                    ///console.log("initCRMRecordAccessDeferredized()最終");
                    deferred.resolve(webAPIRecord);
                }, Demo_Const.CRMSdkResponseTime);
            } else {
                let entityLogicalName = CV.connectionViewer.paramEntityLogicalName;
                let id = CV.connectionViewer.paramGuid;

                if (CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName]) {
                    // ManyToOneRelationshipのあるレコードについても最低限のデータを取得する。Sdk.Soap.js 時代 はLookupフィールドの取得だけで良かった。
                    // 例： /opportunities(4883f907-720f-e711-80e8-480fcff29761)?$select=opportunityid,name,parentaccountid&$expand=parentaccountid($select=accountid,name) ⇒ これを例にする。
                    // 例： /opportunities(4883f907-720f-e711-80e8-480fcff29761)?$select=opportunityid,name,parentaccountid,parentcontactid&$expand=parentaccountid($select=accountid,name),parentcontactid($select=contactid,fullname)

                    let entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName; // "opportunities"
                    let primaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryIdAttribute; // "opportunityid"
                    let primaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryNameAttribute; // "name"
                    let primaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryImageAttribute; // null とか、 "entityimage"
                    // ManyToOne関連のCRMレコードを取得すべきところのOneToManyRelationshipMetadataを格納した配列
                    let manyToOneRelationshipMetadataArray: WebAPI.OTMRelationshipInterface[] = CV.connectionViewer.crmAccess.getManyToOneRelationshipMetadataArray(entityLogicalName);
                    // ManyToOne関連のCRMレコードを取得すべきところのOneToManyRelationshipMetadataのスキーマ名を格納した配列
                    let manyToOneSchemaNames: string[] = []; // ["opportunity_parent_account"]
                    let manyToOneNavPropName: string[] = []; // ["parentaccountid"]
                    for (let i in manyToOneRelationshipMetadataArray) {
                        let mtorm = manyToOneRelationshipMetadataArray[i];
                        if (mtorm.ReferencingEntity == entityLogicalName) {
                            manyToOneSchemaNames.push(mtorm.SchemaName);
                            manyToOneNavPropName.push(mtorm.ReferencingEntityNavigationPropertyName);
                        }
                    }
                    let columnsList: string[] = [].concat(primaryIdAttributeName, primaryNameAttributeName, primaryImageAttributeName, manyToOneNavPropName);
                    // $selectの文字列を生成
                    let uri = "/" + entitySetName + "(" + id + ")?$select=";
                    for (let i = 0; i < columnsList.length; i++) {
                        if (columnsList[i]) {
                            if (i > 0) uri += ",";
                            uri += columnsList[i];
                        }
                    }
                    // $expandの文字列を生成
                    for (let i = 0; i < manyToOneSchemaNames.length; i++) {
                        if (i == 0) { uri += "&$expand="; }
                        else { uri += ","; }
                        uri += manyToOneNavPropName[i] + "($select=";
                        let expEntityLogicalName = CV.connectionViewer.OneToManyRelationshipMetadataCache[manyToOneSchemaNames[i]].ReferencedEntity; // "account"
                        let expPrimaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].PrimaryIdAttribute; // "accountid"
                        uri += expPrimaryIdAttributeName;
                        let expPrimaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].PrimaryNameAttribute; // "name"
                        uri += "," + expPrimaryNameAttributeName;
                        let expPrimaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].PrimaryImageAttribute; // null とか "entityimage"
                        if (expPrimaryImageAttributeName) uri += "," + expPrimaryImageAttributeName;
                        uri += ")";
                    }

                    ///console.log("uri = " + uri);
                    WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                        .then((request) => {
                            // 1件のレコードが返される
                            let record = JSON.parse(request.response);
                            let webAPIRecord = CV.WebAPIRecord.CreateWebAPIRecordSingle(record);
                            ///console.log("initCRMRecordAccessDeferredized()最終");
                            deferred.resolve(webAPIRecord);
                        })
                        .catch(function (e) { deferred.reject(e.message); });
                } else {
                    deferred.reject("エンティティ " + entityLogicalName + " のメタデータが取得済みではありません。Configで当該エンティティが設定されていることを確認ください。");
                }
            }

            return deferred.promise();
        }
        /**
        * 特定のCRMレコードについての、
        * ①つながり(VisualはConnector)、および
        * ②One-to-Many関係のCRMレコード、および
        * ③Many-to-One関係のCRMレコード、および
        * ④Many-to-Many関係のCRMレコード を取得する非同期処理をして、表示する。
        * この4つの非同期処理は並列処理する。
        * 1段階のつながり、およびOne-to-Many、Many-to-One、Many-to-Many関係だけを表示する。
        * （つながりやxx関係などの）コネクタのカードについての、つながり、One-to-Many関係先、Many-to-One関係先、Many-to-Many関係先の
        * については何もしないため、そのCRMレコードの有無は不明。
        * @function
        * @param record {CRMRecord} 起点となるCRMレコード
        */
        retrieveConnAndOTMAndMTOAndMTMRDeferredized(record: CRMRecord): JQueryPromise<CRMRecord> {
            var deferred: JQueryDeferred<CRMRecord> = $.Deferred<CRMRecord>();
            ///console.log("retrieveConnAndOTMAndMTOAndMTMRDeferredized()開始");

            $.when(
                this.retrieveConnDeferredized(record), // つながりデータの取得
                this.retrieveOTMRCRMRecordsDeferredized(record), // One-to-Manyデータの取得
                this.retrieveMTORCRMRecordsDeferredized(record), // Many-to-Oneデータの取得
                this.retrieveMTMRCRMRecordsDeferredized(record) // Many-to-Manyデータの取得
            ).done(() => {
                ///console.log("retrieveConnAndOTMAndMTOAndMTMRDeferredized()におけるすべての非同期処理が終了");
                deferred.resolve(record);
            }).fail((e) => {
                ///console.log("failed in retrieveConnAndOTMAndMTOAndMTMRDeferredized()");
                deferred.reject(e);
            });

            return deferred.promise(record);
        }
        /**
        * 特定のCRMレコードに関連するつながりレコード群を取得し、グローバル変数に格納する。
        * CRM2013時代はStartRetrieveConnectionsAsync()
        * @function
        * @param record {CRMRecord} 対象となる特定のCRMレコード
        */
        retrieveConnDeferredized(record: CRMRecord): JQueryPromise<void> {
            var deferred: JQueryDeferred<void> = $.Deferred<void>();
            ///console.log("in retrieveConnDeferredized()");
            this.asyncRetrievedConnRetrievedEC = null;

            // つながりレコードはGUI上で1つのつながりを登録すると、CRM内部として2つのつながりレコードが生成される。
            // （つながり元とつながり先それぞれにセットされた2つのレコード）
            // ここでは、つながり元（CRMRecord1）が対象CRMレコードにヒットするものだけを検索する。
            if (CV.connectionViewer.IS_DEMO_MODE) {
                setTimeout(function () {
                    let webAPIRecordArray = CV.Demo_Data.getConnectionRecords(record);

                    CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC = webAPIRecordArray;
                    CV.connectionViewer.crmAccess.retrieveConnTargetCRMRecordsDeferredized(CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC)
                        .done(() => {
                            ///console.log("retrieveConnDeferredized() 最終");
                            deferred.resolve();
                        });
                }, Demo_Const.CRMSdkResponseTime);
            } else {
                // 例：
                // <fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
                //   <entity name='connection'>
                //     <attribute name='connectionid' />
                //     <attribute name='description' />
                //     <attribute name='record1id' />
                //     <attribute name='record1objecttypecode' />
                //     <attribute name='record1roleid' />
                //     <attribute name='record2id' />
                //     <attribute name='record2objecttypecode' />
                //     <attribute name='record2roleid' />
                //     <attribute name='relatedconnectionid' />
                //     <filter type='and'>
                //       <condition attribute='record1id' operator='eq' uiname='' uitype='contact' value='{XXXXXXXXX}' />
                //     </filter>
                //   </entity>
                // </fetch>
                //
                // 上記を encodeURI() すると以下になる。← WebAPI.requestの中で encodeURI するので、ここでは必要ない。
                //   %3Cfetch%20version='1.0'%20output-format='xml-platform'%20mapping='logical'%20distinct='false'%3E%20%20%3Centity%20name='connection'%3E%20%20%20%20%3Cattribute%20name='connectionid'%20/%3E%20%20%20%20%3Cattribute%20name='description'%20/%3E%20%20%20%20%3Cattribute%20name='record1id'%20/%3E%20%20%20%20%3Cattribute%20name='record1objecttypecode'%20/%3E%20%20%20%20%3Cattribute%20name='record1roleid'%20/%3E%20%20%20%20%3Cattribute%20name='record2id'%20/%3E%20%20%20%20%3Cattribute%20name='record2objecttypecode'%20/%3E%20%20%20%20%3Cattribute%20name='record2roleid'%20/%3E%20%20%20%20%3Cattribute%20name='relatedconnectionid'%20/%3E%20%20%20%20%3Cfilter%20type='and'%3E%20%20%20%20%20%20%3Ccondition%20attribute='record1id'%20operator='eq'%20uiname=''%20uitype='contact'%20value='%7BXXXXXXXXX%7D'%20/%3E%20%20%20%20%3C/filter%3E%20%20%3C/entity%3E%3C/fetch%3E
                // 以下を利用する。
                //   "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>  <entity name='connection'>    <attribute name='connectionid' />    <attribute name='description' />    <attribute name='record1id' />    <attribute name='record1objecttypecode' />    <attribute name='record1roleid' />    <attribute name='record2id' />    <attribute name='record2objecttypecode' />    <attribute name='record2roleid' />    <attribute name='relatedconnectionid' />    <filter type='and'>      <condition attribute='record1id' operator='eq' uiname='' uitype='contact' value='{XXXXXXXXX}' />    </filter>  </entity></fetch>"

                let uri = "/connections?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>  <entity name='connection'>    <attribute name='connectionid' />    <attribute name='description' />    <attribute name='record1id' />    <attribute name='record1objecttypecode' />    <attribute name='record1roleid' />    <attribute name='record2id' />    <attribute name='record2objecttypecode' />    <attribute name='record2roleid' />    <attribute name='relatedconnectionid' />    <filter type='and'>      <condition attribute='record1id' operator='eq' uiname='' uitype='";
                uri += record.EntityLogicalName;
                uri += "' value='{";
                uri += record.Id;
                uri += "}' />    </filter>  </entity></fetch>";

                ///console.log("uri = " + uri);
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then((request) => {
                        // 複数件が返される
                        let recordArray: WebAPIRecord[] = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));

                        CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC = recordArray;

                        return CV.connectionViewer.crmAccess.retrieveConnTargetCRMRecordsDeferredized(CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC);
                    }).then(() => {
                        ///console.log("retrieveConnDeferredized() 最終");
                        deferred.resolve();
                    })
                    .catch((e) => {
                        ///console.log("catched in retrieveConnDeferredized()");
                        deferred.reject(e.message);
                    });
            }

            return deferred.promise();
        }
        /**
        * 特定のCRMレコードに関連するつながりレコード群のターゲットとなるCRMレコードを取得し、グローバル変数に格納する。
        * つながりレコードは取得できても、ターゲットとなるCRMレコードは取得できない場合もある。
        * @function
        */
        retrieveConnTargetCRMRecordsDeferredized(connectionRecords: WebAPIRecord[]): JQueryPromise<void> {
            ///console.log("in retrieveConnTargetCRMRecordsDeferredized()");
            this.asyncRetrievedConnTargetCRMRecordRetrievedEC = [];

            var promises = [];

            // 配列に対して、パラレルに非同期処理を実行して、そのすべてが終わるのを待つ。
            $.each(connectionRecords, function (index: string, connectionRecord: WebAPIRecord): JQueryPromise<void> {
                var deferred: JQueryDeferred<void> = $.Deferred<void>();
                ///console.log("In retrieveConnTargetCRMRecordsDeferredized: index=" + index);

                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        // 1件のレコードが返される
                        let webAPIRecord: WebAPIRecord = CV.Demo_Data.getConnectionTargetCRMRecords(connectionRecord);

                        if (webAPIRecord) CV.connectionViewer.crmAccess.asyncRetrievedConnTargetCRMRecordRetrievedEC.push(webAPIRecord);
                        ///console.log("retrieveConnTargetCRMRecordsDeferredized() 最終");
                        deferred.resolve();
                    }, Demo_Const.CRMSdkResponseTime);
                } else {
                    // Sdk.Soap.js 時代と違って Web API では、record2id 側のエンティティ論理名を取得できない。代わりにobjectTypeCodeは取得できる。
                    //var entityLogicalName = connectionRecord.view().attributes["record2id"].value.Type;
                    let objectTypeCode = connectionRecord.EntityRecord["record2objecttypecode"];
                    let emCache = CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[objectTypeCode];
                    if (!emCache) {
                        // この時、カードのリプレイ中などの時に、現在の Config では対象としていないエンティティのデータを扱おうとしている
                        deferred.resolve();
                    } else {
                        let entityLogicalName = CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[objectTypeCode].LogicalName;

                        if (0 <= CV.connectionViewer.config.EntitiesForConnectionList.indexOf(entityLogicalName)) {
                            // 例： /contacts(fc82f907-720f-e711-80e8-480fcff29761)?$select=contactid,fullname,entityimage
                            let entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[objectTypeCode].EntitySetName;
                            let uri = "/" + entitySetName + "(" + connectionRecord.EntityRecord["_record2id_value"] + ")";

                            // $select部分
                            uri += "?$select=";
                            let primaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryIdAttribute;
                            uri += primaryIdAttributeName;
                            let primaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryNameAttribute;
                            uri += "," + primaryNameAttributeName;
                            let primaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryImageAttribute;
                            if (primaryImageAttributeName) uri += "," + primaryImageAttributeName;

                            WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                                .then((request) => {
                                    // 1件のレコードが返される
                                    let record = JSON.parse(request.response);
                                    let webAPIRecord = CV.WebAPIRecord.CreateWebAPIRecordSingle(record);
                                    if (webAPIRecord) CV.connectionViewer.crmAccess.asyncRetrievedConnTargetCRMRecordRetrievedEC.push(webAPIRecord);
                                    ///console.log("retrieveConnTargetCRMRecordsDeferredized() 最終");
                                    deferred.resolve();
                                })
                                .catch((e) => {
                                    if (!CV.CRMAccessWebAPI.IsIgnorableError(e.message)) {
                                        Helper.addErrorMessageln(e.message);
                                    }
                                    //deferred.reject(e.message); // 権限不足によるエラーの場合など、エラーメッセージは表示するが処理は実行するので、rejectではない。
                                    deferred.resolve();
                                });
                        } else {
                            deferred.resolve();
                        }
                    }
                }
                promises.push(deferred);

                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        }
        /**
        * 指定されたCRMレコードに関係するMany-to-Many関連付けのすべてについて、
        * CRMレコードを取得し、グローバル変数 asyncRetrievedMTMRRetrievedECDic に格納する。
        * @function
        * @param record {CRMRecord} 対象となる特定のCRMレコード
        */
        retrieveMTMRCRMRecordsDeferredized(record: CRMRecord): JQueryPromise<void> {
            let deferred: JQueryDeferred<void> = $.Deferred<void>();

            if (CV.connectionViewer.ManyToManyRelationshipMetadataCache != null) {
                this.asyncRetrievedMTMRRetrievedECDic = null;

                // 非同期でManyToMany関連のCRMレコードを取得すべきところのManyToManyRelationshipMetadataを格納した配列
                let paramManyToManyRelationshipMetadataArray: WebAPI.MTMRelationshipInterface[] = [];

                // ConfigSet の情報とマッチングさせなくてよいはず。
                for (let k in CV.connectionViewer.ManyToManyRelationshipMetadataCache) {
                    let mtmrm = CV.connectionViewer.ManyToManyRelationshipMetadataCache[k];

                    if (mtmrm.Entity1LogicalName == record.EntityLogicalName || mtmrm.Entity2LogicalName == record.EntityLogicalName) {
                        paramManyToManyRelationshipMetadataArray.push(mtmrm);
                    }
                }

                this.retrieveMTMRCRMRecordsByEachRelationshipDeferredized(record, paramManyToManyRelationshipMetadataArray)
                    .done(function () {
                        ///console.log("retrieveMTMRCRMRecordsDeferredized()最終");

                        deferred.resolve();
                    });
            }

            return deferred.promise();
        }
        /**
        * 指定されたCRMレコードに関係して、関連するMany-to-Many関連付けをパラメータで受け取り、そのすべてについて、
        * CRMレコードを取得し、グローバル変数 asyncRetrievedMTMRRetrievedECDic に格納する。
        * @function
        * @param record {CRMRecord} 対象となる特定のCRMレコード
        * @param relationships 関連するMany-to-Many関連付けメタデータの配列
        */
        retrieveMTMRCRMRecordsByEachRelationshipDeferredized(crmRecord: CRMRecord, relationships: any[]): JQueryPromise<void> {
            let promises = [];

            // 配列に対して、パラレルに非同期処理を実行して、そのすべてが終わるのを待つ。
            $.each(relationships, function (index: string, mtmrm: WebAPI.MTMRelationshipInterface): JQueryPromise<void> {
                let deferred: JQueryDeferred<void> = $.Deferred<void>();
                ///console.log("In retrieveMTMRCRMRecordsByEachRelationshipDeferredized: index=" + index + ", value=" + mtmrm.SchemaName);

                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        // 未実装
                        ///console.log("retrieveMTMRCRMRecordsByEachRelationshipDeferredized() 最終 未実装");
                        deferred.resolve();
                    }, Demo_Const.CRMSdkResponseTime);
                } else {
                    // Sdk.Soap.js 時代と同様に、中間エンティティに対するクエリを投げる。
                    //
                    // 例： crmRecord.EntityLogicalName が "opportunity"だとして、mtmrm.SchemaName が "opportunitycompetitors_association" の時、
                    //        Entity1LogicalName: "opportunity"
                    //        Entity2LogicalName: "competitor"
                    //        Entity2NavigationPropertyName: "opportunitycompetitors_association"
                    //        IntersectEntityName: "opportunitycompetitors"
                    //      である。"opportunitycompetitors" エンティティのエンティティセット名は "opportunitycompetitorscollection"、PrimaryIdAttribute は "opportunitycompetitorid"
                    //      リクエスト
                    //        /opportunitycompetitorscollection?$filter=opportunityid eq 4883f907-720f-e711-80e8-480fcff29761
                    //      レスポンス
                    //        data.context: "https://yourcrminstance.crm7.dynamics.com/api/data/v8.1/$metadata#opportunitycompetitorscollection"
                    //        value: Array(3)
                    //        ->0: Object
                    //          ->@odata.etag: "W/"1043800""
                    //          ->competitorid: "978ec042-b82b-e711-80f0-480fcff2f771"
                    //          ->opportunitycompetitorid: "9c8ec042-b82b-e711-80f0-480fcff2f771"
                    //          ->opportunityid: "4883f907-720f-e711-80e8-480fcff29761"
                    //        ->1: Object
                    //        ->2: Object
                    //
                    let entityLogicalName = mtmrm.IntersectEntityName; // "opportunitycompetitors_association"
                    let entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName; // "opportunitycompetitorscollection"
                    let primaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[crmRecord.EntityLogicalName].PrimaryIdAttribute; // "opportunityid"
                    let referencedId = crmRecord.Id; // "4883f907-720f-e711-80e8-480fcff29761"

                    // $selectの文字列を生成
                    let uri = "/" + entitySetName;

                    // $filterの文字列を生成
                    uri += "?$filter=" + primaryIdAttributeName + " eq " + referencedId;

                    ///console.log("uri = " + uri);
                    WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                        .then((request) => {
                            // 複数件が返される
                            let recordArray: WebAPIRecord[] = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));

                            if (CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic == null) {
                                CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic = {};
                            }

                            for (let i = 0; i < recordArray.length; i++) {
                                let record = recordArray[i];
                                if (!(mtmrm.SchemaName in CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic)) {
                                    CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic[mtmrm.SchemaName] = [];
                                }
                                CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic[mtmrm.SchemaName].push(record);
                            }
                            ///console.log("retrieveMTMRCRMRecordsByEachRelationshipDeferredized() 最終");
                            return CV.connectionViewer.crmAccess.retrieveMTMRTargetCRMRecordsDeferredized(crmRecord, CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic);
                        }).then(() => {
                            deferred.resolve();
                        }).catch((e) => {
                            deferred.reject(e.toString());
                        });
                }
                promises.push(deferred);

                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        }
        /**
        * 特定のCRMレコードに関連するManyToManyで関連する（ターゲットとなる）CRMレコード群を取得し、グローバル変数に格納する。
        * ManyToManyレコード（中間エンティティレコード）は取得できても、ターゲットとなるCRMレコードは取得できない場合もある。
        * @function
        * @param sourceRecord {CRMRecord} 特定のCRMレコード
        * @param manyToManyEntityCollectionDic {} キーがManyToMany関連メタデータのスキーマ名、値が取得済みのManyToManyレコード（中間エンティティレコード）群を表す配列、を表す連想配列。
        */
        retrieveMTMRTargetCRMRecordsDeferredized(sourceRecord: CRMRecord, manyToManyEntityCollectionDic: { [key: string]: WebAPIRecord[] }): JQueryPromise<void> {
            ///console.log("in retrieveMTMRTargetCRMRecordsDeferredized()");
            this.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic = {};

            let promises = [];

            // 連想配列に対して、パラレルに非同期処理を実行して、そのすべてが終わるのを待つ。
            $.each(manyToManyEntityCollectionDic, function (schemaName: string, recordArray: WebAPIRecord[]): JQueryPromise<void> {
                let deferred: JQueryDeferred<void> = $.Deferred<void>();
                ///console.log("In retrieveMTMRTargetCRMRecordsDeferredized: schemaName=" + schemaName);

                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        // 未実装
                        ///console.log("retrieveMTMRTargetCRMRecordsDeferredized() 最終 未実装");
                        deferred.resolve();
                    }, Demo_Const.CRMSdkResponseTime);
                } else {
                    // 例： mtmrm.Entity1LogicalName が "opportunity"で、mtmrm.Entity2LogicalName が "competitor" の場合
                    //      エンティティ "competitor" のエンティティセット名は "competitors"
                    //      リクエスト
                    //        /competitors?$select=competitorid,name&$filter=competitorid eq 978ec042-b82b-e711-80f0-480fcff2f771 or competitorid eq a18ec042-b82b-e711-80f0-480fcff2f771
                    let mtmrm = CV.connectionViewer.ManyToManyRelationshipMetadataCache[schemaName];
                    let entityLogicalName = (mtmrm.Entity1LogicalName == sourceRecord.EntityLogicalName) ? mtmrm.Entity2LogicalName : mtmrm.Entity1LogicalName; // "competitor"
                    let entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName; // "competitors"
                    let primaryIdAttributeName = (mtmrm.Entity1LogicalName == sourceRecord.EntityLogicalName) ? mtmrm.Entity2IntersectAttribute : mtmrm.Entity1IntersectAttribute; // "competitorid"
                    let primaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryNameAttribute; // "name"
                    let primaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryImageAttribute; // null とか "entityimage"

                    let idArray = [];
                    let intersectEntityId = {}; // キーがTargetCRMレコードのId、値がIntersectEntityレコードのIdを持つ連想配列
                    for (let j in recordArray) {
                        let record = recordArray[j];
                        let id = record.EntityRecord[primaryIdAttributeName];
                        idArray.push(id);
                        intersectEntityId[id] = record.getId(CV.connectionViewer);
                    }

                    let uri = "/" + entitySetName;
                    // $select部分
                    uri += "?$select=" + primaryIdAttributeName + "," + primaryNameAttributeName;
                    if (primaryImageAttributeName) uri += "," + primaryImageAttributeName;

                    // $filterの文字列を生成
                    for (let i = 0; i < idArray.length; i++) {
                        if (i == 0) uri += "&$filter=";
                        else uri += " or ";
                        uri += primaryIdAttributeName + " eq " + idArray[i];
                    }

                    ///console.log("uri = " + uri);
                    WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                        .then((request) => {
                            // 複数件が返される
                            let recordArray: WebAPIRecord[] = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));
                            for (let i in recordArray) {
                                let record = recordArray[i];
                                let interEntId = intersectEntityId[record.getId(CV.connectionViewer)];
                                if (!CV.connectionViewer.crmAccess.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic[interEntId]) {
                                    CV.connectionViewer.crmAccess.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic[interEntId] = [];
                                }
                                CV.connectionViewer.crmAccess.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic[interEntId].push(record);
                            }
                            ///console.log("retrieveMTMRTargetCRMRecordsDeferredized() 最終");
                            deferred.resolve();
                        }).catch((e) => {

                            Helper.addErrorMessageln(e.message)
                            deferred.reject(e.message);
                        });
                }
                promises.push(deferred);

                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        }
        /**
        * 指定されたCRMレコードに関係するOne-to-Many関連付けのすべてについて、
        * CRMレコードを取得し、グローバル変数 asyncRetrievedOTMRRetrievedECDic に格納する。
        * CRM2013時代はStartRetrieveOneToManyRelationshipCRMRecords()
        * @function
        * @param record {CRMRecord} 対象となる特定のCRMレコード
        */
        retrieveOTMRCRMRecordsDeferredized(record: CRMRecord): JQueryPromise<void> {
            var deferred: JQueryDeferred<void> = $.Deferred<void>();

            if (CV.connectionViewer.OneToManyRelationshipMetadataCache != null) {
                this.asyncRetrievedOTMRRetrievedECDic = null;

                // 非同期でOneToMany関連のCRMレコードを取得すべきところのOneToManyRelationshipMetadataを格納した配列
                var paramOneToManyRelationshipMetadataArray: WebAPI.OTMRelationshipInterface[] = [];

                // ConfigSet の情報とマッチングさせなくてよいはず。
                for (let k in CV.connectionViewer.OneToManyRelationshipMetadataCache) {
                    let otmrm = CV.connectionViewer.OneToManyRelationshipMetadataCache[k];

                    if (otmrm.ReferencedEntity == record.EntityLogicalName) {
                        paramOneToManyRelationshipMetadataArray.push(otmrm);
                    }
                }

                this.retrieveOTMRCRMRecordsByEachRelationshipDeferredized(record, paramOneToManyRelationshipMetadataArray)
                    .done(function () {
                        ///console.log("retrieveOTMRCRMRecordsDeferredized()最終");

                        deferred.resolve();
                    });
            }

            return deferred.promise();
        }
        /**
        * 指定されたCRMレコードに関係して、関連するOne-to-Many関連付けをパラメータで受け取り、そのすべてについて、
        * CRMレコードを取得し、グローバル変数 asyncRetrievedOTMRRetrievedECDic に格納する。
        * CRM2013時代はStartRetrieveNextOneToManyRelationshipCRMRecordsAsync()
        * @function
        * @param record {CRMRecord} 対象となる特定のCRMレコード
        * @param relationships 関連するOne-to-Many関連付けメタデータの配列
        */
        retrieveOTMRCRMRecordsByEachRelationshipDeferredized(crmRecord: CRMRecord, relationships: WebAPI.OTMRelationshipInterface[]): JQueryPromise<void> {
            let promises = [];

            // OneToManyなので、様々なエンティティに対するクエリが必要だ。
            // 配列に対して、パラレルに非同期処理を実行して、そのすべてが終わるのを待つ。
            $.each(relationships, function (index: string, otmrm: WebAPI.OTMRelationshipInterface): JQueryPromise<void> {
                let deferred: JQueryDeferred<void> = $.Deferred<void>();
                ///console.log("In retrieveOTMRCRMRecordsByEachRelationshipDeferredized: index=" + index + ", value=" + otmrm.SchemaName);

                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        // 複数件が返される
                        let recordArray: WebAPIRecord[] = CV.Demo_Data.getOneToManyRelationshipCRMRecordsByEachRelationship(crmRecord, otmrm);
                        if (CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic == null) {
                            CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic = {};
                        }

                        for (let i = 0; i < recordArray.length; i++) {
                            let record: WebAPIRecord = recordArray[i];
                            if (!(otmrm.SchemaName in CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic)) {
                                CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic[otmrm.SchemaName] = [];
                            }
                            CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic[otmrm.SchemaName].push(record);
                        }
                        ///console.log("retrieveOTMRCRMRecordsByEachRelationshipDeferredized() 最終");
                        deferred.resolve();
                    }, Demo_Const.CRMSdkResponseTime);
                } else {
                    if (crmRecord.EntityLogicalName == CV.connectionViewer.OneToManyRelationshipMetadataCache[otmrm.SchemaName].ReferencedEntity) {
                        // 例： crmRecord.EntityLogicalName が "account"だとして、otmrm.SchemaName が "opportunity_parent_account" の時、ReferencingEntityNavigationPropertyName が "parentaccountid"、
                        // 取得対象の opportunity エンティティについて、その先の関連データの取得は必要ない。
                        // /opportunities?$select=opportunityid,name,parentaccountid&$filter=parentaccountid/accountid eq ea82f907-720f-e711-80e8-480fcff29761
                        let entityLogicalName = otmrm.ReferencingEntity; // "opportunity"
                        let entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName; // "opportunities"
                        let primaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryIdAttribute; // "opportunityid"
                        let primaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryNameAttribute; // "name"
                        let primaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryImageAttribute; // null とか "entityimage"
                        let navPropName = otmrm.ReferencingEntityNavigationPropertyName; // "parentaccountid"
                        let referencedAttributeName = otmrm.ReferencedAttribute; // "accountid"

                        // $selectの文字列を生成
                        let uri = "/" + entitySetName + "?$select=" + primaryIdAttributeName + "," + primaryNameAttributeName + "," + navPropName;
                        if (primaryImageAttributeName) uri += "," + primaryImageAttributeName;
                        uri += "," + navPropName;

                        // $filter部分
                        uri += "&$filter=" + navPropName + "/" + referencedAttributeName + " eq " + crmRecord.Id;

                        ///console.log("uri = " + uri);
                        WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                            .then((request) => {
                                // 複数件が返される
                                let recordArray: WebAPIRecord[] = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));
                                if (CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic == null) {
                                    CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic = {};
                                }

                                for (let i = 0; i < recordArray.length; i++) {
                                    let record: WebAPIRecord = recordArray[i];
                                    if (!(otmrm.SchemaName in CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic)) {
                                        CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic[otmrm.SchemaName] = [];
                                    }
                                    CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic[otmrm.SchemaName].push(record);
                                }
                                ///console.log("retrieveOTMRCRMRecordsByEachRelationshipDeferredized() 最終");
                                deferred.resolve();
                            })
                            .catch((e) => {
                                deferred.reject(e.message);
                            });
                    } else {
                        ///console.log("retrieveOTMRCRMRecordsByEachRelationshipDeferredized() 最終");
                        deferred.resolve();
                    }
                }
                promises.push(deferred);

                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        }
        /**
        * 指定されたCRMレコードに関係するMany-to-One関連付けのすべてについて、
        * CRMレコードを取得し、グローバル変数 asyncRetrievedMTORRetrievedECDic に格納する。
        * CRM2013時代はStartRetrieveManyToOneRelationshipCRMRecords()
        * @function
        * @param record {CRMRecord} 対象となる特定のCRMレコード
        */
        retrieveMTORCRMRecordsDeferredized(record: CRMRecord): JQueryPromise<void> {
            let deferred: JQueryDeferred<void> = $.Deferred<void>();

            if (CV.connectionViewer.OneToManyRelationshipMetadataCache != null) {
                this.asyncRetrievedMTORRetrievedECDic = null;

                // 非同期でManyToOne関連のCRMレコードを取得すべきところのManyToOneRelationshipMetadataを格納した配列
                let paramManyToOneRelationshipMetadataArray: WebAPI.OTMRelationshipInterface[] = [];

                // ConfigSet の情報とマッチングさせなくてよいはず。
                for (let k in CV.connectionViewer.OneToManyRelationshipMetadataCache) {
                    let otmrm = CV.connectionViewer.OneToManyRelationshipMetadataCache[k];

                    if (otmrm.ReferencingEntity == record.EntityLogicalName) {
                        paramManyToOneRelationshipMetadataArray.push(otmrm);
                    }
                }

                this.retrieveMTORCRMRecordsByEachRelationshipDeferredized(record, paramManyToOneRelationshipMetadataArray)
                    .done(function () {
                        ///console.log("retrieveMTORCRMRecordsDeferredized()最終");

                        deferred.resolve();
                    });
            }

            return deferred.promise();
        }
        /**
        * 指定されたCRMレコードに関係して、関連するMany-to-One関連付けをパラメータで受け取り、そのすべてについて、
        * CRMレコードを取得し、グローバル変数 asyncRetrievedMTORRetrievedECDic に格納する。
        * CRM2013時代はStartRetrieveNextManyToOneRelationshipCRMRecordsAsync()
        * @function
        * @param record {CRMRecord} 対象となる特定のCRMレコード
        * @param relationships 関連するMany-to-One関連付けメタデータの配列
        */
        retrieveMTORCRMRecordsByEachRelationshipDeferredized(crmRecord: CRMRecord, relationships: WebAPI.OTMRelationshipInterface[]): JQueryPromise<void> {
            let promises = [];

            // 配列に対して、パラレルに非同期処理を実行して、そのすべてが終わるのを待つ。
            $.each(relationships, function (index: string, mtorm: WebAPI.OTMRelationshipInterface): JQueryPromise<void> {
                let deferred: JQueryDeferred<void> = $.Deferred<void>();
                ///console.log("In retrieveMTORCRMRecordsByEachRelationshipDeferredized: index=" + index + ", value=" + mtorm.SchemaName);

                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        // 0件または1件のレコードが返される
                        // ManyToOneの Many 側を表すレコードである。
                        let recordOfMany = CV.Demo_Data.getManyToOneRelationshipCRMRecordsByEachRelationship(crmRecord, mtorm);
                        if (recordOfMany) {
                            let expEntityLogicalName = CV.connectionViewer.OneToManyRelationshipMetadataCache[mtorm.SchemaName].ReferencedEntity;

                            // ManyToOneの One 側を表すレコード
                            let recordOfOne: WebAPIRecord = null;
                            for (let k in recordOfMany.EntityRecord) {
                                // タイプが "object" のものの最初のものが、One 側を表すオブジェクトであると識別する。
                                if (typeof (recordOfMany.EntityRecord[k]) == "object") {
                                    let expEntitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].EntitySetName;
                                    let expEntityRecord = recordOfMany.EntityRecord[k];
                                    if (expEntityRecord != null) {
                                        // 1件のレコードが返された。
                                        recordOfOne = new WebAPIRecord(expEntitySetName, expEntityRecord);
                                    } else {
                                        // 0件のレコードが返された。
                                    }
                                    break;
                                }
                            }

                            if (recordOfOne != null) {
                                if (CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic == null) {
                                    CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic = {};
                                }

                                if (!(mtorm.SchemaName in CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic)) {
                                    CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic[mtorm.SchemaName] = [];
                                }

                                CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic[mtorm.SchemaName].push(recordOfOne);
                            }
                        }

                        ///console.log("retrieveMTORCRMRecordsByEachRelationshipDeferredized() 最終");
                        deferred.resolve();
                    }, Demo_Const.CRMSdkResponseTime);
                } else {
                    if (crmRecord.EntityLogicalName == CV.connectionViewer.OneToManyRelationshipMetadataCache[mtorm.SchemaName].ReferencingEntity) {
                        // 例： crmRecord.EntityLogicalName が "opportunity"だとして、mtorm.SchemaName が "opportunity_parent_account" の時、
                        //      ReferencingEntityNavigationPropertyName が "parentaccountid" である。
                        // リクエストは以下のようなもの。
                        //    /opportunities(4883f907-720f-e711-80e8-480fcff29761)?$select=parentaccountid&$expand=parentaccountid($select=accountid,name)
                        // レスポンスは以下のようなもの
                        //    @odata.context: "https://yourcrminstance.crm7.dynamics.com/api/data/v8.1/$metadata#opportunities(parentaccountid,parentaccountid(accountid,name))/$entity"
                        //    @odata.etag: "W/"583061""
                        //    opportunityid: "4883f907-720f-e711-80e8-480fcff29761"
                        //    parentaccountid: Object
                        //    ->@odata.etag: "W/"583338""
                        //    ->accountid: "ea82f907-720f-e711-80e8-480fcff29761"
                        //    ->name: "港コンピュータ株式会社"
                        let entityLogicalName = crmRecord.EntityLogicalName; // "opportunity"
                        let referencedId = crmRecord.Id; // "4883f907-720f-e711-80e8-480fcff29761"
                        let entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName; // "opportunities"
                        let navPropName = CV.connectionViewer.OneToManyRelationshipMetadataCache[mtorm.SchemaName].ReferencingEntityNavigationPropertyName; // "parentaccountid"
                        let expEntityLogicalName = CV.connectionViewer.OneToManyRelationshipMetadataCache[mtorm.SchemaName].ReferencedEntity; // "account"
                        let expPrimaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].PrimaryIdAttribute; // "accountid"
                        let expPrimaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].PrimaryNameAttribute; // "name"
                        let expPrimaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].PrimaryImageAttribute; // null とか "entityimage"

                        // $selectの文字列を生成
                        let uri = "/" + entitySetName + "(" + referencedId + ")?$select=" + navPropName;

                        // $expandの文字列を生成
                        uri += "&$expand=" + navPropName + "($select=" + expPrimaryIdAttributeName + "," + expPrimaryNameAttributeName;
                        if (expPrimaryImageAttributeName) uri += "," + expPrimaryImageAttributeName;
                        uri += ")";

                        ///console.log("uri = " + uri);
                        WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                            .then((request) => {
                                // 0件または1件のレコードが返される
                                // ManyToOneの Many 側を表すレコードである。
                                let recordOfMany = CV.WebAPIRecord.CreateWebAPIRecordSingle(JSON.parse(request.response));

                                // ManyToOneの One 側を表すレコード
                                let recordOfOne: WebAPIRecord = null;
                                for (let k in recordOfMany.EntityRecord) {
                                    // タイプが "object" のものの最初のものが、One 側を表すオブジェクトであると識別する。
                                    if (typeof (recordOfMany.EntityRecord[k]) == "object") {
                                        let expEntitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].EntitySetName;
                                        let expEntityRecord = recordOfMany.EntityRecord[k];
                                        if (expEntityRecord != null) {
                                            // 1件のレコードが返された。
                                            recordOfOne = new WebAPIRecord(expEntitySetName, expEntityRecord);
                                        } else {
                                            // 0件のレコードが返された。
                                        }
                                        break;
                                    }
                                }

                                if (recordOfOne != null) {
                                    if (CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic == null) {
                                        CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic = {};
                                    }

                                    if (!(mtorm.SchemaName in CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic)) {
                                        CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic[mtorm.SchemaName] = [];
                                    }

                                    CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic[mtorm.SchemaName].push(recordOfOne);
                                }

                                ///console.log("retrieveMTORCRMRecordsByEachRelationshipDeferredized() 最終");
                                deferred.resolve();
                            })
                            .catch((e) => {
                                if (!CV.CRMAccessWebAPI.IsIgnorableError(e.message)) {
                                    Helper.addErrorMessageln(e.message);
                                }
                                //deferred.reject(e.message); // 権限不足によるエラーの場合など、エラーメッセージは表示するが処理は実行するので、rejectではない。
                                deferred.resolve();
                            });
                    } else {
                        ///console.log("retrieveMTORCRMRecordsByEachRelationshipDeferredized() 最終 crmRecord.EntityLogicalName が ReferencingEntity でない");
                        deferred.resolve();
                    }
                }
                promises.push(deferred);

                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        }
        /**
        * XmlタイプのWebリソースで格納しているConfigSetのテキスト部分を取得する。無ければ、nullを返す。
        * @function
        * @return ConfigSetのテキスト部分の文字列。Webリソースがなければ、nullを返す。
        */
        retrieveConfigSetXmlTextDeferredized(): JQueryPromise<string> {
            var deferred: JQueryDeferred<string> = $.Deferred<string>();

            if (CV.connectionViewer.IS_DEMO_MODE) {
                setTimeout(function () {
                    let configSet = CV.ConfigSet.getDefaultConfigSet();
                    let configArray = configSet.ConfigArray;
                    let configArrayObj = { "ConfigArray": configArray };
                    let text = JSON.stringify(configArrayObj);

                    ///console.log("retrieveConfigSetXml()最終");
                    deferred.resolve(text);
                }, Demo_Const.CRMSdkResponseTime);
            } else {
                // オンプレだと以下のようなURLでアクセスする。
                // http://keijicrm7.keijicrm7.local:5555/crm7/WebResources/new_/CRM2015ConnectionViewerTS/CV/Data/ConfigSet.xml
                var clientUrl;
                if (Xrm.Page.context != null) {
                    clientUrl = Xrm.Page.context.getClientUrl(); // オンプレだと "http://keijicrm7.keijicrm7.local:5555/crm7" のような文字列
                } else {
                    clientUrl = parent.Xrm.Page.context.getClientUrl(); // オンプレだと "http://keijicrm7.keijicrm7.local:5555/crm7" のような文字列
                }
                var url = clientUrl + "/WebResources/" + CV.ConnectionViewer.CRM_PUBLISHER_PREFIX + "_/" + CV.ConnectionViewer.CRM_SOLUTION_NAME + "/CV/Data/ConfigSet.xml";
                $.get(url).done(function (configSetXml) {
                    ///console.log("retrieveConfigSetXml()最終");
                    deferred.resolve(configSetXml.documentElement.textContent);
                });
            }

            return deferred.promise();
        }
        /**
        * OneToManyRelationshipMetadataCacheを基に、対象エンティティについての取得すべきManyToOneRelationshipMetadataの一覧を取得
        * 例えば、対象となるエンティティが opportunity の場合、以下のようなスキーマ名をもつ ManyToOneRelationshipMetadata が対象となる。
        *   opportunity_parent_account
        *   opportunity_parent_contact
        * @param entityLogicalName {string} 対象となるエンティティ
        */
        getManyToOneRelationshipMetadataArray(entityLogicalName: string): WebAPI.OTMRelationshipInterface[] {
            let paramManyToOneRelationshipMetadataArray: WebAPI.OTMRelationshipInterface[] = [];

            for (let schemaName in CV.connectionViewer.OneToManyRelationshipMetadataCache) {
                let otmrm = CV.connectionViewer.OneToManyRelationshipMetadataCache[schemaName];
                if (otmrm.ReferencingEntity == entityLogicalName) {
                    paramManyToOneRelationshipMetadataArray.push(otmrm);
                }
            }

            return paramManyToOneRelationshipMetadataArray;
        }
        /**
        * Dynamics 365 のメモエンティティ（annotations）を読み込んでレコードの配列を返す。
        * もし引数が渡されなければ、現在のメインのカードに付属するメモレコード群を取得して返す。
        * もし引数として annotationId が渡されれば、その１件のみ取得し、1件の配列を返す。
        */
        static retrieveAnnotationRecordForCardsLayoutDeferredized(annotationId: string): JQueryPromise<WebAPIRecord[]> {
            let deferred: JQueryDeferred<WebAPIRecord[]> = $.Deferred<WebAPIRecord[]>();
            ///console.log("In retrieveAnnotationRecordForCardsLayoutDeferredized");

            if (!annotationId) {
                // 引数が渡されなければ、現在のメインのカードに付属するメモレコード群を取得して返す。
                // 例： /annotations?$select=subject,documentbody,notetext,_createdby_value,createdon,_modifiedby_value,modifiedon&$orderby=createdon desc&$filter=objectid_contact/contactid eq 0683f907-720f-e711-80e8-480fcff29761
                let navPropName = CV.connectionViewer.AnnotationRelationshipMetadataCache.ReferencingEntityNavigationPropertyName; // "objectid_contact"
                let refAttr = CV.connectionViewer.AnnotationRelationshipMetadataCache.ReferencedAttribute; // "contactid"
                let refAttrVal = CV.connectionViewer.paramGuid; // "0683f907-720f-e711-80e8-480fcff29761"

                let uri = "/annotations?$select=subject,documentbody,notetext,_createdby_value,createdon,_modifiedby_value,modifiedon&$orderby=createdon desc&$filter=";
                uri += navPropName + "/" + refAttr + " eq " + refAttrVal;

                ///console.log("uri = " + uri);
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then((request) => {
                        // 複数件が返される
                        let recordArray: WebAPIRecord[] = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));

                        ///console.log("retrieveAnnotationRecordForCardsLayoutDeferredized() without annotationId 最終");
                        deferred.resolve(recordArray);
                    })
                    .catch((e) => {
                        deferred.reject(e.message);
                    });
            } else {
                // 引数として annotationId が渡されれば、その１件のみ取得し、1件の配列を返す。
                // 例： /annotations(1f930e8c-0e36-e711-80f2-480fcff207f1)?$select=subject,documentbody,notetext,_createdby_value,createdon,_modifiedby_value,modifiedon
                let uri = "/annotations(" + annotationId + ")";
                uri += "?$select=subject,documentbody,notetext,_createdby_value,createdon,_modifiedby_value,modifiedon";

                ///console.log("uri = " + uri);
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then((request) => {
                        // 0件または1件が返される
                        let record: WebAPIRecord = CV.WebAPIRecord.CreateWebAPIRecordSingle(JSON.parse(request.response));

                        ///console.log("retrieveAnnotationRecordForCardsLayoutDeferredized() with annotationId 最終");
                        if (record) deferred.resolve([record]);
                        else deferred.reject("GUID = '" + annotationId + "'のメモレコードが取得できませんでした。");
                    })
                    .catch((e) => {
                        deferred.reject(e.message);
                    });
            }
            return deferred.promise();
        }
        /**
        * Dynamics 365 のメモエンティティ（annotation）の新規レコードとして CardsLayout インスタンスの情報を保存する。
        * @param cardsLayout {CardsLayout} 保存の対象となる CardsLayout インスタンス
        * @param notetext {string} 保存するカードレイアウトの説明の文字列
        * @returns JQueryPromise<string> 作成されたメモレコードを表す OData-EntityId の値、"https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/annotations(2941aced-f535-e711-80f2-480fcff207f1)" のような文字列
        */
        static createAnnotationRecordForCardsLayoutDeferredized(cardsLayout: CardsLayout, notetext: string): JQueryPromise<string> {
            let deferred: JQueryDeferred<string> = $.Deferred<string>();
            ///console.log("In createAnnotationRecordForCardsLayoutDeferredized");
            let odata_entityid: string;

            // annotation は関連付けが特別なようで、レコード作成時に関連レコードを指定することができなかった。
            // そのため、①関連付けなしで annotation レコードを作成後に、②再度関連付けだけを行うリクエストを投げる、という2段階を実装した。

            // ①
            // 例：
            //   uri: /annotations
            //   data:
            //     {
            //         "subject": "つながりビューワーのカードレイアウト",
            //         "documentbody": "<<cardsLayoutをJSON形式にしたものを、エンコードして、Base64化した文字列>>",
            //         "notetext": "職歴にフォーカスしたもの",
            //     }
            let uri = "/annotations";
            let data = {
                "subject": "つながりビューワーのカードレイアウト",
                "documentbody": btoa(encodeURI(JSON.stringify(cardsLayout))),
                "notetext": notetext,
            };

            ///console.log("uri = " + uri);
            ///console.log("data = " + JSON.stringify(data));

            WebAPI.request("POST", uri, data, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                .then((request) => {
                    odata_entityid = request.getResponseHeader("OData-EntityId");
                    if (!odata_entityid) deferred.reject("メモレコードが正しく作成されませんでした。OData-EntityId ヘッダーの値がありません。");

                    //②
                    // 例：
                    //    uri: /contacts(0683f907-720f-e711-80e8-480fcff29761)/Contact_Annotation/$ref
                    //    data:
                    //      {
                    //          "@odata.id": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/annotations(2941aced-f535-e711-80f2-480fcff207f1)"
                    //      }
                    let entityLogicalName = CV.connectionViewer.paramEntityLogicalName; // "contact"
                    let entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName; // "contacts"
                    if (!entitySetName) deferred.reject("エンティティ'" + entityLogicalName + "'のエンティティセット名が正しく取得できませんでした。");
                    let id = CV.connectionViewer.paramGuid; // "0683f907-720f-e711-80e8-480fcff29761"
                    let referencedEntityNavigationPropertyName = CV.connectionViewer.AnnotationRelationshipMetadataCache.ReferencedEntityNavigationPropertyName; // "Contact_Annotation"
                    let uri = "/" + entitySetName + "(" + id + ")/" + referencedEntityNavigationPropertyName + "/$ref";

                    let data = {
                        "@odata.id": odata_entityid
                    };

                    ///console.log("uri = " + uri);
                    ///console.log("data = " + JSON.stringify(data));

                    return WebAPI.request("POST", uri, data, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                }).then((request) => {
                    // 特に何もする必要がない。

                    deferred.resolve(odata_entityid);
                })
                .catch((e) => {
                    deferred.reject(e.message);
                });

            return deferred.promise();
        }
        // 無視可能なエラーメッセージであるかどうかを判断する
        static IsIgnorableError(errorMessage) {
            // 以下のようなエラーは、アクセス権がないレコードを対象とするつながりレコードの情報を扱うときに発生する。
            // このエラーは想定されたもので、無視する。
            // 　"SecLib::AccessCheckEx failed. Returned hr = -2147187962, ObjectID: 0083f907-720f-e711-80e8-480fcff29761, OwnerId: d8a5171d-5f0f-e711-80e9-480fcff2c651, OwnerIdType: 8 and CallingUser: d8a5171d-5f0f-e711-80e9-480fcff2c651. ObjectTypeCode: 2, objectBusinessUnitId: ac52bd1e-5c0f-e711-80e8-480fcff29761, AccessRights: ReadAccess "
            return errorMessage.indexOf("SecLib::AccessCheckEx failed.") == 0 && 0 < errorMessage.indexOf("AccessRights: ReadAccess");
        }
    }
}