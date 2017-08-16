/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.options.ts" />
/// <reference path="cv.helper.ts" />
/// <reference path="cv.crmrecord.ts" />
var CV;
(function (CV) {
    /**
    * CRMリンク。1つのつながりレコード、あるいはOneToMany関連、あるいはManyToMany関連を表すクラス
    * コネクタ（CV.ForceGraphで管理される表示上の線）が、複数のCRMリンクのインスタンスを持つことがある。
    * @class
    */
    var CRMLink = (function () {
        /**
        * コンストラクタ
        * @constructor
        */
        function CRMLink(linkId, record1, record2, record1displayname, record2displayname, record1roleid, record2roleid, record1displayrolename, record2displayrolename, description, relatedconnectionid, connectionType, otmRelationshipSchemaName) {
            this.LinkId = linkId;
            this.CRMRecord1 = record1;
            this.CRMRecord1.DisplayName = record1displayname;
            this.CRMRecord2 = record2;
            this.CRMRecord2.DisplayName = record2displayname;
            this.CRMRecord1DisplayName = record1displayname;
            this.CRMRecord2DisplayName = record2displayname;
            this.Record1RoleId = record1roleid;
            this.Record2RoleId = record2roleid;
            this.Record1DisplayRoleName = record1displayrolename;
            this.Record2DisplayRoleName = record2displayrolename;
            this.Description = description;
            this.RelatedConnectionId = relatedconnectionid;
            this.LinkType = connectionType;
            this.OTMRelationshipSchemaName = otmRelationshipSchemaName;
            this.Connector = null;
        }
        /**
        * card1or2_1とcard1or2_2について、このCreateConnector()を呼び出した時点で、どちらが
        * CRMRecord1に対応し、どちらがCRMRecord2に対応するかは不明の状態でよい。
        * このCreateConnector()内で判断する。
        * @function
        */
        CRMLink.prototype.CreateConnector = function (card1or2_1, card1or2_2) {
            var card1;
            var card2;
            if (card1or2_1.CrmRecord.Id.toUpperCase() == this.CRMRecord1.Id.toUpperCase()) {
                card1 = card1or2_1;
                card2 = card1or2_2;
            }
            else {
                card1 = card1or2_2;
                card2 = card1or2_1;
            }
            this.Connector = new CV.ConnectorControl(this);
            this.Connector.Card1 = card1;
            this.Connector.Card2 = card2;
            this.Connector.Description = this.Description;
            this.Connector.Role1 = this.Record1DisplayRoleName;
            this.Connector.Role2 = this.Record2DisplayRoleName;
            CV.forceGraph.addLink({
                source: card1.CrmRecord.Id,
                target: card2.CrmRecord.Id,
                linkId: this.LinkId,
                description: this.Description,
                role1: this.Record1DisplayRoleName,
                role2: this.Record2DisplayRoleName,
                connector: this.Connector
            });
        };
        /**
        * 対象となるCRMレコードについて、
        * CRMのつながりレコード群を受け取って、新規CRMLinkインスタンス群に変換して、その配列を返す。
        * なお、つながりレコードはGUI上で1つのつながりを登録すると、CRM内部として2つのつながりレコードが生成される。（つながり元とつながり先それぞれにセットされた2つのレコード）
        * ここでは、CV.CRMAccess.retrieveConnectionsDeferredized()と合わせて、つながり元（record1なんとかかんとか）が対象CRMレコードにヒットするものだけをフィルタする。
        * CRM2013時代よりも返すレコードをきちんとフィルタしている。
        * @function
        * @param connectionEntities {WebAPIRecord[]} CRMのつながりレコード群
        * @param connectionTargetCRMEntities {WebAPIRecordy[]} CRMのつながりレコードのターゲットのCRMレコード群
        * @param entityMetadataCacheOTC エンティティメタデータのキャッシュ
        */
        CRMLink.ConvertConnectionEntitiesToCRMLinkList = function (record, connectionEntities, connectionTargetCRMEntities, entityMetadataCacheOTC, cv) {
            var list = [];
            var findInCRMRecordArray = function (id) {
                var foundEntity = null;
                for (var r in CV.connectionViewer.CRMRecordArray) {
                    if (CV.connectionViewer.CRMRecordArray[r].Id == id) {
                        foundEntity = CV.connectionViewer.CRMRecordArray[r];
                        break;
                    }
                }
                return foundEntity;
            };
            var findInConnectionTargetCRMEntities = function (id) {
                var foundEntity = null;
                for (var r in connectionTargetCRMEntities) {
                    if (connectionTargetCRMEntities[r].getId(cv) == id) {
                        foundEntity = connectionTargetCRMEntities[r];
                        break;
                    }
                }
                return foundEntity;
            };
            // エンティティのObjectTypeCodeを2つ受け取り、それが共にConfig内でConnectionの対象エンティティとなっているかどうかを判断する。対象であればtrueを返す。
            var findInConfig = function (otc1, otc2) {
                var logicalName1 = CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[otc1].LogicalName;
                var logicalName2 = CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[otc2].LogicalName;
                if (0 <= CV.connectionViewer.config.EntitiesForConnectionList.indexOf(logicalName1) &&
                    0 <= CV.connectionViewer.config.EntitiesForConnectionList.indexOf(logicalName2))
                    return true;
                else
                    return false;
            };
            if (connectionEntities != null) {
                for (var i = 0; i < connectionEntities.length; i++) {
                    var entity = connectionEntities[i];
                    var objectTypeCode1 = entity.EntityRecord["record1objecttypecode"];
                    var objectTypeCode2 = entity.EntityRecord["record2objecttypecode"];
                    if (record.Id == entity.EntityRecord["_record1id_value"] &&
                        (objectTypeCode1.toString() in CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode) &&
                        (objectTypeCode2.toString() in CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode) &&
                        findInConfig(objectTypeCode1, objectTypeCode2)) {
                        var entityImage1 = void 0;
                        var crmRecord = findInCRMRecordArray(entity.EntityRecord["_record1id_value"]);
                        if (crmRecord)
                            entityImage1 = crmRecord.EntityImage;
                        if (!entityImage1) {
                            var entityRecord = findInConnectionTargetCRMEntities(entity.EntityRecord["_record1id_value"]);
                            if (entityRecord)
                                entityImage1 = entityRecord.EntityRecord[CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[objectTypeCode1].PrimaryImageAttribute];
                        }
                        var record1 = new CV.CRMRecord(entity.EntityRecord["_record1id_value"], entityMetadataCacheOTC[objectTypeCode1].LogicalName, entityMetadataCacheOTC[objectTypeCode1].SchemaName, entity.EntityRecord["_record1id_value@OData.Community.Display.V1.FormattedValue"], entityImage1, entityMetadataCacheOTC[objectTypeCode1].DisplayName.UserLocalizedLabel.Label, entity.EntityRecord["record1objecttypecode"], findInCRMRecordArray(entity.EntityRecord["_record1id_value"]));
                        var entityImage2 = void 0;
                        crmRecord = findInCRMRecordArray(entity.EntityRecord["_record2id_value"]);
                        if (crmRecord)
                            entityImage2 = crmRecord.EntityImage;
                        if (!entityImage2) {
                            var entityRecord = findInConnectionTargetCRMEntities(entity.EntityRecord["_record2id_value"]);
                            if (entityRecord)
                                entityImage2 = entityRecord.EntityRecord[CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[objectTypeCode2].PrimaryImageAttribute];
                        }
                        var record2 = new CV.CRMRecord(entity.EntityRecord["_record2id_value"], entityMetadataCacheOTC[objectTypeCode2].LogicalName, entityMetadataCacheOTC[objectTypeCode2].SchemaName, entity.EntityRecord["_record2id_value@OData.Community.Display.V1.FormattedValue"], entityImage2, entityMetadataCacheOTC[objectTypeCode2].DisplayName.UserLocalizedLabel.Label, entity.EntityRecord["record2objecttypecode"], findInConnectionTargetCRMEntities(entity.EntityRecord["_record2id_value"]));
                        var con = new CRMLink(entity.getId(CV.connectionViewer), record1, record2, record1.DisplayName, record2.DisplayName, entity.EntityRecord["_record1roleid_value"], entity.EntityRecord["_record2roleid_value"], entity.EntityRecord["_record1roleid_value@OData.Community.Display.V1.FormattedValue"], entity.EntityRecord["_record2roleid_value@OData.Community.Display.V1.FormattedValue"], entity.EntityRecord["description"], entity.EntityRecord["_relatedconnectionid_value"], CRMLinkTypeEnum.Connection, null // つながりエンティティであるため、null
                        );
                        list.push(con);
                    }
                }
            }
            return list;
        };
        /**
        * 対象となるCRMレコードについて、
        * CRMのManyToManyレコード群を受け取って、新規CRMLinkインスタンス群に変換して、その配列を返す。
        * なお、ManyToManyレコードの先のターゲットとなるCRMレコードが存在する（取得済みであるはずなので、存在しないということはアクセス権がないことを意味する。）場合には、
        * 新規CRMLinkインスタンスは生成しない。
        * @function
        * @param manyToManyRelationshipEntitiesDic Many-To-Many取得した中間エンティティつながりレコード群
        * @param manyToManyRelationshipTargetCRMEntitiesDic {} Many-To-Many取得したレコード群のターゲットのCRMレコード群を内部に持つ連想配列。キーがMayToManyレコードのID、値が対応するターゲットのCRMレコード群を表す WebAPIRecord を配列化したもの
        */
        CRMLink.ConvertManyToManyEntitiesToCRMLinkList = function (sourceCRMRecord, manyToManyRelationshipEntitiesDic, manyToManyRelationshipTargetCRMEntitiesDic, entityMetadataCacheEntityLogicalName) {
            var list = [];
            if (manyToManyRelationshipTargetCRMEntitiesDic != null) {
                for (var k in manyToManyRelationshipTargetCRMEntitiesDic) {
                    var targetCRMEntities = manyToManyRelationshipTargetCRMEntitiesDic[k];
                    for (var i = 0; i < targetCRMEntities.length; i++) {
                        var targetEntity = targetCRMEntities[i];
                        var entityLogicalName1 = sourceCRMRecord.EntityLogicalName;
                        var entityLogicalName2 = targetEntity.getEntityLogicalName(CV.connectionViewer);
                        if ((entityLogicalName1 in entityMetadataCacheEntityLogicalName)
                            && (entityLogicalName2 in entityMetadataCacheEntityLogicalName)) {
                            var record1 = new CV.CRMRecord(sourceCRMRecord.Id, entityLogicalName1, entityMetadataCacheEntityLogicalName[entityLogicalName1].SchemaName, sourceCRMRecord.DisplayName, sourceCRMRecord.EntityImage, entityMetadataCacheEntityLogicalName[entityLogicalName1].DisplayName.UserLocalizedLabel.Label, entityMetadataCacheEntityLogicalName[entityLogicalName1].ObjectTypeCode, sourceCRMRecord.EntityRecord);
                            var primaryNameAttributeName2 = entityMetadataCacheEntityLogicalName[entityLogicalName2].PrimaryNameAttribute;
                            var primaryImageAttributeName2 = entityMetadataCacheEntityLogicalName[entityLogicalName2].PrimaryImageAttribute;
                            var record2 = new CV.CRMRecord(targetEntity.getId(CV.connectionViewer), entityLogicalName2, entityMetadataCacheEntityLogicalName[entityLogicalName2].SchemaName, targetEntity.EntityRecord[primaryNameAttributeName2], targetEntity.EntityRecord[primaryImageAttributeName2], entityMetadataCacheEntityLogicalName[entityLogicalName2].DisplayName.UserLocalizedLabel.Label, entityMetadataCacheEntityLogicalName[entityLogicalName2].ObjectTypeCode, targetEntity.EntityRecord);
                            var con = new CRMLink(k, record1, record2, record1.DisplayName, record2.DisplayName, null // CRMのつながりレコードではなく、ManyToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、ManyToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、ManyToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、ManyToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、ManyToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、ManyToMany関連を表すものなので、null
                            , CRMLinkTypeEnum.ManyToMany, null // ManyToMany関連なので、null
                            );
                            list.push(con);
                        }
                    }
                }
            }
            return list;
        };
        /**
        * CRMのOneToMany関連で取得したレコード群を受け取って、新規CRMLinkインスタンス群に変換して、その配列を返す。
        * CRMLinkのrecord1にはOneToManyのOneの方のレコードが、record2にはManyの方のレコードが格納される。
        * @function
        * @param oneToManyRelationshipEntitiesDic {object} CRMのOneToMany関連で取得したレコード群を表す連想配列
        */
        CRMLink.ConvertOneToManyRelationshipEntitiesToCRMLinkList = function (sourceCRMRecord, oneToManyRelationshipEntitiesDic, entityMetadataCacheEntityLogicalName, oneToManyRelationshipMetadataCache, attributeMetadataCache) {
            var list = [];
            if (oneToManyRelationshipEntitiesDic != null) {
                for (var otmrSchemaName in oneToManyRelationshipEntitiesDic) {
                    for (var i = 0; i < oneToManyRelationshipEntitiesDic[otmrSchemaName].length; i++) {
                        var targetEntity = oneToManyRelationshipEntitiesDic[otmrSchemaName][i];
                        var entityLogicalName1 = sourceCRMRecord.EntityLogicalName;
                        var entityLogicalName2 = targetEntity.getEntityLogicalName(CV.connectionViewer);
                        if ((entityLogicalName1 in entityMetadataCacheEntityLogicalName)
                            && (entityLogicalName2 in entityMetadataCacheEntityLogicalName)
                            && oneToManyRelationshipMetadataCache != null
                            && (otmrSchemaName in oneToManyRelationshipMetadataCache)) {
                            var record1 = new CV.CRMRecord(sourceCRMRecord.Id, entityLogicalName1, entityMetadataCacheEntityLogicalName[entityLogicalName1].SchemaName, sourceCRMRecord.DisplayName, sourceCRMRecord.EntityImage, entityMetadataCacheEntityLogicalName[entityLogicalName1].DisplayName.UserLocalizedLabel.Label, entityMetadataCacheEntityLogicalName[entityLogicalName1].ObjectTypeCode, sourceCRMRecord.EntityRecord);
                            var primaryNameAttributeName2 = entityMetadataCacheEntityLogicalName[entityLogicalName2].PrimaryNameAttribute;
                            var primaryImageAttributeName2 = entityMetadataCacheEntityLogicalName[entityLogicalName2].PrimaryImageAttribute;
                            var record2 = new CV.CRMRecord(targetEntity.getId(CV.connectionViewer), entityLogicalName2, entityMetadataCacheEntityLogicalName[entityLogicalName2].SchemaName, targetEntity.EntityRecord[primaryNameAttributeName2], targetEntity.EntityRecord[primaryImageAttributeName2], entityMetadataCacheEntityLogicalName[entityLogicalName2].DisplayName.UserLocalizedLabel.Label, entityMetadataCacheEntityLogicalName[entityLogicalName2].ObjectTypeCode, targetEntity.EntityRecord);
                            var entName = oneToManyRelationshipMetadataCache[otmrSchemaName].ReferencingEntity;
                            var attName = oneToManyRelationshipMetadataCache[otmrSchemaName].ReferencingAttribute;
                            var con = new CRMLink(MyGeneralLibrary.getNewGuid() // CRMのつながりレコードではなく、OneToMany関連を表すものなので、新規に動的にGUIDを作成する。
                            , record1, record2, record1.DisplayName, record2.DisplayName, null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , attributeMetadataCache[entName][attName].DisplayName.UserLocalizedLabel.Label, null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , CRMLinkTypeEnum.OneToMany, otmrSchemaName);
                            list.push(con);
                        }
                    }
                }
            }
            return list;
        };
        /**
        * CRMのManyToOne関連で取得したレコード群を受け取って、新規CRMLinkインスタンス群に変換して、その配列を返す。
        * CRMLinkのrecord1にはOneToManyのManyの方のレコードが、record2にはOneの方のレコードが格納される。
        * @function
        * @param manyToOneRelationshipEntitiesDic {object} CRMのManyToOne関連で取得したレコード群を表す連想配列
        */
        CRMLink.ConvertManyToOneRelationshipEntitiesToCRMLinkList = function (sourceCRMRecord, manyToOneRelationshipEntitiesDic, entityMetadataCacheEntityLogicalName, oneToManyRelationshipMetadataCache, attributeMetadataCache) {
            var list = [];
            if (manyToOneRelationshipEntitiesDic != null) {
                for (var otmrSchemaName in manyToOneRelationshipEntitiesDic) {
                    for (var i = 0; i < manyToOneRelationshipEntitiesDic[otmrSchemaName].length; i++) {
                        var targetEntity = manyToOneRelationshipEntitiesDic[otmrSchemaName][i];
                        var entityLogicalName1 = sourceCRMRecord.EntityLogicalName;
                        var entityLogicalName2 = targetEntity.getEntityLogicalName(CV.connectionViewer);
                        if ((entityLogicalName1 in entityMetadataCacheEntityLogicalName)
                            && (entityLogicalName2 in entityMetadataCacheEntityLogicalName)
                            && oneToManyRelationshipMetadataCache != null
                            && (otmrSchemaName in oneToManyRelationshipMetadataCache)) {
                            var record1 = new CV.CRMRecord(sourceCRMRecord.Id, entityLogicalName1, entityMetadataCacheEntityLogicalName[entityLogicalName1].SchemaName, sourceCRMRecord.DisplayName, sourceCRMRecord.EntityImage, entityMetadataCacheEntityLogicalName[entityLogicalName1].DisplayName.UserLocalizedLabel.Label, entityMetadataCacheEntityLogicalName[entityLogicalName1].ObjectTypeCode, sourceCRMRecord.EntityRecord);
                            var primaryNameAttributeName2 = entityMetadataCacheEntityLogicalName[entityLogicalName2].PrimaryNameAttribute;
                            var primaryImageAttributeName2 = entityMetadataCacheEntityLogicalName[entityLogicalName2].PrimaryImageAttribute;
                            var record2 = new CV.CRMRecord(targetEntity.getId(CV.connectionViewer), entityLogicalName2, entityMetadataCacheEntityLogicalName[entityLogicalName2].SchemaName, targetEntity.EntityRecord[primaryNameAttributeName2], targetEntity.EntityRecord[primaryImageAttributeName2], entityMetadataCacheEntityLogicalName[entityLogicalName2].DisplayName.UserLocalizedLabel.Label, entityMetadataCacheEntityLogicalName[entityLogicalName2].ObjectTypeCode, targetEntity.EntityRecord);
                            var entName = oneToManyRelationshipMetadataCache[otmrSchemaName].ReferencingEntity;
                            var attName = oneToManyRelationshipMetadataCache[otmrSchemaName].ReferencingAttribute;
                            var con = new CRMLink(MyGeneralLibrary.getNewGuid() // CRMのつながりレコードではなく、OneToMany関連を表すものなので、新規に動的にGUIDを作成する。
                            , record1, record2, record1.DisplayName, record2.DisplayName, null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , attributeMetadataCache[entName][attName].DisplayName.UserLocalizedLabel.Label, null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , null // CRMのつながりレコードではなく、OneToMany関連を表すものなので、null
                            , CRMLinkTypeEnum.OneToMany, otmrSchemaName);
                            list.push(con);
                        }
                    }
                }
            }
            return list;
        };
        /**
        * 2つのインスタンスを受け取り、同じCRMRecordの組み合わせであるかどうかを調べる。
        * つながりの種類については問わない。等価なCRMLinkであるかどうかの判断ではない。
        * @function
        * @return {boolean} 同じ組み合わせの場合にtrue、それ以外の場合にfalse
        */
        CRMLink.HaveSameCombinationOfCRMRecords = function (con1, con2) {
            ///console.log("in HaveSameCombinationOfCRMRecords(), con1.CRMRecord1.Id=", con1.CRMRecord1.Id, ", con1.CRMRecord2.Id=", con1.CRMRecord2.Id, ", con2.CRMRecord1.Id=", con2.CRMRecord1.Id, ", con2.CRMRecord2.Id=", con2.CRMRecord2.Id);
            return (con1.CRMRecord1.Id == con2.CRMRecord1.Id && con1.CRMRecord2.Id == con2.CRMRecord2.Id)
                || (con1.CRMRecord1.Id == con2.CRMRecord2.Id && con1.CRMRecord2.Id == con2.CRMRecord1.Id);
        };
        /**
        * 2つのインスタンスを受け取り、等価な意味合いを持つCRMLinkであると判断できるかどうかを調べる。
        * つながりの種類についても問う。
        * @function
        * @return {boolean} 等価な意味合いを持つCRMLinkである場合にtrue、それ以外の場合にfalse
        */
        CRMLink.HaveSameContext = function (con1, con2) {
            if (con2.LinkType == CRMLinkTypeEnum.Connection && con1.LinkType == CRMLinkTypeEnum.Connection) {
                // 共につながりエンティティレコードの場合。
                // 同じつながりに関する組み合わせの場合、等価。
                if (con1.LinkId == con2.LinkId
                    ||
                        con1.LinkId == con2.RelatedConnectionId) {
                    return true;
                }
            }
            else if (con2.LinkType == CRMLinkTypeEnum.ManyToMany && con1.LinkType == CRMLinkTypeEnum.ManyToMany) {
                // 共にManyToMany関連の場合。
                // 同じ中間テーブルのIDを持つ場合、等価。
                if (con2.LinkId == con1.LinkId) {
                    return true;
                }
            }
            else if (con2.LinkType == CRMLinkTypeEnum.OneToMany && con1.LinkType == CRMLinkTypeEnum.OneToMany) {
                // 共にOneToMany関連の場合。
                // 同じOneToManyメタデータで取得した同じカードのIDの組み合わせの場合、等価。
                if ((con2.OTMRelationshipSchemaName == con1.OTMRelationshipSchemaName) &&
                    CRMLink.HaveSameCombinationOfCRMRecords(con1, con2)) {
                    return true;
                }
            }
            return false;
        };
        return CRMLink;
    }());
    CV.CRMLink = CRMLink;
    /**
    * CRMリンクにおいて、つながりレコード、あるいはOneToMany関連、あるいはManyToMany関連のいずれかの種類を表すenum
    * @interface
    */
    var CRMLinkTypeEnum;
    (function (CRMLinkTypeEnum) {
        CRMLinkTypeEnum[CRMLinkTypeEnum["Connection"] = 0] = "Connection";
        CRMLinkTypeEnum[CRMLinkTypeEnum["OneToMany"] = 1] = "OneToMany";
        CRMLinkTypeEnum[CRMLinkTypeEnum["ManyToMany"] = 2] = "ManyToMany";
    })(CRMLinkTypeEnum = CV.CRMLinkTypeEnum || (CV.CRMLinkTypeEnum = {}));
})(CV || (CV = {}));
//# sourceMappingURL=cv.crmlink.js.map