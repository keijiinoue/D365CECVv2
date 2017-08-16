var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CV;
(function (CV) {
    var Helper;
    (function (Helper) {
        var Point = (function () {
            function Point(x, y) {
                this.x = x;
                this.y = y;
            }
            return Point;
        }());
        Helper.Point = Point;
        function addMessage(message) {
            document.getElementById("MyMessageDiv").innerHTML += message;
        }
        Helper.addMessage = addMessage;
        function addMessageln(message) {
            document.getElementById("MyMessageDiv").innerHTML += message + "<BR/>";
        }
        Helper.addMessageln = addMessageln;
        function addErrorMessageln(message) {
            addMessageln("Error: " + message);
        }
        Helper.addErrorMessageln = addErrorMessageln;
        function addInfoMessageln(message) {
            addMessageln("Info: " + message);
        }
        Helper.addInfoMessageln = addInfoMessageln;
        function showUserAgent() {
            addMessage(navigator.userAgent);
        }
        Helper.showUserAgent = showUserAgent;
    })(Helper = CV.Helper || (CV.Helper = {}));
})(CV || (CV = {}));
var CV;
(function (CV) {
    var Options = (function () {
        function Options(configID) {
            this.ConfigID = configID;
        }
        Options.copyAllProperties = function (source, target) {
            target.ConfigID = source.ConfigID;
        };
        Options.getUserOptions = function () {
            if (typeof (localStorage) !== 'undefined' && Options.ConfigString in localStorage) {
                try {
                    return JSON.parse(localStorage[Options.ConfigString]);
                }
                catch (error) {
                    return null;
                }
            }
            else {
                return null;
            }
        };
        Options.setUserOptions = function (options) {
            try {
                localStorage.setItem(Options.ConfigString, JSON.stringify(options));
            }
            catch (error) {
                return null;
            }
            return options;
        };
        return Options;
    }());
    Options.ConfigString = "CV.Config";
    CV.Options = Options;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var CRMRecord = (function () {
        function CRMRecord(id, entityLogicalName, entitySchemaName, displayName, entityImage, displayEntityName, objectTypeCode, entityRecord) {
            this.Id = id;
            this.EntityLogicalName = entityLogicalName;
            this.EntitySchemaName = entitySchemaName;
            this.DisplayName = displayName;
            this.EntityImage = entityImage;
            this.DisplayEntityName = displayEntityName;
            this._areConnectionsRetrieved = false;
            this.ObjectTypeCode = objectTypeCode;
            this.EntityRecord = entityRecord;
        }
        Object.defineProperty(CRMRecord.prototype, "AreConnectionsRetrieved", {
            get: function () {
                return this._areConnectionsRetrieved;
            },
            set: function (value) {
                this._areConnectionsRetrieved = value;
                if (value && this.Card != null) {
                    this.Card.AreConnectionsRetrieved = true;
                }
            },
            enumerable: true,
            configurable: true
        });
        CRMRecord.prototype.CreateCardControlWithDisplayName = function (position, _fixed) {
            this.Card = new CV.CardControl(this);
            this.Card.DisplayName = (this.DisplayName != null) ? this.DisplayName : "";
            this.Card.NavigateUri = (CV.connectionViewer.IS_DEMO_MODE) ? "" : Xrm.Page.context.getClientUrl() + "/main.aspx?etn=" + this.EntityLogicalName + "&pagetype=entityrecord&id=%7B" + this.Id
                + "%7D&histKey=" + Math.floor(Math.random() * 1000).toString() + "&newWindow=true";
            this.Card.CrmRecord = this;
            if (position) {
                CV.forceGraph.addNode({ name: this.DisplayName, entityImage: this.EntityImage, id: this.Id, iconURL: CV.CardControl.GetIcon32UrlStatic(this.ObjectTypeCode, this.EntitySchemaName), x: position.x, y: position.y, fixed: _fixed, entityName: this.Card.EntityLogicalName });
            }
            else {
                CV.forceGraph.addNode({ name: this.DisplayName, entityImage: this.EntityImage, id: this.Id, iconURL: CV.CardControl.GetIcon32UrlStatic(this.ObjectTypeCode, this.EntitySchemaName), x: null, y: null, fixed: null, entityName: this.Card.EntityLogicalName });
            }
        };
        return CRMRecord;
    }());
    CV.CRMRecord = CRMRecord;
    var CRMAnnocationRecord = (function (_super) {
        __extends(CRMAnnocationRecord, _super);
        function CRMAnnocationRecord(id, entityLogicalName, entitySchemaName, displayName, displayEntityName, objectTypeCode, entityRecord, subject, documentbody, notetext, createdbyValue, createdbyFormattedValue, createdon, createdonFormattedValue, modifiedbyValue, modifiedbyFormattedValue, modifiedon, modifiedonFormattedValue) {
            var _this = _super.call(this, id, entityLogicalName, entitySchemaName, displayName, null, displayEntityName, objectTypeCode, entityRecord) || this;
            _this.Subject = subject;
            _this.Documentbody = documentbody;
            _this.Notetext = notetext;
            _this.CreatedbyValue = createdbyValue;
            _this.CreatedbyFormattedValue = createdbyFormattedValue;
            _this.Createdon = createdon;
            _this.CreatedonFormattedValue = createdonFormattedValue;
            _this.ModifiedbyValue = modifiedbyValue;
            _this.ModifiedbyFormattedValue = modifiedbyFormattedValue;
            _this.Modifiedon = modifiedon;
            _this.ModifiedonFormattedValue = modifiedonFormattedValue;
            return _this;
        }
        return CRMAnnocationRecord;
    }(CRMRecord));
    CV.CRMAnnocationRecord = CRMAnnocationRecord;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var CRMLink = (function () {
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
                        var con = new CRMLink(entity.getId(CV.connectionViewer), record1, record2, record1.DisplayName, record2.DisplayName, entity.EntityRecord["_record1roleid_value"], entity.EntityRecord["_record2roleid_value"], entity.EntityRecord["_record1roleid_value@OData.Community.Display.V1.FormattedValue"], entity.EntityRecord["_record2roleid_value@OData.Community.Display.V1.FormattedValue"], entity.EntityRecord["description"], entity.EntityRecord["_relatedconnectionid_value"], CRMLinkTypeEnum.Connection, null);
                        list.push(con);
                    }
                }
            }
            return list;
        };
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
                            var con = new CRMLink(k, record1, record2, record1.DisplayName, record2.DisplayName, null, null, null, null, null, null, CRMLinkTypeEnum.ManyToMany, null);
                            list.push(con);
                        }
                    }
                }
            }
            return list;
        };
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
                            var con = new CRMLink(MyGeneralLibrary.getNewGuid(), record1, record2, record1.DisplayName, record2.DisplayName, null, null, attributeMetadataCache[entName][attName].DisplayName.UserLocalizedLabel.Label, null, null, null, CRMLinkTypeEnum.OneToMany, otmrSchemaName);
                            list.push(con);
                        }
                    }
                }
            }
            return list;
        };
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
                            var con = new CRMLink(MyGeneralLibrary.getNewGuid(), record1, record2, record1.DisplayName, record2.DisplayName, null, null, null, attributeMetadataCache[entName][attName].DisplayName.UserLocalizedLabel.Label, null, null, CRMLinkTypeEnum.OneToMany, otmrSchemaName);
                            list.push(con);
                        }
                    }
                }
            }
            return list;
        };
        CRMLink.HaveSameCombinationOfCRMRecords = function (con1, con2) {
            return (con1.CRMRecord1.Id == con2.CRMRecord1.Id && con1.CRMRecord2.Id == con2.CRMRecord2.Id)
                || (con1.CRMRecord1.Id == con2.CRMRecord2.Id && con1.CRMRecord2.Id == con2.CRMRecord1.Id);
        };
        CRMLink.HaveSameContext = function (con1, con2) {
            if (con2.LinkType == CRMLinkTypeEnum.Connection && con1.LinkType == CRMLinkTypeEnum.Connection) {
                if (con1.LinkId == con2.LinkId
                    ||
                        con1.LinkId == con2.RelatedConnectionId) {
                    return true;
                }
            }
            else if (con2.LinkType == CRMLinkTypeEnum.ManyToMany && con1.LinkType == CRMLinkTypeEnum.ManyToMany) {
                if (con2.LinkId == con1.LinkId) {
                    return true;
                }
            }
            else if (con2.LinkType == CRMLinkTypeEnum.OneToMany && con1.LinkType == CRMLinkTypeEnum.OneToMany) {
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
    var CRMLinkTypeEnum;
    (function (CRMLinkTypeEnum) {
        CRMLinkTypeEnum[CRMLinkTypeEnum["Connection"] = 0] = "Connection";
        CRMLinkTypeEnum[CRMLinkTypeEnum["OneToMany"] = 1] = "OneToMany";
        CRMLinkTypeEnum[CRMLinkTypeEnum["ManyToMany"] = 2] = "ManyToMany";
    })(CRMLinkTypeEnum = CV.CRMLinkTypeEnum || (CV.CRMLinkTypeEnum = {}));
})(CV || (CV = {}));
var CV;
(function (CV) {
    var ConnectorControl = (function () {
        function ConnectorControl(crmLink) {
            this.CrmLinkArray = [];
            this.CrmLinkArray.push(crmLink);
        }
        Object.defineProperty(ConnectorControl.prototype, "Card1", {
            get: function () {
                return this._card1;
            },
            set: function (value) {
                this._card1 = value;
                this._card1.AddConnectionConltrol(this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConnectorControl.prototype, "Card2", {
            get: function () {
                return this._card2;
            },
            set: function (value) {
                this._card2 = value;
                this._card2.AddConnectionConltrol(this);
            },
            enumerable: true,
            configurable: true
        });
        ConnectorControl.prototype.addCRMLink = function (crmLink) {
            this.CrmLinkArray.push(crmLink);
            this.Description = "<<複数の関係>>";
            this.Role1 = "";
            this.Role2 = "";
        };
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
var CV;
(function (CV) {
    var Config = (function () {
        function Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList) {
            if (cardStyle === void 0) { cardStyle = CardStyleEnum.Circle; }
            if (defaultCardsLayoutDescription === void 0) { defaultCardsLayoutDescription = "カードレイアウト"; }
            this.ID = id;
            this.Description = description;
            this.CardStyle = cardStyle;
            this.SmallerSizeEnabled = smallerSizeEnabled;
            this.CardsLayoutEnabled = cardsLayoutEnabled;
            this.DefaultCardsLayoutDescription = defaultCardsLayoutDescription;
            this.IsDefault = isDefault;
            this.EntitiesForConnectionList = entitiesForConnectionList;
            this.RelationshipSchemaNameList = relationshipSchemaNameList;
        }
        Config.initConfigWithOptions = function (configSet) {
            try {
                var userOptions = CV.Options.getUserOptions();
                if (userOptions) {
                    for (var i = 0; i < CV.connectionViewer.configSet.ConfigArray.length; i++) {
                        var config = CV.connectionViewer.configSet.ConfigArray[i];
                        if (config.ID == userOptions.ConfigID) {
                            return config;
                        }
                    }
                }
                for (var i = 0; i < CV.connectionViewer.configSet.ConfigArray.length; i++) {
                    var config = CV.connectionViewer.configSet.ConfigArray[i];
                    if (config.IsDefault) {
                        return config;
                    }
                }
                if (0 < CV.connectionViewer.configSet.ConfigArray.length) {
                    return CV.connectionViewer.configSet.ConfigArray[0];
                }
                return Config.getDefaultConfig();
            }
            catch (e) {
                return null;
            }
        };
        Config.getCurrentDefaultConfig = function (configSet) {
            for (var i = 0; i < CV.connectionViewer.configSet.ConfigArray.length; i++) {
                var config = CV.connectionViewer.configSet.ConfigArray[i];
                if (config.IsDefault) {
                    return config;
                }
            }
            if (0 < CV.connectionViewer.configSet.ConfigArray.length) {
                return CV.connectionViewer.configSet.ConfigArray[0];
            }
            return Config.getDefaultConfig();
        };
        Config.getDefaultConfig = function () {
            var id = "Sales";
            var description = "営業部門向けのコンフィグです。取引先企業と取引先担当者、およびつながりレコードとして営業案件が対象です。";
            var cardStyle = CardStyleEnum.Circle;
            var smallerSizeEnabled = true;
            var cardsLayoutEnabled = true;
            var defaultCardsLayoutDescription = "営業部門向けのカードレイアウト";
            var isDefault = true;
            var entitiesForConnectionList = [
                "account",
                "contact",
                "opportunity"
            ];
            var relationshipSchemaNameList = [
                "contact_customer_accounts",
                "account_parent_account"
            ];
            return new Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList);
        };
        Config.getDefaultConfigForSalesRectangle = function () {
            var id = "SalesRectangle";
            var description = "営業部門向けのRectangleスタイルのコンフィグです。取引先企業と取引先担当者、およびつながりレコードとして営業案件が対象です。";
            var cardStyle = CardStyleEnum.Rectangle;
            var smallerSizeEnabled = false;
            var cardsLayoutEnabled = true;
            var defaultCardsLayoutDescription = "営業部門向けのカードレイアウト";
            var isDefault = true;
            var entitiesForConnectionList = [
                "account",
                "contact",
                "opportunity"
            ];
            var relationshipSchemaNameList = [
                "contact_customer_accounts",
                "account_parent_account"
            ];
            return new Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList);
        };
        Config.getDefaultConfigForService = function () {
            var id = "Service";
            var description = "サービス部門向けのコンフィグです。取引先企業、取引先担当者およびサポート案件が対象です。";
            var cardStyle = CardStyleEnum.Circle;
            var smallerSizeEnabled = true;
            var cardsLayoutEnabled = true;
            var defaultCardsLayoutDescription = "サービス部門向けのカードレイアウト";
            var isDefault = false;
            var entitiesForConnectionList = [
                "account",
                "contact",
                "incident"
            ];
            var relationshipSchemaNameList = [
                "contact_customer_accounts",
                "account_parent_account",
                "incident_customer_accounts"
            ];
            return new Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList);
        };
        Config.validate = function (configToCheck) {
            if (!configToCheck.ID)
                throw new Error("IDがありません。");
            if (!configToCheck.EntitiesForConnectionList)
                throw new Error("EntitiesForConnectionListがありません。");
            if (!configToCheck.RelationshipSchemaNameList)
                throw new Error("RelationshipSchemaNameListがありません。");
            return true;
        };
        return Config;
    }());
    CV.Config = Config;
    var CardStyleEnum;
    (function (CardStyleEnum) {
        CardStyleEnum[CardStyleEnum["Circle"] = 0] = "Circle";
        CardStyleEnum[CardStyleEnum["Rectangle"] = 1] = "Rectangle";
    })(CardStyleEnum = CV.CardStyleEnum || (CV.CardStyleEnum = {}));
    ;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var ConfigSet = (function () {
        function ConfigSet(configArray) {
            this.ConfigArray = configArray;
            if (!ConfigSet.checkIDUnique(configArray)) {
                throw "IDに重複があります。";
            }
        }
        ConfigSet.checkIDUnique = function (configArray) {
            var idArray = [];
            for (var i = 0; i < configArray.length; i++) {
                var id = configArray[i].ID;
                if (0 <= idArray.indexOf(id)) {
                    return false;
                }
                idArray.push(id);
            }
            return true;
        };
        ConfigSet.getDefaultConfigSet = function () {
            var configArray = [];
            configArray.push(CV.Config.getDefaultConfig());
            configArray.push(CV.Config.getDefaultConfigForSalesRectangle());
            configArray.push(CV.Config.getDefaultConfigForService());
            return new ConfigSet(configArray);
        };
        ConfigSet.parseConfigSetXmlText = function (configSetXmlText) {
            var configSetToCheck;
            try {
                configSetToCheck = JSON.parse(configSetXmlText);
            }
            catch (error) {
                throw new Error("ConfigSetのJSON.parse()でエラーが発生しました。フォーマットを確認ください。");
            }
            if (!configSetToCheck.ConfigArray)
                throw new Error("ConfigSetのConfigArrayが見つかりません。");
            if (configSetToCheck.ConfigArray.length == 0)
                throw new Error("ConfigSetのConfigArrayの中身が1つも見つかりません。");
            for (var i = 0; i < configSetToCheck.ConfigArray.length; i++) {
                var configToCheck = configSetToCheck.ConfigArray[i];
                try {
                    CV.Config.validate(configToCheck);
                }
                catch (e) {
                    throw new Error("ConfigSetのConfigArrayの" + (i + 1).toString() + "つ目が有効ではありません。" + e.message);
                }
            }
            return configSetToCheck;
        };
        return ConfigSet;
    }());
    CV.ConfigSet = ConfigSet;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var WebAPIRecord = (function () {
        function WebAPIRecord(entitySetName, entityRecord) {
            if (!entitySetName) {
                throw new Error("entitySetName が値を持っていません。CV.WebAPIRecord コンストラクタにて。");
            }
            if (!entityRecord) {
                throw new Error("EntityRecord が値を持っていません。CV.WebAPIRecord コンストラクタにて。");
            }
            this.EntitySetName = entitySetName;
            this.EntityRecord = entityRecord;
        }
        WebAPIRecord.CreateWebAPIRecordSingle = function (requestResponseSingle) {
            try {
                var odataContext = requestResponseSingle["@odata.context"];
                var entitySetName = CV.WebAPIRecord.getEntitySetNameFromOdataContext(odataContext);
                var entityRecord = requestResponseSingle;
                return new WebAPIRecord(entitySetName, entityRecord);
            }
            catch (e) {
                CV.Helper.addErrorMessageln("CV.WebAPIRecord.CreateWebAPIRecordSingle にてエラーが発生しました。" + e.message);
            }
        };
        WebAPIRecord.CreateWebAPIRecordMultiple = function (requestResponseMultiple) {
            var odataContext = requestResponseMultiple["@odata.context"];
            var entitySetName = CV.WebAPIRecord.getEntitySetNameFromOdataContext(odataContext);
            var records = requestResponseMultiple["value"];
            var webAPIRecords = [];
            for (var i = 0; i < records.length; i++) {
                var entityRecord = records[i];
                webAPIRecords.push(new WebAPIRecord(entitySetName, entityRecord));
            }
            return webAPIRecords;
        };
        WebAPIRecord.getEntitySetNameFromOdataContext = function (odataContext) {
            return odataContext.split(/\$metadata#/)[1].split(/\(|\//)[0];
        };
        WebAPIRecord.prototype.getEntityLogicalName = function (cv) {
            var entityLogicalName = cv.EntityLogicalNameKeyIsEntitySetName[this.EntitySetName];
            if (!entityLogicalName)
                throw new Error("エンティティセット名 '" + this.EntitySetName + "' から対応するエンティティロジカル名を取得できません。");
            return entityLogicalName;
        };
        WebAPIRecord.prototype.getId = function (cv) {
            try {
                var entityLogicalName = this.getEntityLogicalName(cv);
                var primaryIdAttributeName = cv.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryIdAttribute;
                return this.EntityRecord[primaryIdAttributeName];
            }
            catch (e) {
                CV.Helper.addErrorMessageln(e.message);
            }
        };
        return WebAPIRecord;
    }());
    CV.WebAPIRecord = WebAPIRecord;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var CRMAccessWebAPI = (function () {
        function CRMAccessWebAPI(connectionViewer) {
            this.connectionViewer = connectionViewer;
            this.asyncOTMRetrievedMetadataDicSchema = {};
            this.asyncMTORetrievedMetadataDicSchema = {};
            this.asyncMTMRetrievedMetadataDicSchema = {};
            this.asyncEMRetrievedEMDicLogical = {};
            this.asyncEMRetrievedEMDicOTC = {};
            this.asyncEMRetrievedEMDicEntitySetName = {};
        }
        CRMAccessWebAPI.prototype.initCRMAccessDeferredized = function () {
            var deferred = $.Deferred();
            CV.ConnectionViewer.showCurrentlyRetrievingStoryboard(true);
            CV.connectionViewer.crmAccess.initCRMMetadataCacheDeferredized()
                .then(CV.connectionViewer.crmAccess.initCRMRecordAccessDeferredized)
                .done(function (record) {
                CV.ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
                deferred.resolve(record);
            }).fail(function (e) {
                deferred.reject(e.toString());
            });
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.initCRMMetadataCacheDeferredized = function () {
            var deferred = $.Deferred();
            $.Deferred().resolve().promise().then(function () {
                return CV.connectionViewer.crmAccess.initAllMetadataCacheDeferredized();
            }).done(function () {
                deferred.resolve();
            }).fail(function (e) {
                deferred.reject(e.toString());
            });
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.initAllMetadataCacheDeferredized = function () {
            var deferred = $.Deferred();
            $.Deferred().resolve().promise().then(function () {
                return CV.connectionViewer.crmAccess.initRelationshipMetadataCacheDeferredized();
            }).then(function (entityList) {
                return CV.connectionViewer.crmAccess.initEntityMetadataCacheDeferredized(entityList);
            }).fail(function (e) {
                deferred.reject(e.toString());
            }).then(function () {
                CV.connectionViewer.AttributeMetadataCache = {};
                for (var entityName in CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName) {
                    for (var i = 0; i < CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityName].Attributes.length; i++) {
                        var attributeMetadata = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityName].Attributes[i];
                        if (CV.connectionViewer.AttributeMetadataCache[entityName] == null) {
                            CV.connectionViewer.AttributeMetadataCache[entityName] = {};
                        }
                        CV.connectionViewer.AttributeMetadataCache[entityName][attributeMetadata.LogicalName] = attributeMetadata;
                    }
                }
                deferred.resolve();
            });
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.initRelationshipMetadataCacheDeferredized = function () {
            var deferred = $.Deferred();
            var entityList;
            $.Deferred().resolve().promise().then(function () {
                try {
                    return CV.connectionViewer.crmAccess.retrieveRMCacheDeferredized(CV.connectionViewer.config.RelationshipSchemaNameList);
                }
                catch (e) {
                    deferred.reject(e.message);
                }
            }).then(function (list) {
                entityList = list;
                CV.connectionViewer.OneToManyRelationshipMetadataCache = CV.connectionViewer.crmAccess.asyncOTMRetrievedMetadataDicSchema;
                CV.connectionViewer.ManyToManyRelationshipMetadataCache = CV.connectionViewer.crmAccess.asyncMTMRetrievedMetadataDicSchema;
                try {
                    return CV.connectionViewer.crmAccess.retrieveAnnotationRMCacheDeferredized(CV.connectionViewer.paramEntityLogicalName);
                }
                catch (e) {
                    deferred.reject(e.message);
                }
            }).then(function (annotationRM) {
                CV.connectionViewer.AnnotationRelationshipMetadataCache = annotationRM;
                deferred.resolve(entityList);
            }).fail(function (e) {
                deferred.reject(e.toString());
            });
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.retrieveRMCacheDeferredized = function (asyncRMToBeRetrievedList) {
            var deferred = $.Deferred();
            if (0 < asyncRMToBeRetrievedList.length) {
                if (CV.connectionViewer.IS_DEMO_MODE) {
                    try {
                        var relationshipArray = CV.Demo_Data.RelationshipMetadataSample;
                        var entityList_1 = [];
                        for (var i in relationshipArray) {
                            var relationship = relationshipArray[i];
                            if (0 <= relationship["@odata.type"].indexOf("OneToManyRelationshipMetadata")) {
                                var otmRelationship = relationship;
                                CV.connectionViewer.crmAccess.asyncOTMRetrievedMetadataDicSchema[otmRelationship.SchemaName] = otmRelationship;
                                if (entityList_1.indexOf(relationship.ReferencedEntity) < 0)
                                    entityList_1.push(relationship.ReferencedEntity);
                                if (entityList_1.indexOf(relationship.ReferencingEntity) < 0)
                                    entityList_1.push(relationship.ReferencingEntity);
                            }
                            else if (0 <= relationship["@odata.type"].indexOf("ManyToManyRelationshipMetadata")) {
                                var mtmRelationship = relationship;
                                CV.connectionViewer.crmAccess.asyncMTMRetrievedMetadataDicSchema[mtmRelationship.SchemaName] = mtmRelationship;
                                if (entityList_1.indexOf(mtmRelationship.Entity1LogicalName) < 0)
                                    entityList_1.push(mtmRelationship.Entity1LogicalName);
                                if (entityList_1.indexOf(mtmRelationship.Entity2LogicalName) < 0)
                                    entityList_1.push(mtmRelationship.Entity2LogicalName);
                                if (entityList_1.indexOf(mtmRelationship.IntersectEntityName) < 0)
                                    entityList_1.push(mtmRelationship.IntersectEntityName);
                            }
                        }
                        deferred.resolve(entityList_1);
                        setTimeout(function () {
                            deferred.resolve(entityList_1);
                        }, CV.Demo_Const.CRMSdkResponseTime);
                    }
                    catch (error) {
                        deferred.reject("このHTMLファイルは単体デモモードでは利用できません。");
                    }
                }
                else {
                    var uri = "/RelationshipDefinitions";
                    for (var i = 0; i < asyncRMToBeRetrievedList.length; i++) {
                        if (i == 0)
                            uri += "?$filter=";
                        else
                            uri += " or ";
                        uri += "SchemaName eq '" + asyncRMToBeRetrievedList[i] + "'";
                    }
                    WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                        .then(function (request) {
                        var relationshipArray = JSON.parse(request.response).value;
                        var entityList = [];
                        for (var i in relationshipArray) {
                            var relationship = relationshipArray[i];
                            if (0 <= relationship["@odata.type"].indexOf("OneToManyRelationshipMetadata")) {
                                var otmRelationship = relationship;
                                CV.connectionViewer.crmAccess.asyncOTMRetrievedMetadataDicSchema[otmRelationship.SchemaName] = otmRelationship;
                                if (entityList.indexOf(relationship.ReferencedEntity) < 0)
                                    entityList.push(relationship.ReferencedEntity);
                                if (entityList.indexOf(relationship.ReferencingEntity) < 0)
                                    entityList.push(relationship.ReferencingEntity);
                            }
                            else if (0 <= relationship["@odata.type"].indexOf("ManyToManyRelationshipMetadata")) {
                                var mtmRelationship = relationship;
                                CV.connectionViewer.crmAccess.asyncMTMRetrievedMetadataDicSchema[mtmRelationship.SchemaName] = mtmRelationship;
                                if (entityList.indexOf(mtmRelationship.Entity1LogicalName) < 0)
                                    entityList.push(mtmRelationship.Entity1LogicalName);
                                if (entityList.indexOf(mtmRelationship.Entity2LogicalName) < 0)
                                    entityList.push(mtmRelationship.Entity2LogicalName);
                                if (entityList.indexOf(mtmRelationship.IntersectEntityName) < 0)
                                    entityList.push(mtmRelationship.IntersectEntityName);
                            }
                        }
                        deferred.resolve(entityList);
                    })
                        .catch(function (e) { deferred.reject(e.message); });
                }
            }
            else {
                deferred.resolve();
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.retrieveAnnotationRMCacheDeferredized = function (entityLogicalName) {
            var deferred = $.Deferred();
            if (CV.connectionViewer.IS_DEMO_MODE) {
                var otmRelationship_1 = CV.Demo_Data.AnnotationRelationshipMetadataSample;
                setTimeout(function () {
                    deferred.resolve(otmRelationship_1);
                }, CV.Demo_Const.CRMSdkResponseTime);
            }
            else {
                var uri = "/RelationshipDefinitions/Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata?$filter=ReferencedEntity eq '";
                uri += CV.connectionViewer.paramEntityLogicalName;
                uri += "' and ReferencingEntity eq 'annotation' and ReferencingAttribute eq 'objectid'";
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then(function (request) {
                    var relationshipArray = JSON.parse(request.response).value;
                    var otmRelationship = relationshipArray[0];
                    deferred.resolve(otmRelationship);
                });
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.initEntityMetadataCacheDeferredized = function (entityListFromRelationship) {
            var deferred = $.Deferred();
            $.Deferred().resolve().promise().then(function () {
                var entitiesToBeCached = [].concat(entityListFromRelationship);
                for (var i = 0; i < CV.connectionViewer.config.EntitiesForConnectionList.length; i++) {
                    var entityName = CV.connectionViewer.config.EntitiesForConnectionList[i];
                    if (entitiesToBeCached.indexOf(entityName) < 0)
                        entitiesToBeCached.push(entityName);
                }
                if (entitiesToBeCached.indexOf("connection") < 0)
                    entitiesToBeCached.push("connection");
                return CV.connectionViewer.crmAccess.retrieveEMCacheDeferredized(entitiesToBeCached);
            }).fail(function (e) {
                deferred.reject(e.toString());
            }).then(function () {
                CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName = CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicLogical;
                CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode = CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicOTC;
                CV.connectionViewer.EntityLogicalNameKeyIsEntitySetName = CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicEntitySetName;
                deferred.resolve();
            });
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.retrieveEMCacheDeferredized = function (asyncEMToBeRetrievedEMList) {
            var deferred = $.Deferred();
            if (CV.connectionViewer.IS_DEMO_MODE) {
                for (var i in CV.Demo_Data.EntityMetadataSample) {
                    var entity = CV.Demo_Data.EntityMetadataSample[i];
                    CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicLogical[entity.LogicalName] = entity;
                    CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicOTC[entity.ObjectTypeCode] = entity;
                    CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicEntitySetName[entity.EntitySetName] = entity.LogicalName;
                }
                setTimeout(function () {
                    deferred.resolve();
                }, CV.Demo_Const.CRMSdkResponseTime);
            }
            else {
                var uri = "/EntityDefinitions?$select=LogicalName,EntitySetName,ObjectTypeCode,PrimaryIdAttribute,PrimaryImageAttribute,PrimaryNameAttribute,SchemaName,DisplayName&$filter=";
                for (var i = 0; i < asyncEMToBeRetrievedEMList.length; i++) {
                    if (i > 0)
                        uri += " or ";
                    uri += "LogicalName eq '" + asyncEMToBeRetrievedEMList[i] + "'";
                }
                uri += "&$expand=Attributes($select=AttributeType,SchemaName,DisplayName,LogicalName,IsPrimaryId,IsPrimaryName;$filter=IsPrimaryId eq true or IsPrimaryName eq true or AttributeType eq Microsoft.Dynamics.CRM.AttributeTypeCode'Lookup' or AttributeType eq Microsoft.Dynamics.CRM.AttributeTypeCode'Customer' or AttributeType eq Microsoft.Dynamics.CRM.AttributeTypeCode'Uniqueidentifier')";
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then(function (request) {
                    var entityMultiple = JSON.parse(request.response);
                    var entityArray = entityMultiple.value;
                    for (var i in entityArray) {
                        var entity = entityArray[i];
                        CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicLogical[entity.LogicalName] = entity;
                        CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicOTC[entity.ObjectTypeCode] = entity;
                        CV.connectionViewer.crmAccess.asyncEMRetrievedEMDicEntitySetName[entity.EntitySetName] = entity.LogicalName;
                    }
                    deferred.resolve();
                })
                    .catch(function (e) { deferred.reject(e.message + " in retrieveEMCacheDeferredized()"); });
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.initCRMRecordAccessDeferredized = function () {
            var deferred = $.Deferred();
            if (CV.connectionViewer.IS_DEMO_MODE) {
                var webAPIRecord_1 = CV.Demo_Data.getPrimaryRecord();
                setTimeout(function () {
                    deferred.resolve(webAPIRecord_1);
                }, CV.Demo_Const.CRMSdkResponseTime);
            }
            else {
                var entityLogicalName = CV.connectionViewer.paramEntityLogicalName;
                var id = CV.connectionViewer.paramGuid;
                if (CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName]) {
                    var entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName;
                    var primaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryIdAttribute;
                    var primaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryNameAttribute;
                    var primaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryImageAttribute;
                    var manyToOneRelationshipMetadataArray = CV.connectionViewer.crmAccess.getManyToOneRelationshipMetadataArray(entityLogicalName);
                    var manyToOneSchemaNames = [];
                    var manyToOneNavPropName = [];
                    for (var i in manyToOneRelationshipMetadataArray) {
                        var mtorm = manyToOneRelationshipMetadataArray[i];
                        if (mtorm.ReferencingEntity == entityLogicalName) {
                            manyToOneSchemaNames.push(mtorm.SchemaName);
                            manyToOneNavPropName.push(mtorm.ReferencingEntityNavigationPropertyName);
                        }
                    }
                    var columnsList = [].concat(primaryIdAttributeName, primaryNameAttributeName, primaryImageAttributeName, manyToOneNavPropName);
                    var uri = "/" + entitySetName + "(" + id + ")?$select=";
                    for (var i = 0; i < columnsList.length; i++) {
                        if (columnsList[i]) {
                            if (i > 0)
                                uri += ",";
                            uri += columnsList[i];
                        }
                    }
                    for (var i = 0; i < manyToOneSchemaNames.length; i++) {
                        if (i == 0) {
                            uri += "&$expand=";
                        }
                        else {
                            uri += ",";
                        }
                        uri += manyToOneNavPropName[i] + "($select=";
                        var expEntityLogicalName = CV.connectionViewer.OneToManyRelationshipMetadataCache[manyToOneSchemaNames[i]].ReferencedEntity;
                        var expPrimaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].PrimaryIdAttribute;
                        uri += expPrimaryIdAttributeName;
                        var expPrimaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].PrimaryNameAttribute;
                        uri += "," + expPrimaryNameAttributeName;
                        var expPrimaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].PrimaryImageAttribute;
                        if (expPrimaryImageAttributeName)
                            uri += "," + expPrimaryImageAttributeName;
                        uri += ")";
                    }
                    WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                        .then(function (request) {
                        var record = JSON.parse(request.response);
                        var webAPIRecord = CV.WebAPIRecord.CreateWebAPIRecordSingle(record);
                        deferred.resolve(webAPIRecord);
                    })
                        .catch(function (e) { deferred.reject(e.message); });
                }
                else {
                    deferred.reject("エンティティ " + entityLogicalName + " のメタデータが取得済みではありません。Configで当該エンティティが設定されていることを確認ください。");
                }
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.retrieveConnAndOTMAndMTOAndMTMRDeferredized = function (record) {
            var deferred = $.Deferred();
            $.when(this.retrieveConnDeferredized(record), this.retrieveOTMRCRMRecordsDeferredized(record), this.retrieveMTORCRMRecordsDeferredized(record), this.retrieveMTMRCRMRecordsDeferredized(record)).done(function () {
                deferred.resolve(record);
            }).fail(function (e) {
                deferred.reject(e);
            });
            return deferred.promise(record);
        };
        CRMAccessWebAPI.prototype.retrieveConnDeferredized = function (record) {
            var deferred = $.Deferred();
            this.asyncRetrievedConnRetrievedEC = null;
            if (CV.connectionViewer.IS_DEMO_MODE) {
                setTimeout(function () {
                    var webAPIRecordArray = CV.Demo_Data.getConnectionRecords(record);
                    CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC = webAPIRecordArray;
                    CV.connectionViewer.crmAccess.retrieveConnTargetCRMRecordsDeferredized(CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC)
                        .done(function () {
                        deferred.resolve();
                    });
                }, CV.Demo_Const.CRMSdkResponseTime);
            }
            else {
                var uri = "/connections?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>  <entity name='connection'>    <attribute name='connectionid' />    <attribute name='description' />    <attribute name='record1id' />    <attribute name='record1objecttypecode' />    <attribute name='record1roleid' />    <attribute name='record2id' />    <attribute name='record2objecttypecode' />    <attribute name='record2roleid' />    <attribute name='relatedconnectionid' />    <filter type='and'>      <condition attribute='record1id' operator='eq' uiname='' uitype='";
                uri += record.EntityLogicalName;
                uri += "' value='{";
                uri += record.Id;
                uri += "}' />    </filter>  </entity></fetch>";
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then(function (request) {
                    var recordArray = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));
                    CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC = recordArray;
                    return CV.connectionViewer.crmAccess.retrieveConnTargetCRMRecordsDeferredized(CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC);
                }).then(function () {
                    deferred.resolve();
                })
                    .catch(function (e) {
                    deferred.reject(e.message);
                });
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.retrieveConnTargetCRMRecordsDeferredized = function (connectionRecords) {
            this.asyncRetrievedConnTargetCRMRecordRetrievedEC = [];
            var promises = [];
            $.each(connectionRecords, function (index, connectionRecord) {
                var deferred = $.Deferred();
                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        var webAPIRecord = CV.Demo_Data.getConnectionTargetCRMRecords(connectionRecord);
                        if (webAPIRecord)
                            CV.connectionViewer.crmAccess.asyncRetrievedConnTargetCRMRecordRetrievedEC.push(webAPIRecord);
                        deferred.resolve();
                    }, CV.Demo_Const.CRMSdkResponseTime);
                }
                else {
                    var objectTypeCode = connectionRecord.EntityRecord["record2objecttypecode"];
                    var emCache = CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[objectTypeCode];
                    if (!emCache) {
                        deferred.resolve();
                    }
                    else {
                        var entityLogicalName = CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[objectTypeCode].LogicalName;
                        if (0 <= CV.connectionViewer.config.EntitiesForConnectionList.indexOf(entityLogicalName)) {
                            var entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode[objectTypeCode].EntitySetName;
                            var uri = "/" + entitySetName + "(" + connectionRecord.EntityRecord["_record2id_value"] + ")";
                            uri += "?$select=";
                            var primaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryIdAttribute;
                            uri += primaryIdAttributeName;
                            var primaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryNameAttribute;
                            uri += "," + primaryNameAttributeName;
                            var primaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryImageAttribute;
                            if (primaryImageAttributeName)
                                uri += "," + primaryImageAttributeName;
                            WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                                .then(function (request) {
                                var record = JSON.parse(request.response);
                                var webAPIRecord = CV.WebAPIRecord.CreateWebAPIRecordSingle(record);
                                if (webAPIRecord)
                                    CV.connectionViewer.crmAccess.asyncRetrievedConnTargetCRMRecordRetrievedEC.push(webAPIRecord);
                                deferred.resolve();
                            })
                                .catch(function (e) {
                                if (!CV.CRMAccessWebAPI.IsIgnorableError(e.message)) {
                                    CV.Helper.addErrorMessageln(e.message);
                                }
                                deferred.resolve();
                            });
                        }
                        else {
                            deferred.resolve();
                        }
                    }
                }
                promises.push(deferred);
                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        };
        CRMAccessWebAPI.prototype.retrieveMTMRCRMRecordsDeferredized = function (record) {
            var deferred = $.Deferred();
            if (CV.connectionViewer.ManyToManyRelationshipMetadataCache != null) {
                this.asyncRetrievedMTMRRetrievedECDic = null;
                var paramManyToManyRelationshipMetadataArray = [];
                for (var k in CV.connectionViewer.ManyToManyRelationshipMetadataCache) {
                    var mtmrm = CV.connectionViewer.ManyToManyRelationshipMetadataCache[k];
                    if (mtmrm.Entity1LogicalName == record.EntityLogicalName || mtmrm.Entity2LogicalName == record.EntityLogicalName) {
                        paramManyToManyRelationshipMetadataArray.push(mtmrm);
                    }
                }
                this.retrieveMTMRCRMRecordsByEachRelationshipDeferredized(record, paramManyToManyRelationshipMetadataArray)
                    .done(function () {
                    deferred.resolve();
                });
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.retrieveMTMRCRMRecordsByEachRelationshipDeferredized = function (crmRecord, relationships) {
            var promises = [];
            $.each(relationships, function (index, mtmrm) {
                var deferred = $.Deferred();
                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        deferred.resolve();
                    }, CV.Demo_Const.CRMSdkResponseTime);
                }
                else {
                    var entityLogicalName = mtmrm.IntersectEntityName;
                    var entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName;
                    var primaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[crmRecord.EntityLogicalName].PrimaryIdAttribute;
                    var referencedId = crmRecord.Id;
                    var uri = "/" + entitySetName;
                    uri += "?$filter=" + primaryIdAttributeName + " eq " + referencedId;
                    WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                        .then(function (request) {
                        var recordArray = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));
                        if (CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic == null) {
                            CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic = {};
                        }
                        for (var i = 0; i < recordArray.length; i++) {
                            var record = recordArray[i];
                            if (!(mtmrm.SchemaName in CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic)) {
                                CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic[mtmrm.SchemaName] = [];
                            }
                            CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic[mtmrm.SchemaName].push(record);
                        }
                        return CV.connectionViewer.crmAccess.retrieveMTMRTargetCRMRecordsDeferredized(crmRecord, CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic);
                    }).then(function () {
                        deferred.resolve();
                    }).catch(function (e) {
                        deferred.reject(e.toString());
                    });
                }
                promises.push(deferred);
                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        };
        CRMAccessWebAPI.prototype.retrieveMTMRTargetCRMRecordsDeferredized = function (sourceRecord, manyToManyEntityCollectionDic) {
            this.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic = {};
            var promises = [];
            $.each(manyToManyEntityCollectionDic, function (schemaName, recordArray) {
                var deferred = $.Deferred();
                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        deferred.resolve();
                    }, CV.Demo_Const.CRMSdkResponseTime);
                }
                else {
                    var mtmrm = CV.connectionViewer.ManyToManyRelationshipMetadataCache[schemaName];
                    var entityLogicalName = (mtmrm.Entity1LogicalName == sourceRecord.EntityLogicalName) ? mtmrm.Entity2LogicalName : mtmrm.Entity1LogicalName;
                    var entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName;
                    var primaryIdAttributeName = (mtmrm.Entity1LogicalName == sourceRecord.EntityLogicalName) ? mtmrm.Entity2IntersectAttribute : mtmrm.Entity1IntersectAttribute;
                    var primaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryNameAttribute;
                    var primaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryImageAttribute;
                    var idArray = [];
                    var intersectEntityId_1 = {};
                    for (var j in recordArray) {
                        var record = recordArray[j];
                        var id = record.EntityRecord[primaryIdAttributeName];
                        idArray.push(id);
                        intersectEntityId_1[id] = record.getId(CV.connectionViewer);
                    }
                    var uri = "/" + entitySetName;
                    uri += "?$select=" + primaryIdAttributeName + "," + primaryNameAttributeName;
                    if (primaryImageAttributeName)
                        uri += "," + primaryImageAttributeName;
                    for (var i = 0; i < idArray.length; i++) {
                        if (i == 0)
                            uri += "&$filter=";
                        else
                            uri += " or ";
                        uri += primaryIdAttributeName + " eq " + idArray[i];
                    }
                    WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                        .then(function (request) {
                        var recordArray = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));
                        for (var i in recordArray) {
                            var record = recordArray[i];
                            var interEntId = intersectEntityId_1[record.getId(CV.connectionViewer)];
                            if (!CV.connectionViewer.crmAccess.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic[interEntId]) {
                                CV.connectionViewer.crmAccess.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic[interEntId] = [];
                            }
                            CV.connectionViewer.crmAccess.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic[interEntId].push(record);
                        }
                        deferred.resolve();
                    }).catch(function (e) {
                        CV.Helper.addErrorMessageln(e.message);
                        deferred.reject(e.message);
                    });
                }
                promises.push(deferred);
                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        };
        CRMAccessWebAPI.prototype.retrieveOTMRCRMRecordsDeferredized = function (record) {
            var deferred = $.Deferred();
            if (CV.connectionViewer.OneToManyRelationshipMetadataCache != null) {
                this.asyncRetrievedOTMRRetrievedECDic = null;
                var paramOneToManyRelationshipMetadataArray = [];
                for (var k in CV.connectionViewer.OneToManyRelationshipMetadataCache) {
                    var otmrm = CV.connectionViewer.OneToManyRelationshipMetadataCache[k];
                    if (otmrm.ReferencedEntity == record.EntityLogicalName) {
                        paramOneToManyRelationshipMetadataArray.push(otmrm);
                    }
                }
                this.retrieveOTMRCRMRecordsByEachRelationshipDeferredized(record, paramOneToManyRelationshipMetadataArray)
                    .done(function () {
                    deferred.resolve();
                });
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.retrieveOTMRCRMRecordsByEachRelationshipDeferredized = function (crmRecord, relationships) {
            var promises = [];
            $.each(relationships, function (index, otmrm) {
                var deferred = $.Deferred();
                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        var recordArray = CV.Demo_Data.getOneToManyRelationshipCRMRecordsByEachRelationship(crmRecord, otmrm);
                        if (CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic == null) {
                            CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic = {};
                        }
                        for (var i = 0; i < recordArray.length; i++) {
                            var record = recordArray[i];
                            if (!(otmrm.SchemaName in CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic)) {
                                CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic[otmrm.SchemaName] = [];
                            }
                            CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic[otmrm.SchemaName].push(record);
                        }
                        deferred.resolve();
                    }, CV.Demo_Const.CRMSdkResponseTime);
                }
                else {
                    if (crmRecord.EntityLogicalName == CV.connectionViewer.OneToManyRelationshipMetadataCache[otmrm.SchemaName].ReferencedEntity) {
                        var entityLogicalName = otmrm.ReferencingEntity;
                        var entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName;
                        var primaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryIdAttribute;
                        var primaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryNameAttribute;
                        var primaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryImageAttribute;
                        var navPropName = otmrm.ReferencingEntityNavigationPropertyName;
                        var referencedAttributeName = otmrm.ReferencedAttribute;
                        var uri = "/" + entitySetName + "?$select=" + primaryIdAttributeName + "," + primaryNameAttributeName + "," + navPropName;
                        if (primaryImageAttributeName)
                            uri += "," + primaryImageAttributeName;
                        uri += "," + navPropName;
                        uri += "&$filter=" + navPropName + "/" + referencedAttributeName + " eq " + crmRecord.Id;
                        WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                            .then(function (request) {
                            var recordArray = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));
                            if (CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic == null) {
                                CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic = {};
                            }
                            for (var i = 0; i < recordArray.length; i++) {
                                var record = recordArray[i];
                                if (!(otmrm.SchemaName in CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic)) {
                                    CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic[otmrm.SchemaName] = [];
                                }
                                CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic[otmrm.SchemaName].push(record);
                            }
                            deferred.resolve();
                        })
                            .catch(function (e) {
                            deferred.reject(e.message);
                        });
                    }
                    else {
                        deferred.resolve();
                    }
                }
                promises.push(deferred);
                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        };
        CRMAccessWebAPI.prototype.retrieveMTORCRMRecordsDeferredized = function (record) {
            var deferred = $.Deferred();
            if (CV.connectionViewer.OneToManyRelationshipMetadataCache != null) {
                this.asyncRetrievedMTORRetrievedECDic = null;
                var paramManyToOneRelationshipMetadataArray = [];
                for (var k in CV.connectionViewer.OneToManyRelationshipMetadataCache) {
                    var otmrm = CV.connectionViewer.OneToManyRelationshipMetadataCache[k];
                    if (otmrm.ReferencingEntity == record.EntityLogicalName) {
                        paramManyToOneRelationshipMetadataArray.push(otmrm);
                    }
                }
                this.retrieveMTORCRMRecordsByEachRelationshipDeferredized(record, paramManyToOneRelationshipMetadataArray)
                    .done(function () {
                    deferred.resolve();
                });
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.retrieveMTORCRMRecordsByEachRelationshipDeferredized = function (crmRecord, relationships) {
            var promises = [];
            $.each(relationships, function (index, mtorm) {
                var deferred = $.Deferred();
                if (CV.connectionViewer.IS_DEMO_MODE) {
                    setTimeout(function () {
                        var recordOfMany = CV.Demo_Data.getManyToOneRelationshipCRMRecordsByEachRelationship(crmRecord, mtorm);
                        if (recordOfMany) {
                            var expEntityLogicalName = CV.connectionViewer.OneToManyRelationshipMetadataCache[mtorm.SchemaName].ReferencedEntity;
                            var recordOfOne = null;
                            for (var k in recordOfMany.EntityRecord) {
                                if (typeof (recordOfMany.EntityRecord[k]) == "object") {
                                    var expEntitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName].EntitySetName;
                                    var expEntityRecord = recordOfMany.EntityRecord[k];
                                    if (expEntityRecord != null) {
                                        recordOfOne = new CV.WebAPIRecord(expEntitySetName, expEntityRecord);
                                    }
                                    else {
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
                        deferred.resolve();
                    }, CV.Demo_Const.CRMSdkResponseTime);
                }
                else {
                    if (crmRecord.EntityLogicalName == CV.connectionViewer.OneToManyRelationshipMetadataCache[mtorm.SchemaName].ReferencingEntity) {
                        var entityLogicalName = crmRecord.EntityLogicalName;
                        var referencedId = crmRecord.Id;
                        var entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName;
                        var navPropName = CV.connectionViewer.OneToManyRelationshipMetadataCache[mtorm.SchemaName].ReferencingEntityNavigationPropertyName;
                        var expEntityLogicalName_1 = CV.connectionViewer.OneToManyRelationshipMetadataCache[mtorm.SchemaName].ReferencedEntity;
                        var expPrimaryIdAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName_1].PrimaryIdAttribute;
                        var expPrimaryNameAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName_1].PrimaryNameAttribute;
                        var expPrimaryImageAttributeName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName_1].PrimaryImageAttribute;
                        var uri = "/" + entitySetName + "(" + referencedId + ")?$select=" + navPropName;
                        uri += "&$expand=" + navPropName + "($select=" + expPrimaryIdAttributeName + "," + expPrimaryNameAttributeName;
                        if (expPrimaryImageAttributeName)
                            uri += "," + expPrimaryImageAttributeName;
                        uri += ")";
                        WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                            .then(function (request) {
                            var recordOfMany = CV.WebAPIRecord.CreateWebAPIRecordSingle(JSON.parse(request.response));
                            var recordOfOne = null;
                            for (var k in recordOfMany.EntityRecord) {
                                if (typeof (recordOfMany.EntityRecord[k]) == "object") {
                                    var expEntitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[expEntityLogicalName_1].EntitySetName;
                                    var expEntityRecord = recordOfMany.EntityRecord[k];
                                    if (expEntityRecord != null) {
                                        recordOfOne = new CV.WebAPIRecord(expEntitySetName, expEntityRecord);
                                    }
                                    else {
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
                            deferred.resolve();
                        })
                            .catch(function (e) {
                            if (!CV.CRMAccessWebAPI.IsIgnorableError(e.message)) {
                                CV.Helper.addErrorMessageln(e.message);
                            }
                            deferred.resolve();
                        });
                    }
                    else {
                        deferred.resolve();
                    }
                }
                promises.push(deferred);
                return deferred.promise();
            });
            return $.when.apply($, promises).promise();
        };
        CRMAccessWebAPI.prototype.retrieveConfigSetXmlTextDeferredized = function () {
            var deferred = $.Deferred();
            if (CV.connectionViewer.IS_DEMO_MODE) {
                setTimeout(function () {
                    var configSet = CV.ConfigSet.getDefaultConfigSet();
                    var configArray = configSet.ConfigArray;
                    var configArrayObj = { "ConfigArray": configArray };
                    var text = JSON.stringify(configArrayObj);
                    deferred.resolve(text);
                }, CV.Demo_Const.CRMSdkResponseTime);
            }
            else {
                var clientUrl;
                if (Xrm.Page.context != null) {
                    clientUrl = Xrm.Page.context.getClientUrl();
                }
                else {
                    clientUrl = parent.Xrm.Page.context.getClientUrl();
                }
                var url = clientUrl + "/WebResources/" + CV.ConnectionViewer.CRM_PUBLISHER_PREFIX + "_/" + CV.ConnectionViewer.CRM_SOLUTION_NAME + "/CV/Data/ConfigSet.xml";
                $.get(url).done(function (configSetXml) {
                    deferred.resolve(configSetXml.documentElement.textContent);
                });
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.prototype.getManyToOneRelationshipMetadataArray = function (entityLogicalName) {
            var paramManyToOneRelationshipMetadataArray = [];
            for (var schemaName in CV.connectionViewer.OneToManyRelationshipMetadataCache) {
                var otmrm = CV.connectionViewer.OneToManyRelationshipMetadataCache[schemaName];
                if (otmrm.ReferencingEntity == entityLogicalName) {
                    paramManyToOneRelationshipMetadataArray.push(otmrm);
                }
            }
            return paramManyToOneRelationshipMetadataArray;
        };
        CRMAccessWebAPI.retrieveAnnotationRecordForCardsLayoutDeferredized = function (annotationId) {
            var deferred = $.Deferred();
            if (!annotationId) {
                var navPropName = CV.connectionViewer.AnnotationRelationshipMetadataCache.ReferencingEntityNavigationPropertyName;
                var refAttr = CV.connectionViewer.AnnotationRelationshipMetadataCache.ReferencedAttribute;
                var refAttrVal = CV.connectionViewer.paramGuid;
                var uri = "/annotations?$select=subject,documentbody,notetext,_createdby_value,createdon,_modifiedby_value,modifiedon&$orderby=createdon desc&$filter=";
                uri += navPropName + "/" + refAttr + " eq " + refAttrVal;
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then(function (request) {
                    var recordArray = CV.WebAPIRecord.CreateWebAPIRecordMultiple(JSON.parse(request.response));
                    deferred.resolve(recordArray);
                })
                    .catch(function (e) {
                    deferred.reject(e.message);
                });
            }
            else {
                var uri = "/annotations(" + annotationId + ")";
                uri += "?$select=subject,documentbody,notetext,_createdby_value,createdon,_modifiedby_value,modifiedon";
                WebAPI.request("GET", uri, null, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                    .then(function (request) {
                    var record = CV.WebAPIRecord.CreateWebAPIRecordSingle(JSON.parse(request.response));
                    if (record)
                        deferred.resolve([record]);
                    else
                        deferred.reject("GUID = '" + annotationId + "'のメモレコードが取得できませんでした。");
                })
                    .catch(function (e) {
                    deferred.reject(e.message);
                });
            }
            return deferred.promise();
        };
        CRMAccessWebAPI.createAnnotationRecordForCardsLayoutDeferredized = function (cardsLayout, notetext) {
            var deferred = $.Deferred();
            var odata_entityid;
            var uri = "/annotations";
            var data = {
                "subject": "つながりビューワーのカードレイアウト",
                "documentbody": btoa(encodeURI(JSON.stringify(cardsLayout))),
                "notetext": notetext,
            };
            WebAPI.request("POST", uri, data, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2")
                .then(function (request) {
                odata_entityid = request.getResponseHeader("OData-EntityId");
                if (!odata_entityid)
                    deferred.reject("メモレコードが正しく作成されませんでした。OData-EntityId ヘッダーの値がありません。");
                var entityLogicalName = CV.connectionViewer.paramEntityLogicalName;
                var entitySetName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].EntitySetName;
                if (!entitySetName)
                    deferred.reject("エンティティ'" + entityLogicalName + "'のエンティティセット名が正しく取得できませんでした。");
                var id = CV.connectionViewer.paramGuid;
                var referencedEntityNavigationPropertyName = CV.connectionViewer.AnnotationRelationshipMetadataCache.ReferencedEntityNavigationPropertyName;
                var uri = "/" + entitySetName + "(" + id + ")/" + referencedEntityNavigationPropertyName + "/$ref";
                var data = {
                    "@odata.id": odata_entityid
                };
                return WebAPI.request("POST", uri, data, true, CRMAccessWebAPI.MaxPageSize, "/api/data/v8.2");
            }).then(function (request) {
                deferred.resolve(odata_entityid);
            })
                .catch(function (e) {
                deferred.reject(e.message);
            });
            return deferred.promise();
        };
        CRMAccessWebAPI.IsIgnorableError = function (errorMessage) {
            return errorMessage.indexOf("SecLib::AccessCheckEx failed.") == 0 && 0 < errorMessage.indexOf("AccessRights: ReadAccess");
        };
        return CRMAccessWebAPI;
    }());
    CRMAccessWebAPI.MaxPageSize = 5000;
    CV.CRMAccessWebAPI = CRMAccessWebAPI;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var Demo_Data = (function () {
        function Demo_Data() {
        }
        Demo_Data.getEntityLogicalNameAndGuidFromParameter = function () {
            return {
                entityLogicalName: "contact",
                guid: Demo_Data.getPrimaryRecord().EntityRecord["contactid"]
            };
        };
        Demo_Data.getPrimaryRecord = function () {
            var entityRecord = {
                "contactid": "0683f907-720f-e711-80e8-480fcff29761",
                "fullname": "森山 三郎"
            };
            var record = new CV.WebAPIRecord("contacts", entityRecord);
            return record;
        };
        Demo_Data.getConnectionRecords = function (primary) {
            var result = [];
            var toBeWebAPIRecord = [];
            if (primary.Id == "0683f907-720f-e711-80e8-480fcff29761") {
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"942165\"", "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "26dba2f3-1924-e711-80ee-480fcff2d601", "_record1id_value@OData.Community.Display.V1.FormattedValue": "森山 三郎", "_record1id_value": "0683f907-720f-e711-80e8-480fcff29761", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "最高意思決定者", "_record1roleid_value": "adccf191-576b-463b-be78-019a427eb2e5", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record1objecttypecode": 2, "connectionid": "27dba2f3-1924-e711-80ee-480fcff2d601", "_record2id_value@OData.Community.Display.V1.FormattedValue": "AR025を10台", "_record2id_value": "4883f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "営業案件 ", "record2objecttypecode": 3 } });
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"1044833\"", "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "7b1bdfd1-372e-e711-80f1-480fcff2e771", "_record1id_value@OData.Community.Display.V1.FormattedValue": "森山 三郎", "_record1id_value": "0683f907-720f-e711-80e8-480fcff29761", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "友人", "_record1roleid_value": "3a71217e-5941-4c4e-a6e8-7fb4df02d5db", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record1objecttypecode": 2, "connectionid": "7a1bdfd1-372e-e711-80f1-480fcff2e771", "_record2id_value@OData.Community.Display.V1.FormattedValue": "加治佐 健", "_record2id_value": "0083f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record2objecttypecode": 2, "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "友人", "_record2roleid_value": "3a71217e-5941-4c4e-a6e8-7fb4df02d5db", "description": "OK大学時代のスキー部" } });
            }
            else if (primary.Id == "0083f907-720f-e711-80e8-480fcff29761") {
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"942402\"", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "以前の社員", "_record1roleid_value": "63e69a22-8e7f-4524-be97-37e05480f7f0", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record1objecttypecode": 2, "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "以前の勤務先", "_record2roleid_value": "a428209a-89af-4661-b9bb-9bf455dc0c09", "_record1id_value@OData.Community.Display.V1.FormattedValue": "加治佐 健", "_record1id_value": "0083f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先企業 ", "record2objecttypecode": 1, "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "e1d2cbef-df24-e711-80ee-480fcff207f1", "connectionid": "e2d2cbef-df24-e711-80ee-480fcff207f1", "description": "2014年3月まで", "_record2id_value@OData.Community.Display.V1.FormattedValue": "港コンピュータ株式会社", "_record2id_value": "ea82f907-720f-e711-80e8-480fcff29761" } });
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"1044832\"", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "友人", "_record1roleid_value": "3a71217e-5941-4c4e-a6e8-7fb4df02d5db", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record1objecttypecode": 2, "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "友人", "_record2roleid_value": "3a71217e-5941-4c4e-a6e8-7fb4df02d5db", "_record1id_value@OData.Community.Display.V1.FormattedValue": "加治佐 健", "_record1id_value": "0083f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record2objecttypecode": 2, "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "7a1bdfd1-372e-e711-80f1-480fcff2e771", "connectionid": "7b1bdfd1-372e-e711-80f1-480fcff2e771", "description": "OK大学時代のスキー部", "_record2id_value@OData.Community.Display.V1.FormattedValue": "森山 三郎", "_record2id_value": "0683f907-720f-e711-80e8-480fcff29761" } });
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"1043971\"", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "配偶者またはパートナー", "_record1roleid_value": "ee375944-5415-437d-9336-7698cf665b26", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record1objecttypecode": 2, "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "配偶者またはパートナー", "_record2roleid_value": "ee375944-5415-437d-9336-7698cf665b26", "_record1id_value@OData.Community.Display.V1.FormattedValue": "加治佐 健", "_record1id_value": "0083f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record2objecttypecode": 2, "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "cb790252-c22b-e711-80f0-480fcff2f771", "connectionid": "ca790252-c22b-e711-80f0-480fcff2f771", "_record2id_value@OData.Community.Display.V1.FormattedValue": "清岡 裕美子", "_record2id_value": "0e83f907-720f-e711-80e8-480fcff29761" } });
            }
            else if (primary.Id == "ea82f907-720f-e711-80e8-480fcff29761") {
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"942403\"", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "以前の勤務先", "_record1roleid_value": "a428209a-89af-4661-b9bb-9bf455dc0c09", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先企業 ", "record1objecttypecode": 1, "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "以前の社員", "_record2roleid_value": "63e69a22-8e7f-4524-be97-37e05480f7f0", "_record1id_value@OData.Community.Display.V1.FormattedValue": "港コンピュータ株式会社", "_record1id_value": "ea82f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record2objecttypecode": 2, "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "e2d2cbef-df24-e711-80ee-480fcff207f1", "connectionid": "e1d2cbef-df24-e711-80ee-480fcff207f1", "description": "2014年3月まで", "_record2id_value@OData.Community.Display.V1.FormattedValue": "加治佐 健", "_record2id_value": "0083f907-720f-e711-80e8-480fcff29761" } });
            }
            else if (primary.Id == "4883f907-720f-e711-80e8-480fcff29761") {
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"942155\"", "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "予算決裁者", "_record2roleid_value": "935e8a38-03dd-4fe2-9974-65266bf6fd33", "_record1id_value@OData.Community.Display.V1.FormattedValue": "AR025を10台", "_record1id_value": "4883f907-720f-e711-80e8-480fcff29761", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "営業案件 ", "record1objecttypecode": 3, "connectionid": "2d9a86eb-1924-e711-80ee-480fcff2d601", "_record2id_value@OData.Community.Display.V1.FormattedValue": "赤城 紀子", "_record2id_value": "fa82f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record2objecttypecode": 2, "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "2e9a86eb-1924-e711-80ee-480fcff2d601" } });
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"942164\"", "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "最高意思決定者", "_record2roleid_value": "adccf191-576b-463b-be78-019a427eb2e5", "_record1id_value@OData.Community.Display.V1.FormattedValue": "AR025を10台", "_record1id_value": "4883f907-720f-e711-80e8-480fcff29761", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "営業案件 ", "record1objecttypecode": 3, "connectionid": "26dba2f3-1924-e711-80ee-480fcff2d601", "_record2id_value@OData.Community.Display.V1.FormattedValue": "森山 三郎", "_record2id_value": "0683f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record2objecttypecode": 2, "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "27dba2f3-1924-e711-80ee-480fcff2d601" } });
            }
            else if (primary.Id == "fa82f907-720f-e711-80e8-480fcff29761") {
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"942156\"", "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "2d9a86eb-1924-e711-80ee-480fcff2d601", "_record1id_value@OData.Community.Display.V1.FormattedValue": "赤城 紀子", "_record1id_value": "fa82f907-720f-e711-80e8-480fcff29761", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "予算決裁者", "_record1roleid_value": "935e8a38-03dd-4fe2-9974-65266bf6fd33", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record1objecttypecode": 2, "connectionid": "2e9a86eb-1924-e711-80ee-480fcff2d601", "_record2id_value@OData.Community.Display.V1.FormattedValue": "AR025を10台", "_record2id_value": "4883f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "営業案件 ", "record2objecttypecode": 3 } });
            }
            else if (primary.Id == "0e83f907-720f-e711-80e8-480fcff29761") {
                toBeWebAPIRecord.push({ "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"1043970\"", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record1objecttypecode": 2, "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "配偶者またはパートナー", "_record2roleid_value": "ee375944-5415-437d-9336-7698cf665b26", "_record1id_value@OData.Community.Display.V1.FormattedValue": "清岡 裕美子", "_record1id_value": "0e83f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record2objecttypecode": 2, "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "ca790252-c22b-e711-80f0-480fcff2f771", "connectionid": "cb790252-c22b-e711-80f0-480fcff2f771", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "配偶者またはパートナー", "_record1roleid_value": "ee375944-5415-437d-9336-7698cf665b26", "_record2id_value@OData.Community.Display.V1.FormattedValue": "加治佐 健", "_record2id_value": "0083f907-720f-e711-80e8-480fcff29761" } }, { "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"1044871\"", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record1objecttypecode": 2, "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "同僚", "_record2roleid_value": "39c47e14-d479-457b-bbb6-bd43af886a05", "_record1id_value@OData.Community.Display.V1.FormattedValue": "清岡 裕美子", "_record1id_value": "0e83f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record2objecttypecode": 2, "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "0ccfb5f9-d92e-e711-80f0-480fcff2f771", "connectionid": "0dcfb5f9-d92e-e711-80f0-480fcff2f771", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "同僚", "_record1roleid_value": "39c47e14-d479-457b-bbb6-bd43af886a05", "_record2id_value@OData.Community.Display.V1.FormattedValue": "赤城 貴子", "_record2id_value": "fc82f907-720f-e711-80e8-480fcff29761", "description": "アドベンチャーワークスで同僚" } }, { "EntitySetName": "connections", "EntityRecord": { "@odata.etag": "W/\"1044889\"", "record1objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record1objecttypecode": 2, "_record2roleid_value@OData.Community.Display.V1.FormattedValue": "友人", "_record2roleid_value": "3a71217e-5941-4c4e-a6e8-7fb4df02d5db", "_record1id_value@OData.Community.Display.V1.FormattedValue": "清岡 裕美子", "_record1id_value": "0e83f907-720f-e711-80e8-480fcff29761", "record2objecttypecode@OData.Community.Display.V1.FormattedValue": "取引先担当者 ", "record2objecttypecode": 2, "_relatedconnectionid_value@OData.Community.Display.V1.FormattedValue": null, "_relatedconnectionid_value": "cb7d541e-da2e-e711-80f0-480fcff2f771", "connectionid": "cc7d541e-da2e-e711-80f0-480fcff2f771", "_record1roleid_value@OData.Community.Display.V1.FormattedValue": "友人", "_record1roleid_value": "3a71217e-5941-4c4e-a6e8-7fb4df02d5db", "_record2id_value@OData.Community.Display.V1.FormattedValue": "赤城 貴子", "_record2id_value": "fc82f907-720f-e711-80e8-480fcff29761", "description": "SJ大学時代のスキー部" } });
            }
            for (var i in toBeWebAPIRecord) {
                result.push(new CV.WebAPIRecord(toBeWebAPIRecord[i].EntitySetName, toBeWebAPIRecord[i].EntityRecord));
            }
            return result;
        };
        Demo_Data.getConnectionTargetCRMRecords = function (connectionRecord) {
            var result;
            var _record;
            if (connectionRecord.EntityRecord["_record2id_value"] == "4883f907-720f-e711-80e8-480fcff29761") {
                _record = { "EntitySetName": "opportunities", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#opportunities(opportunityid,name)/$entity", "@odata.etag": "W/\"583061\"", "opportunityid": "4883f907-720f-e711-80e8-480fcff29761", "name": "AR025を10台" } };
            }
            else if (connectionRecord.EntityRecord["_record2id_value"] == "0083f907-720f-e711-80e8-480fcff29761") {
                _record = { "EntitySetName": "contacts", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#contacts(contactid,fullname)/$entity", "@odata.etag": "W/\"583147\"", "contactid": "0083f907-720f-e711-80e8-480fcff29761", "fullname": "加治佐 健" } };
            }
            else if (connectionRecord.EntityRecord["_record2id_value"] == "0683f907-720f-e711-80e8-480fcff29761") {
                _record = { "EntitySetName": "contacts", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#contacts(contactid,fullname)/$entity", "@odata.etag": "W/\"583154\"", "contactid": "0683f907-720f-e711-80e8-480fcff29761", "fullname": "森山 三郎" } };
            }
            else if (connectionRecord.EntityRecord["_record2id_value"] == "ea82f907-720f-e711-80e8-480fcff29761") {
                _record = { "EntitySetName": "accounts", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#accounts(accountid,name)/$entity", "@odata.etag": "W/\"583338\"", "accountid": "ea82f907-720f-e711-80e8-480fcff29761", "name": "港コンピュータ株式会社", "entityimage": "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" } };
            }
            else if (connectionRecord.EntityRecord["_record2id_value"] == "0e83f907-720f-e711-80e8-480fcff29761") {
                _record = { "EntitySetName": "contacts", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#contacts(contactid,fullname)/$entity", "@odata.etag": "W/\"583163\"", "contactid": "0e83f907-720f-e711-80e8-480fcff29761", "fullname": "清岡 裕美子" } };
            }
            else if (connectionRecord.EntityRecord["_record2id_value"] == "fa82f907-720f-e711-80e8-480fcff29761") {
                _record = { "EntitySetName": "contacts", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#contacts(contactid,fullname)/$entity", "@odata.etag": "W/\"1044777\"", "contactid": "fa82f907-720f-e711-80e8-480fcff29761", "fullname": "赤城 紀子", "entityimage": "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" } };
            }
            else if (connectionRecord.EntityRecord["_record2id_value"] == "") {
                _record = { "EntitySetName": "contacts", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#contacts(contactid,fullname)/$entity", "@odata.etag": "W/\"1044762\"", "contactid": "fc82f907-720f-e711-80e8-480fcff29761", "fullname": "赤城 貴子" } };
            }
            if (_record)
                result = new CV.WebAPIRecord(_record.EntitySetName, _record.EntityRecord);
            return result;
        };
        Demo_Data.getOneToManyRelationshipCRMRecordsByEachRelationship = function (crmRecord, otmrm) {
            var result = [];
            var toBeWebAPIRecord = [];
            if (otmrm.SchemaName == "account_parent_account" && crmRecord.Id == "ea82f907-720f-e711-80e8-480fcff29761") {
                toBeWebAPIRecord.push({ "EntitySetName": "accounts", "EntityRecord": { "@odata.etag": "W/\"583331\"", "accountid": "e882f907-720f-e711-80e8-480fcff29761", "name": "港クラウドソリューション株式会社" } }, { "EntitySetName": "accounts", "EntityRecord": { "@odata.etag": "W/\"583316\"", "accountid": "ec82f907-720f-e711-80e8-480fcff29761", "name": "港ストレージソリューション株式会社" } });
            }
            else if (otmrm.SchemaName == "contact_customer_accounts" && crmRecord.Id == "ea82f907-720f-e711-80e8-480fcff29761") {
                toBeWebAPIRecord.push({ "EntitySetName": "contacts", "EntityRecord": { "@odata.etag": "W/\"1044777\"", "contactid": "fa82f907-720f-e711-80e8-480fcff29761", "fullname": "赤城 紀子", "entityimage": "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" } }, { "EntitySetName": "contacts", "EntityRecord": { "@odata.etag": "W/\"583154\"", "contactid": "0683f907-720f-e711-80e8-480fcff29761", "fullname": "森山 三郎" } });
            }
            else if (otmrm.SchemaName == "account_parent_account" && crmRecord.Id == "f082f907-720f-e711-80e8-480fcff29761") {
                toBeWebAPIRecord.push({ "EntitySetName": "accounts", "EntityRecord": { "@odata.etag": "W/\"583338\"", "accountid": "ea82f907-720f-e711-80e8-480fcff29761", "name": "港コンピュータ株式会社", "entityimage": "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" } }, { "EntitySetName": "accounts", "EntityRecord": { "@odata.etag": "W/\"583318\"", "accountid": "ee82f907-720f-e711-80e8-480fcff29761", "name": "港ビジネスコンサルティング株式会社" } }, { "EntitySetName": "accounts", "EntityRecord": { "@odata.etag": "W/\"583334\"", "accountid": "f682f907-720f-e711-80e8-480fcff29761", "name": "調布システム開発株式会社" } });
            }
            for (var i in toBeWebAPIRecord) {
                result.push(new CV.WebAPIRecord(toBeWebAPIRecord[i].EntitySetName, toBeWebAPIRecord[i].EntityRecord));
            }
            return result;
        };
        Demo_Data.getManyToOneRelationshipCRMRecordsByEachRelationship = function (crmRecord, otmrm) {
            var result;
            var _recordOfMany;
            if (otmrm.SchemaName == "contact_customer_accounts" && crmRecord.Id == "0683f907-720f-e711-80e8-480fcff29761") {
                _recordOfMany = { "EntitySetName": "contacts", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#contacts(parentcustomerid_account,parentcustomerid_account(accountid,name))/$entity", "@odata.etag": "W/\"583154\"", "contactid": "0683f907-720f-e711-80e8-480fcff29761", "parentcustomerid_account": { "@odata.etag": "W/\"583338\"", "accountid": "ea82f907-720f-e711-80e8-480fcff29761", "name": "港コンピュータ株式会社", "entityimage": "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" } } };
            }
            else if (otmrm.SchemaName == "contact_customer_accounts" && crmRecord.Id == "0083f907-720f-e711-80e8-480fcff29761") {
                _recordOfMany = { "EntitySetName": "contacts", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#contacts(parentcustomerid_account,parentcustomerid_account(accountid,name))/$entity", "@odata.etag": "W/\"583147\"", "contactid": "0083f907-720f-e711-80e8-480fcff29761", "parentcustomerid_account": { "@odata.etag": "W/\"583334\"", "accountid": "f682f907-720f-e711-80e8-480fcff29761", "name": "調布システム開発株式会社" } } };
            }
            else if (otmrm.SchemaName == "account_parent_account" && crmRecord.Id == "ea82f907-720f-e711-80e8-480fcff29761") {
                _recordOfMany = { "EntitySetName": "accounts", "EntityRecord": { "@odata.context": "https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#accounts(parentaccountid,parentaccountid(accountid,name))/$entity", "@odata.etag": "W/\"583338\"", "accountid": "ea82f907-720f-e711-80e8-480fcff29761", "parentaccountid": { "@odata.etag": "W/\"583339\"", "accountid": "f082f907-720f-e711-80e8-480fcff29761", "name": "港ホールディングス株式会社" } } };
            }
            if (_recordOfMany)
                result = new CV.WebAPIRecord(_recordOfMany.EntitySetName, _recordOfMany.EntityRecord);
            return result;
        };
        return Demo_Data;
    }());
    CV.Demo_Data = Demo_Data;
    var Demo_Const = (function () {
        function Demo_Const() {
        }
        return Demo_Const;
    }());
    Demo_Const.CRMSdkResponseTime = 200;
    CV.Demo_Const = Demo_Const;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var ForceGraph_RectangleUI = (function () {
        function ForceGraph_RectangleUI(elementId, connectionMaskToClickElementId) {
            this.currentFocusedCardID = null;
            this.currentEventD3obj = null;
            this.force = d3.layout.force();
            this.forceList = { nodes: this.force.nodes(), links: this.force.links() };
            this.divForCards = d3.select(elementId);
            this.connectionMaskToClickVis = d3.select(connectionMaskToClickElementId);
            this.svg = d3.select("svg")
                .attr("width", window.innerWidth).attr("height", window.innerHeight);
            d3.select("#MySVG").attr("pointer-events", "none");
        }
        ForceGraph_RectangleUI.prototype.addNode = function (nodeObj) {
            if (nodeObj.x && nodeObj.y) {
                this.forceList.nodes.push({
                    name: nodeObj.name,
                    id: CV.IDPrefix + nodeObj.id,
                    iconURL: nodeObj.iconURL,
                    x: nodeObj.x,
                    y: nodeObj.y,
                    fixed: nodeObj.fixed,
                    entityName: nodeObj.entityName
                });
            }
            else {
                this.forceList.nodes.push({
                    name: nodeObj.name,
                    id: CV.IDPrefix + nodeObj.id,
                    iconURL: nodeObj.iconURL,
                    entityName: nodeObj.entityName
                });
            }
            this.refresh(nodeObj);
        };
        ForceGraph_RectangleUI.prototype.addLink = function (linkObj) {
            var foundSource = this.findNode(CV.IDPrefix + linkObj.source);
            var foundTarget = this.findNode(CV.IDPrefix + linkObj.target);
            if (foundSource != null && foundTarget != null) {
                this.forceList.links.push({
                    source: foundSource,
                    target: foundTarget,
                    id: linkObj.linkId,
                    description: linkObj.description,
                    role1: linkObj.role1,
                    role2: linkObj.role2,
                    connector: linkObj.connector
                });
                this.refresh(null);
            }
        };
        ForceGraph_RectangleUI.prototype.setMultipleCRMConnetionFound = function (crmLink) {
            var found = false;
            for (var i in this.forceList.links) {
                var link = this.forceList.links[i];
                if (link["id"] == crmLink.LinkId) {
                    link["description"] = crmLink.Connector.Description;
                    link["role1"] = crmLink.Connector.Role1;
                    link["role2"] = crmLink.Connector.Role2;
                    link["connector"] = crmLink.Connector;
                    found = true;
                }
            }
            if (found) {
                this.updateForceConnectionDescription();
                this.updateForceConnectionMaskToClick();
                this.updateForceConnectionRole1();
                this.updateForceConnectionRole2();
            }
        };
        ForceGraph_RectangleUI.prototype.findNode = function (prefixedId) {
            for (var i in this.forceList.nodes) {
                if (this.forceList.nodes[i]["id"] == prefixedId)
                    return this.forceList.nodes[i];
            }
            return null;
        };
        ForceGraph_RectangleUI.prototype.setForceSizeAndStart = function () {
            d3.selectAll("#MySVG")
                .attr("width", window.innerWidth)
                .attr("height", window.innerHeight);
            $("#MyCanvasToDrag")
                .css("width", window.innerWidth + "px")
                .css("height", window.innerHeight + "px");
            this.force.size([window.innerWidth, window.innerHeight])
                .linkDistance(CV.ConnectionViewer.CARD_DISTANCE)
                .charge(-5000)
                .start();
        };
        ForceGraph_RectangleUI.prototype.setForceOnTick = function (forceConnectionLine, forceConnectionMask, forceConnectionMaskToClick, forceConnectionDescription, forceConnectionRole1, forceConnectionRole2, forceNodeCard) {
            this.force.on("tick", function () {
                forceConnectionLine
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });
                forceConnectionMask
                    .attr("x", function (d, i) { return (d.source.x + d.target.x) / 2 - forceConnectionDescription[0][i].getBBox().width / 2 - 4; })
                    .attr("y", function (d, i) { return (d.source.y + d.target.y) / 2 - forceConnectionDescription[0][i].getBBox().height; })
                    .attr("width", function (d, i) { return forceConnectionDescription[0][i].getBBox().width + 8; })
                    .attr("height", function (d, i) { return forceConnectionDescription[0][i].getBBox().height + 4; });
                forceConnectionMaskToClick
                    .style("left", function (d, i) {
                    var x = Math.floor(forceConnectionMask[0][i].x.baseVal.value) + 4;
                    return x + "px";
                })
                    .style("top", function (d, i) {
                    var y = Math.floor(forceConnectionMask[0][i].y.baseVal.value) + 4;
                    return y + "px";
                });
                forceConnectionDescription
                    .attr("x", function (d, i) { return (d.source.x + d.target.x) / 2 - forceConnectionDescription[0][i].getBBox().width / 2; })
                    .attr("y", function (d, i) { return (d.source.y + d.target.y) / 2; });
                forceConnectionRole1
                    .attr("x", function (d, i) {
                    return CV.ForceGraph_RectangleUI.UpdatePositionARole(forceConnectionRole1[0][i], forceConnectionLine[0][i].x1.baseVal.value, forceConnectionLine[0][i].y1.baseVal.value, forceConnectionLine[0][i].x2.baseVal.value, forceConnectionLine[0][i].y2.baseVal.value, false).x;
                })
                    .attr("y", function (d, i) {
                    return CV.ForceGraph_RectangleUI.UpdatePositionARole(forceConnectionRole1[0][i], forceConnectionLine[0][i].x1.baseVal.value, forceConnectionLine[0][i].y1.baseVal.value, forceConnectionLine[0][i].x2.baseVal.value, forceConnectionLine[0][i].y2.baseVal.value, false).y;
                });
                forceConnectionRole2
                    .attr("x", function (d, i) {
                    return CV.ForceGraph_RectangleUI.UpdatePositionARole(forceConnectionRole2[0][i], forceConnectionLine[0][i].x1.baseVal.value, forceConnectionLine[0][i].y1.baseVal.value, forceConnectionLine[0][i].x2.baseVal.value, forceConnectionLine[0][i].y2.baseVal.value, true).x;
                })
                    .attr("y", function (d, i) {
                    return CV.ForceGraph_RectangleUI.UpdatePositionARole(forceConnectionRole2[0][i], forceConnectionLine[0][i].x1.baseVal.value, forceConnectionLine[0][i].y1.baseVal.value, forceConnectionLine[0][i].x2.baseVal.value, forceConnectionLine[0][i].y2.baseVal.value, true).y;
                });
                forceNodeCard
                    .style("left", function (d) {
                    var x = d.x - CV.CardControl.CARD_WIDTH / 2;
                    return x + "px";
                })
                    .style("top", function (d) {
                    var y = d.y - CV.CardControl.CARD_HEIGHT / 2;
                    return y + "px";
                });
            });
        };
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionLine = function () {
            var forceConnectionLine = this.svg.selectAll("line.connectionLine")
                .data(this.forceList.links);
            forceConnectionLine.enter().append("line")
                .classed("connectionLine", true);
            forceConnectionLine.exit().remove();
            return forceConnectionLine;
        };
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionMask = function () {
            var forceConnectionMask = this.svg.selectAll("rect.connectionMask")
                .data(this.forceList.links);
            forceConnectionMask.enter().append("rect")
                .classed("connectionMask", true)
                .style("opacity", function (d, i) {
                return (d.connector.Description == null || d.connector.Description == "") ? 0.0 : 1.0;
            });
            forceConnectionMask.exit().remove();
            return forceConnectionMask;
        };
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionMaskToClick = function () {
            var forceConnectionDescription = this.svg.selectAll("text.connectionDescription")
                .data(this.forceList.links);
            var forceConnectionMaskToClick = this.connectionMaskToClickVis.selectAll("a.connectionMaskToClick")
                .data(this.forceList.links);
            forceConnectionMaskToClick.enter().append("a")
                .classed("connectionMaskToClick", true)
                .attr("href", "#MyMultipleCRMLinkPanel")
                .attr("data-role", "button")
                .attr("role", "button")
                .style("visibility", function (d, i) {
                return (d.connector.Description == null || d.connector.Description == "") ? "hidden" : "visible";
            })
                .html(function (d, i) {
                var w = Math.floor(forceConnectionDescription[0][i].getBBox().width);
                var h = Math.floor(forceConnectionDescription[0][i].getBBox().height);
                return '<div style="width: ' + w + 'px; height: ' + h + 'px; background-color: rgba(255,128,0,0.0);"></div>';
            })
                .on("touchstart", this.connectionMaskToClickTouchPointerMouseStart)
                .on("pointerdown", this.connectionMaskToClickTouchPointerMouseStart)
                .on("mousedown", this.connectionMaskToClickTouchPointerMouseStart);
            forceConnectionMaskToClick.exit().remove();
            return forceConnectionMaskToClick;
        };
        ForceGraph_RectangleUI.prototype.updateForceConnectionMaskToClick = function () {
            var forceConnectionDescription = this.svg.selectAll("text.connectionDescription")
                .data(this.forceList.links);
            var forceConnectionMaskToClick = this.connectionMaskToClickVis.selectAll("a.connectionMaskToClick")
                .data(this.forceList.links);
            forceConnectionMaskToClick
                .style("visibility", function (d, i) {
                return (d.connector.Description == null || d.connector.Description == "") ? "hidden" : "visible";
            })
                .html(function (d, i) {
                var w = Math.floor(forceConnectionDescription[0][i].getBBox().width);
                var h = Math.floor(forceConnectionDescription[0][i].getBBox().height);
                return '<div style="width: ' + w + 'px; height: ' + h + 'px; background-color: rgba(255,128,0,0.0);"></div>';
            });
            forceConnectionMaskToClick.exit().remove();
        };
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionDescription = function () {
            var forceConnectionDescription = this.svg.selectAll("text.connectionDescription")
                .data(this.forceList.links);
            forceConnectionDescription.enter().append("text")
                .classed("connectionDescription", true)
                .text(function (d) { return d.description; });
            forceConnectionDescription.exit().remove();
            return forceConnectionDescription;
        };
        ForceGraph_RectangleUI.prototype.updateForceConnectionDescription = function () {
            var forceConnectionDescription = this.svg.selectAll("text.connectionDescription")
                .data(this.forceList.links);
            forceConnectionDescription.text(function (d) { return d.description; });
            forceConnectionDescription.exit().remove();
        };
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionRole1 = function () {
            var forceConnectionRole1 = this.svg.selectAll("text.connectionRole1")
                .data(this.forceList.links);
            forceConnectionRole1.enter().append("text")
                .classed("connectionRole1", true)
                .text(function (d) { return d.role1; });
            forceConnectionRole1.exit().remove();
            return forceConnectionRole1;
        };
        ForceGraph_RectangleUI.prototype.updateForceConnectionRole1 = function () {
            var forceConnectionRole1 = this.svg.selectAll("text.connectionRole1")
                .data(this.forceList.links);
            forceConnectionRole1
                .text(function (d) { return d.role1; });
            forceConnectionRole1.exit().remove();
            return forceConnectionRole1;
        };
        ForceGraph_RectangleUI.prototype.appendAndGetForceConnectionRole2 = function () {
            var forceConnectionRole2 = this.svg.selectAll("text.connectionRole2")
                .data(this.forceList.links);
            forceConnectionRole2.enter().append("text")
                .classed("connectionRole2", true)
                .text(function (d) { return d.role2; });
            forceConnectionRole2.exit().remove();
            return forceConnectionRole2;
        };
        ForceGraph_RectangleUI.prototype.updateForceConnectionRole2 = function () {
            var forceConnectionRole2 = this.svg.selectAll("text.connectionRole2")
                .data(this.forceList.links);
            forceConnectionRole2
                .text(function (d) { return d.role2; });
            forceConnectionRole2.exit().remove();
            return forceConnectionRole2;
        };
        ForceGraph_RectangleUI.prototype.connectionMaskToClickTouchPointerMouseStart = function (d, i) {
            d3.event.preventDefault();
            $("#MyMultipleLlinksRecordDisplayNameLeft").html(d.connector.Card1.DisplayName);
            $("#MyMultipleLlinksRecordDisplayNameRightt").html(d.connector.Card2.DisplayName);
            $("#MyMultipleLlinksEntityDisplayNameLeft").html(CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[d.connector.Card1.EntityLogicalName].DisplayName.UserLocalizedLabel.Label);
            $("#MyMultipleLlinksEntityDisplayNameRight").html(CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[d.connector.Card2.EntityLogicalName].DisplayName.UserLocalizedLabel.Label);
            var html = '';
            for (var l in d.connector.CrmLinkArray) {
                var crmLink = d.connector.CrmLinkArray[l];
                var r1 = (crmLink.Record1DisplayRoleName) ? crmLink.Record1DisplayRoleName : "・";
                var r2 = (crmLink.Record2DisplayRoleName) ? crmLink.Record2DisplayRoleName : "・";
                var desc = (crmLink.ConnectionType == CV.CRMLinkTypeEnum.ManyToMany) ? "(N:N関係)" : crmLink.Description;
                if (desc) {
                    html += '<table class="multipleLlinksOneLink" style="width: 100%;">';
                    html += '    <tr>';
                    html += '        <td class="multipleLlinksTD" style="text-align: left; width: auto;">' + r1 + '</td>';
                    html += '        <td class="multipleLlinksTD" style="width: 50%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '        <td class="multipleLlinksTD" style="text-align: center;"><p class="multipleLlinksDescription">' + desc + '</p></td>';
                    html += '        <td class="multipleLlinksTD" style="width: 50%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '        <td class="multipleLlinksTD" style="text-align: right;">' + r2 + '</td>';
                    html += '    </tr>';
                    html += '</table>';
                }
                else {
                    html += '                    <table class="multipleLlinksOneLink" style="width: 100%;">';
                    html += '                        <tr>';
                    html += '                            <td class="multipleLlinksTD" style="text-align: left; width: auto;">' + r1 + '</td>';
                    html += '                            <td class="multipleLlinksTD" style="width: 100%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '                            <td class="multipleLlinksTD" style="text-align: right;">' + r2 + '</td>';
                    html += '                        </tr>';
                    html += '                    </table>';
                }
            }
            $("#MyMyMultipleCRMLinkPanelAllLinks").html(html);
            $("#MyShowMultipleCRMLinkPanel").click();
        };
        ForceGraph_RectangleUI.prototype.touchPointerMouseStart = function (d) {
            if (!CV.forceGraph.currentEventD3obj) {
                CV.forceGraph.currentEventD3obj = d;
                CV.forceGraph.dragStartedPoint = new CV.Helper.Point(d.x, d.y);
                CV.forceGraph.focusACardControl(d);
            }
        };
        ForceGraph_RectangleUI.prototype.touchPointerMouseEnd = function (d) {
            CV.forceGraph.currentEventD3obj = null;
        };
        ForceGraph_RectangleUI.prototype.taphold = function (event) {
            var cardEl;
            if (event.target.className == "card") {
                cardEl = event.target;
            }
            else {
                cardEl = $(event.target).parents(".card")[0];
            }
            var id = cardEl.id;
            var d3obj = this.findNode(id);
            var currentPoint = new CV.Helper.Point(d3obj.x, d3obj.y);
            var dx = currentPoint.x - CV.forceGraph.dragStartedPoint.x;
            var dy = currentPoint.y - CV.forceGraph.dragStartedPoint.y;
            if (dx * dx + dy * dy < 100) {
                CV.forceGraph.cardToggleFixed(d3obj);
            }
            else {
                CV.forceGraph.cardFixed(d3obj);
            }
        };
        ForceGraph_RectangleUI.prototype.cardToggleFixed = function (d3obj) {
            var cardDiv = $("#" + d3obj.id);
            if (!(d3obj.fixed & 1)) {
                cardDiv.css("box-shadow", "4px 4px 6px 2px rgba(0,0,0,0.5)");
                d3obj.fixed |= 1;
            }
            else {
                cardDiv.css("box-shadow", "none");
                d3obj.fixed &= ~1;
            }
        };
        ForceGraph_RectangleUI.prototype.cardFixed = function (d3obj) {
            var cardDiv = $("#" + d3obj.id);
            cardDiv.css("box-shadow", "4px 4px 6px 2px rgba(0,0,0,0.5)");
            d3obj.fixed |= 1;
        };
        ForceGraph_RectangleUI.prototype.refresh = function (nodeObj) {
            var forceConnectionLine = this.appendAndGetForceConnectionLine();
            var forceConnectionMask = this.appendAndGetForceConnectionMask();
            var forceConnectionDescription = this.appendAndGetForceConnectionDescription();
            var forceConnectionMaskToClick = this.appendAndGetForceConnectionMaskToClick();
            var forceConnectionRole1 = this.appendAndGetForceConnectionRole1();
            var forceConnectionRole2 = this.appendAndGetForceConnectionRole2();
            var forceNodeCard = this.divForCards.selectAll("div.card")
                .data(this.forceList.nodes);
            var nodeEnter = forceNodeCard.enter()
                .append("div")
                .attr("id", function (d) { return d.id; })
                .classed("card", true)
                .style("outline-color", function (d) { return CV.CardControl.getEntityColor(d.entityName); })
                .style("position", "absolute")
                .style("box-shadow", function (d) { return (d.fixed) ? "4px 4px 6px 2px rgba(0,0,0,0.5)" : "none"; })
                .style("cursor", "move")
                .on("touchstart", this.touchPointerMouseStart)
                .on("touchend", this.touchPointerMouseEnd)
                .on("pointerdown", this.touchPointerMouseStart)
                .on("pointerup", this.touchPointerMouseEnd)
                .on("mousedown", this.touchPointerMouseStart)
                .on("mouseup", this.touchPointerMouseEnd);
            if (nodeObj) {
                $("#" + CV.IDPrefix + nodeObj.id).bind("taphold", function (event) { CV.forceGraph.taphold(event); });
            }
            nodeEnter = nodeEnter
                .call(this.force.drag);
            nodeEnter
                .append("span")
                .classed("cardImageWrapper", true)
                .style("background-color", function (d) { return CV.CardControl.getEntityColor(d.entityName); })
                .style("cursor", "move")
                .append("img")
                .classed("cardImage", true)
                .attr("src", function (d) { return d.iconURL; });
            nodeEnter
                .append("span")
                .classed("cardTitle", true)
                .attr("title", function (d) { return d.name; })
                .attr("onclick", "CV.CardControl.OpenNewCRMFormWindow(this)")
                .text(function (d) { return d.name; });
            nodeEnter
                .append("span")
                .classed("cardToBeRetrieved", true)
                .style("cursor", "move")
                .text("…");
            forceNodeCard.exit().remove();
            this.setForceOnTick(forceConnectionLine, forceConnectionMask, forceConnectionMaskToClick, forceConnectionDescription, forceConnectionRole1, forceConnectionRole2, forceNodeCard);
            this.setForceSizeAndStart();
        };
        ForceGraph_RectangleUI.focusACardControlByCRMRecordId = function (id) {
            if (CV.forceGraph.currentFocusedCardID != id) {
                if (CV.forceGraph.currentFocusedCardID != null) {
                    for (var i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                        if (CV.connectionViewer.CRMRecordArray[i].Id == CV.forceGraph.currentFocusedCardID) {
                            CV.connectionViewer.CRMRecordArray[i].Card.Unfocus();
                            break;
                        }
                    }
                }
                CV.forceGraph.currentFocusedCardID = id;
                if (d3.select("div.card#" + CV.IDPrefix + id) != null) {
                    d3.select("div.card#" + CV.IDPrefix + id).style("outline-width", "3px");
                }
            }
        };
        ForceGraph_RectangleUI.unfocusACardControlByCRMRecordId = function (id) {
            if (d3.select("div.card#" + CV.IDPrefix + id) != null) {
                d3.select("div.card#" + CV.IDPrefix + id).style("outline-width", "1px");
            }
        };
        ForceGraph_RectangleUI.prototype.focusACardControl = function (d) {
            if (d.id.indexOf(CV.IDPrefix) == 0) {
                var id = d.id.substr(CV.IDPrefix.length);
                if (CV.forceGraph.currentFocusedCardID == id)
                    return;
                for (var i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                    var crmRecord = CV.connectionViewer.CRMRecordArray[i];
                    if (crmRecord.Id == id) {
                        crmRecord.Card.Focus();
                        break;
                    }
                }
            }
        };
        ForceGraph_RectangleUI.prototype.connectionRetrieved = function (id, retrieved) {
            if (d3.select("div.card#" + CV.IDPrefix + id) != null) {
                if (retrieved) {
                    d3.select("div.card#" + CV.IDPrefix + id).select("span.cardToBeRetrieved").style("opacity", "0.0");
                }
                else {
                    d3.select("div.card#" + CV.IDPrefix + id).select("span.cardToBeRetrieved").style("opacity", "1.0");
                }
            }
        };
        ForceGraph_RectangleUI.UpdatePositionARole = function (connectionRole, X1, Y1, X2, Y2, reverse) {
            var returnPoint = new CV.Helper.Point(0, 0);
            var dx = (!reverse) ? X2 - X1 : X1 - X2;
            var dy = (!reverse) ? Y2 - Y1 : Y1 - Y2;
            var a;
            if (dx != 0)
                a = dy / dx;
            else
                a = null;
            var angle = Math.atan2(dy, dx);
            var contactPoint = new CV.Helper.Point(0, 0);
            ForceGraph_RectangleUI.GetCardContactXAndY(a, angle, contactPoint);
            if (0.0 < angle && angle <= Math.PI / 2.0) {
                returnPoint.x = contactPoint.x + 8.0;
                if (contactPoint.x == CV.CardControl.CARD_WIDTH / 2.0)
                    returnPoint.y = contactPoint.y - connectionRole.getBBox().height - 6.0;
                else
                    returnPoint.y = contactPoint.y + 8.0;
            }
            else if (Math.PI / 2.0 < angle && angle <= Math.PI) {
                returnPoint.x = contactPoint.x - connectionRole.getBBox().width - 8.0;
                returnPoint.y = contactPoint.y + 8.0;
            }
            else if (-Math.PI < angle && angle <= -Math.PI / 2.0) {
                returnPoint.x = contactPoint.x - connectionRole.getBBox().width - 8.0;
                if (contactPoint.y == -CV.CardControl.CARD_HEIGHT / 2.0)
                    returnPoint.y = contactPoint.y - 8.0;
                else
                    returnPoint.y = contactPoint.y - connectionRole.getBBox().height + 6.0;
            }
            else {
                returnPoint.x = contactPoint.x + 8.0;
                if (contactPoint.y == -CV.CardControl.CARD_HEIGHT / 2.0)
                    returnPoint.y = contactPoint.y - 8.0;
                else if (contactPoint.x == CV.CardControl.CARD_WIDTH / 2.0)
                    returnPoint.y = contactPoint.y - 8.0;
                else
                    returnPoint.y = contactPoint.y - connectionRole.getBBox().height + 6.0;
            }
            returnPoint.x += (!reverse) ? X1 : X2;
            returnPoint.y += (!reverse) ? Y1 : Y2;
            return returnPoint;
        };
        ForceGraph_RectangleUI.GetCardContactXAndY = function (a, angle, contactPoint) {
            var tryContactX, tryContactY;
            if (0.0 < angle && angle <= Math.PI / 2.0) {
                tryContactY = (a != null) ? a * CV.CardControl.CARD_WIDTH / 2.0 : null;
                tryContactX = (a != null) ? ((a == 0.0) ? null : CV.CardControl.CARD_HEIGHT / 2.0 / a) : 0.0;
                if (tryContactY != null && tryContactY <= CV.CardControl.CARD_HEIGHT / 2.0) {
                    contactPoint.y = tryContactY;
                    contactPoint.x = CV.CardControl.CARD_WIDTH / 2.0;
                }
                else {
                    contactPoint.y = CV.CardControl.CARD_HEIGHT / 2.0;
                    contactPoint.x = tryContactX;
                }
            }
            else if (Math.PI / 2.0 < angle && angle <= Math.PI) {
                tryContactY = (a != null) ? a * -CV.CardControl.CARD_WIDTH / 2.0 : null;
                tryContactX = (a != null) ? ((a == 0.0) ? null : CV.CardControl.CARD_HEIGHT / 2.0 / a) : 0.0;
                if (tryContactY != null && tryContactY <= CV.CardControl.CARD_HEIGHT / 2.0) {
                    contactPoint.y = tryContactY;
                    contactPoint.x = -CV.CardControl.CARD_WIDTH / 2.0;
                }
                else {
                    contactPoint.y = CV.CardControl.CARD_HEIGHT / 2.0;
                    contactPoint.x = tryContactX;
                }
            }
            else if (-Math.PI < angle && angle <= -Math.PI / 2.0) {
                tryContactY = (a != null) ? a * -CV.CardControl.CARD_WIDTH / 2.0 : null;
                tryContactX = (a != null) ? ((a == 0.0) ? null : -CV.CardControl.CARD_HEIGHT / 2.0 / a) : 0.0;
                if (tryContactY != null && -CV.CardControl.CARD_HEIGHT / 2.0 <= tryContactY) {
                    contactPoint.y = tryContactY;
                    contactPoint.x = -CV.CardControl.CARD_WIDTH / 2.0;
                }
                else {
                    contactPoint.y = -CV.CardControl.CARD_HEIGHT / 2.0;
                    contactPoint.x = tryContactX;
                }
            }
            else {
                tryContactY = (a != null) ? a * CV.CardControl.CARD_WIDTH / 2.0 : null;
                tryContactX = (a != null) ? ((a == 0.0) ? null : -CV.CardControl.CARD_HEIGHT / 2.0 / a) : 0.0;
                if (tryContactY != null && -CV.CardControl.CARD_HEIGHT / 2.0 <= tryContactY) {
                    contactPoint.y = tryContactY;
                    contactPoint.x = CV.CardControl.CARD_WIDTH / 2.0;
                }
                else {
                    contactPoint.y = -CV.CardControl.CARD_HEIGHT / 2.0;
                    contactPoint.x = tryContactX;
                }
            }
        };
        ForceGraph_RectangleUI.prototype.initCanvasToDrag = function () {
            if (!CV.forceGraph.currentEventD3obj) {
                var drag = d3.behavior.drag()
                    .on("dragstart", function (d) {
                    this.isNowDragging = true;
                }).on("drag", function (d) {
                    if (this.isNowDragging) {
                        d3.event.sourceEvent.stopPropagation();
                        CV.forceGraph.moveCanvasPosition(d3.event.dx, d3.event.dy);
                    }
                }).on("dragend", function (d) {
                    this.isNowDragging = false;
                    d3.event.sourceEvent.stopPropagation();
                });
                CV.forceGraph.setCanvasPosition(0, 0);
                d3.select("#MyCanvasToDrag").call(drag);
            }
        };
        ForceGraph_RectangleUI.prototype.setCanvasPosition = function (x, y) {
            d3.select("#MyCanvasToDrag")
                .attr("data-dragx", x)
                .attr("data-dragy", y);
            d3.select("#MyCardConnectionDiv")
                .style("left", x + "px")
                .style("top", y + "px");
        };
        ForceGraph_RectangleUI.prototype.getCanvasPosition = function () {
            var x = parseInt(d3.select("#MyCanvasToDrag").attr("data-dragx"));
            var y = parseInt(d3.select("#MyCanvasToDrag").attr("data-dragy"));
            return new CV.Helper.Point(x, y);
        };
        ForceGraph_RectangleUI.prototype.moveCanvasPosition = function (dx, dy) {
            d3.select("#MyCardConnectionDiv")
                .style("left", function () {
                var x = parseInt($("#MyCanvasToDrag").attr("data-dragx")) + dx;
                $("#MyCanvasToDrag").attr("data-dragx", x);
                return x + "px";
            })
                .style("top", function () {
                var y = parseInt($("#MyCanvasToDrag").attr("data-dragy")) + dy;
                $("#MyCanvasToDrag").attr("data-dragy", y);
                return y + "px";
            });
        };
        ForceGraph_RectangleUI.prototype.getIdFromTitle = function (elm) {
            return $(elm).closest("div")[0].id;
        };
        ForceGraph_RectangleUI.prototype.changeUISizeForFarCards = function () {
        };
        return ForceGraph_RectangleUI;
    }());
    CV.ForceGraph_RectangleUI = ForceGraph_RectangleUI;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var CardsLayout = (function () {
        function CardsLayout() {
            this.FocusedIdList = [];
            this.CardList = [];
            this.CanvasTranslated = { x: 0, y: 0 };
        }
        CardsLayout.getCardsLayoutFromObject = function (obj) {
            var focusedIdList = obj["FocusedIdList"];
            var lastFocusedId = obj["LastFocusedId"];
            var cardList = obj["CardList"];
            var canvasTranslated = obj["CanvasTranslated"];
            if (focusedIdList && cardList) {
                var cardsLayout = new CardsLayout();
                cardsLayout.FocusedIdList = focusedIdList;
                cardsLayout.LastFocusedId = lastFocusedId;
                cardsLayout.CardList = cardList;
                if (canvasTranslated.x && canvasTranslated.y)
                    cardsLayout.CanvasTranslated = canvasTranslated;
                else
                    cardsLayout.CanvasTranslated = { x: 0, y: 0 };
                return cardsLayout;
            }
            return null;
        };
        CardsLayout.prototype.getCardByRecordId = function (id) {
            for (var i = 0; i < this.CardList.length; i++) {
                if (id == this.CardList[i].CRMRecordId)
                    return this.CardList[i];
            }
            return null;
        };
        return CardsLayout;
    }());
    CV.CardsLayout = CardsLayout;
    var SingleCardLayout = (function () {
        function SingleCardLayout(cRMRecordId, x, y, fixed) {
            if (!(cRMRecordId && x && y))
                throw new Error("SingleCardLayout のコンストラクタに渡された引数に値を含まないものがあります。");
            this.CRMRecordId = cRMRecordId;
            this.X = x;
            this.Y = y;
            this.Fixed = fixed ? true : false;
        }
        return SingleCardLayout;
    }());
    CV.SingleCardLayout = SingleCardLayout;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var CardsLayoutManager = (function () {
        function CardsLayoutManager() {
            this.replayingFocusedIdIndex = 0;
            this.CurrentCardsLayout = new CV.CardsLayout();
        }
        CardsLayoutManager.prototype.AddFocusedId = function (id) {
            this.CurrentCardsLayout.FocusedIdList.push(id);
        };
        CardsLayoutManager.prototype.GetAllCardList = function () {
            var sclList = [];
            for (var i in CV.forceGraph.forceList.nodes) {
                var node = CV.forceGraph.forceList.nodes[i];
                var id = node.id.substr(CV.IDPrefix.length);
                sclList.push(new CV.SingleCardLayout(id, node.x, node.y, node.fixed));
            }
            return sclList;
        };
        CardsLayoutManager.prototype.SetAllCardList = function () {
            this.CurrentCardsLayout.CardList = this.GetAllCardList();
        };
        CardsLayoutManager.prototype.SetLastFocusedId = function (id) {
            this.CurrentCardsLayout.LastFocusedId = id;
        };
        CardsLayoutManager.prototype.SetCanvasTranslated = function (_x, _y) {
            this.CurrentCardsLayout.CanvasTranslated = { x: _x, y: _y };
        };
        CardsLayoutManager.prototype.SaveCurrentCardsLayoutDeferredized = function (notetext) {
            var deferred = $.Deferred();
            this.SetAllCardList();
            var translatedPosition = CV.forceGraph.getCanvasPosition();
            this.SetCanvasTranslated(translatedPosition.x, translatedPosition.y);
            CV.CRMAccessWebAPI.createAnnotationRecordForCardsLayoutDeferredized(this.CurrentCardsLayout, notetext)
                .then(function () {
                deferred.resolve();
            }).fail(function (e) {
                deferred.reject(e.toString());
            });
            return deferred.promise();
        };
        CardsLayoutManager.prototype.LoadCardsLayoutListDeferredized = function () {
            var deferred = $.Deferred();
            CV.CRMAccessWebAPI.retrieveAnnotationRecordForCardsLayoutDeferredized(null)
                .then(function (records) {
                var annotationRecords = [];
                for (var i = 0; i < records.length; i++) {
                    var record = records[i];
                    var annotation = new CV.CRMAnnocationRecord(record.EntityRecord["annotationid"], "annotation", "Annotation", "つながりビューワーのカードレイアウト", "メモ", 5, record.EntityRecord, "つながりビューワーのカードレイアウト", record.EntityRecord["documentbody"], record.EntityRecord["notetext"], record.EntityRecord["_createdby_value"], record.EntityRecord["_createdby_value@OData.Community.Display.V1.FormattedValue"], record.EntityRecord["createdon"], record.EntityRecord["createdon@OData.Community.Display.V1.FormattedValue"], record.EntityRecord["_modifiedby_value"], record.EntityRecord["_modifiedby_value@OData.Community.Display.V1.FormattedValue"], record.EntityRecord["modifiedon"], record.EntityRecord["modifiedon@OData.Community.Display.V1.FormattedValue"]);
                    annotationRecords.push(annotation);
                }
                deferred.resolve(annotationRecords);
            }).fail(function (e) {
                deferred.reject(e.toString());
            });
            return deferred.promise();
        };
        CardsLayoutManager.prototype.initCardsLayoutReplayDeferredized = function (_record) {
            var deferred = $.Deferred();
            var annotationId = CV.connectionViewer.getAnnotationIdFromParams();
            if (annotationId) {
                CV.CRMAccessWebAPI.retrieveAnnotationRecordForCardsLayoutDeferredized(annotationId)
                    .then(function (annotationWebAPIRecords) {
                    var annotationWebAPIRecord = annotationWebAPIRecords[0];
                    var obj = JSON.parse(decodeURI(atob(annotationWebAPIRecord.EntityRecord["documentbody"])));
                    var cardsLayout = CV.CardsLayout.getCardsLayoutFromObject(obj);
                    CV.connectionViewer.clm.replayingCardsLayout = cardsLayout;
                    CV.connectionViewer.clm.replayingFocusedIdIndex = 0;
                    CV.connectionViewer.translateCanvas(cardsLayout.CanvasTranslated.x, cardsLayout.CanvasTranslated.y);
                    CV.ConnectionViewer.showCurrentlyRetrievingStoryboard(true);
                    deferred.resolve({ record: _record, existCardLayout: true });
                })
                    .fail(function (e) {
                    CV.ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
                    deferred.reject(e.message);
                });
            }
            else {
                deferred.resolve({ record: _record, existCardLayout: false });
            }
            return deferred.promise();
        };
        CardsLayoutManager.prototype.nextCardsLayoutReplay = function () {
            if (CV.connectionViewer.clm.replayingFocusedIdIndex < CV.connectionViewer.clm.replayingCardsLayout.FocusedIdList.length - 1) {
                CV.connectionViewer.clm.replayingFocusedIdIndex++;
                var id = CV.connectionViewer.clm.replayingCardsLayout.FocusedIdList[CV.connectionViewer.clm.replayingFocusedIdIndex];
                var crmRecord = CV.connectionViewer.findCRMRecordById(id);
                if (crmRecord) {
                    var cardControl = crmRecord.Card;
                    cardControl.Focus();
                }
                else {
                    setTimeout(CV.connectionViewer.clm.nextCardsLayoutReplay, 100);
                }
            }
            else {
                var id = CV.connectionViewer.clm.replayingCardsLayout.LastFocusedId;
                var crmRecord = CV.connectionViewer.findCRMRecordById(id);
                if (crmRecord) {
                    var cardControl = crmRecord.Card;
                    cardControl.Focus();
                }
                CV.connectionViewer.IS_CardsLaout_Replaying = false;
                CV.ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
            }
        };
        CardsLayoutManager.prototype.findCardInReplaying = function (id) {
            if (this.replayingCardsLayout) {
                for (var i = 0; i < this.replayingCardsLayout.CardList.length; i++) {
                    var cardLayout = this.replayingCardsLayout.CardList[i];
                    if (id == cardLayout.CRMRecordId) {
                        return cardLayout;
                    }
                }
            }
            return null;
        };
        return CardsLayoutManager;
    }());
    CV.CardsLayoutManager = CardsLayoutManager;
})(CV || (CV = {}));
var MyGeneralLibrary;
(function (MyGeneralLibrary) {
    function getNewGuid() {
        function fourD() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return fourD() + fourD() + '-' + fourD() + '-' + fourD() + '-' + fourD() + '-' + fourD() + fourD() + fourD();
    }
    MyGeneralLibrary.getNewGuid = getNewGuid;
    function getParams() {
        var params = new Array();
        var obj = {};
        if (location.search != "") {
            params = location.search.substr(1).split("&");
            for (var i in params) {
                try {
                    params[i] = params[i].replace(/\+/g, " ").split("=");
                    obj[params[i][0]] = params[i][1];
                }
                catch (e) {
                    return null;
                }
            }
        }
        return obj;
    }
    MyGeneralLibrary.getParams = getParams;
    function getCRMDataParams() {
        var params = new Array();
        var obj = {};
        if (location.search != "") {
            params = location.search.substr(1).split("&");
            for (var i in params) {
                try {
                    params[i] = params[i].replace(/\+/g, " ").split("=");
                    if (params[i][0].toLowerCase() == "data") {
                        var dataParams = new Array();
                        dataParams = decodeURIComponent(params[i][1]).split("&");
                        for (var i in dataParams) {
                            dataParams[i] = dataParams[i].replace(/\+/g, " ").split("=");
                            obj[dataParams[i][0]] = dataParams[i][1];
                        }
                    }
                }
                catch (e) {
                    return null;
                }
            }
        }
        return obj;
    }
    MyGeneralLibrary.getCRMDataParams = getCRMDataParams;
    function getParamsString(obj) {
        var paramsString = "";
        for (var key in obj) {
            var value = obj[key];
            if (paramsString != "")
                paramsString += "&";
            paramsString += key + "=" + value;
        }
        return paramsString;
    }
    MyGeneralLibrary.getParamsString = getParamsString;
})(MyGeneralLibrary || (MyGeneralLibrary = {}));
var CV;
(function (CV) {
    CV.IDPrefix = "id";
    var ConnectionViewer = (function () {
        function ConnectionViewer() {
            CV.connectionViewer = this;
            this.CRMRecordArray = [];
            this.CRMLinkArray = [];
            this.crmAccess = new CV.CRMAccessWebAPI(this);
            this.clm = new CV.CardsLayoutManager();
            this.init();
        }
        ConnectionViewer.bodyResized = function () {
            $("#MySpinnerDiv")
                .css("width", window.innerWidth + "px")
                .css("height", window.innerHeight + "px")
                .css("left", (window.innerWidth - 77) + "px")
                .css("top", (window.innerHeight - 77) + "px");
            if (CV.connectionViewer != null && CV.forceGraph != null) {
                CV.forceGraph.setForceSizeAndStart();
            }
        };
        ConnectionViewer.prototype.init = function () {
            var _this = this;
            try {
                this.IS_DEMO_MODE = this.getIsDemoMode();
                this.IS_IN_CRM_FORM = (MyGeneralLibrary.getParams()["id"]) ? true : false;
                this.IS_CardsLaout_Replaying = (this.getAnnotationIdFromParams()) ? true : false;
                this.initOpenNewWindowButton();
                var entityLogicalNameAndGuidFromParameter = this.getEntityLogicalNameAndGuidFromParameter();
                if (entityLogicalNameAndGuidFromParameter) {
                    this.paramEntityLogicalName = entityLogicalNameAndGuidFromParameter.entityLogicalName.toLowerCase();
                    this.paramGuid = entityLogicalNameAndGuidFromParameter.guid.toLowerCase();
                    this.crmAccess.retrieveConfigSetXmlTextDeferredized()
                        .then(function (text) {
                        try {
                            CV.connectionViewer.configSet = CV.ConfigSet.parseConfigSetXmlText(text);
                        }
                        catch (e) {
                            CV.Helper.addErrorMessageln("CV.ConfigSet.parseConfigSetXml()でエラーが発生しました。" + e.message + "プログラム内で用意された既定のConfigSetを利用します。 in init()");
                            CV.connectionViewer.configSet = CV.ConfigSet.getDefaultConfigSet();
                        }
                        CV.connectionViewer.config = CV.Config.initConfigWithOptions(CV.connectionViewer.configSet);
                        if (CV.connectionViewer.config.CardStyle.toString() == CV.CardStyleEnum[CV.CardStyleEnum.Circle]
                            || CV.connectionViewer.config.CardStyle == CV.CardStyleEnum.Circle)
                            CV.forceGraph = new CV.ForceGraph_CircleUI("#MySVGCards", "#MySVGLines", "#MySVGConnectionDescriptions", "#MySVGConnectionRoles");
                        else if (CV.connectionViewer.config.CardStyle.toString() == CV.CardStyleEnum[CV.CardStyleEnum.Rectangle]
                            || CV.connectionViewer.config.CardStyle == CV.CardStyleEnum.Rectangle)
                            CV.forceGraph = new CV.ForceGraph_RectangleUI("#MyCardDiv", "#MyConnectionMaskToClickDiv");
                        else {
                            CV.Helper.addErrorMessageln("CV.connectionViewer.config.CardStyle が不正な値です。既定のカードスタイル 'Circle' を採用します。 in init()");
                            CV.forceGraph = new CV.ForceGraph_CircleUI("#MySVGCards", "#MySVGLines", "#MySVGConnectionDescriptions", "#MySVGConnectionRoles");
                        }
                        CV.forceGraph.initCanvasToDrag();
                        if (_this.IS_DEMO_MODE) {
                            CV.connectionViewer.config.CardsLayoutEnabled = false;
                        }
                        if (CV.connectionViewer.config == null)
                            throw "CV.Config.initConfigAndOptions()でエラーが発生しました。オプションで ConfigSet を再度選択頂くことで問題が解決する可能性があります。";
                        CV.connectionViewer.initOptionsPanel();
                    })
                        .then(this.crmAccess.initCRMAccessDeferredized)
                        .then(function (record) {
                        if (CV.connectionViewer.config.CardsLayoutEnabled) {
                            $("#MyCardsLayoutDiv").css("visibility", "visible");
                            if (CV.connectionViewer.AnnotationRelationshipMetadataCache) {
                                $("#MyCardLayoutAvailableDiv").css("visibility", "visible");
                                $("#MyCardLayoutUnavailableDiv").css("visibility", "collapse");
                            }
                            else {
                                $("#MyCardLayoutAvailableDiv").css("visibility", "collapse");
                                $("#MyCardLayoutAvailableDiv").css("height", "0px");
                                $("#MyCardLayoutUnavailableDiv").css("visibility", "visible");
                            }
                        }
                        return CV.connectionViewer.clm.initCardsLayoutReplayDeferredized(record);
                    })
                        .done(function (recordAndExistCardLayout) {
                        if (recordAndExistCardLayout.existCardLayout) {
                            var params = MyGeneralLibrary.getParams();
                            var toBeReloadedSearch_1;
                            if (!params["data"]) {
                                toBeReloadedSearch_1 = location.search;
                            }
                            else {
                                var dataParams = MyGeneralLibrary.getCRMDataParams();
                                delete dataParams["annotationId"];
                                var dataParamsString = MyGeneralLibrary.getParamsString(dataParams);
                                params["data"] = encodeURIComponent(dataParamsString);
                                var paramsString = MyGeneralLibrary.getParamsString(params);
                                toBeReloadedSearch_1 = "?" + paramsString;
                            }
                            $("#MyCardsLayoutRefreshLink").click(function () {
                                location.href = "main.html" + toBeReloadedSearch_1;
                            });
                            $("#MyCardsLayoutRefreshLink").css("visibility", "visible");
                        }
                        CV.connectionViewer.initialCRMRecordRetrieved(recordAndExistCardLayout.record);
                    }).fail(function (e) {
                        CV.Helper.addErrorMessageln(e.toString() + " in init()");
                        ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
                    });
                }
                else {
                    var formType = void 0;
                    if (Xrm.Page.ui != null) {
                        formType = Xrm.Page.ui.getFormType();
                    }
                    else {
                        formType = parent.Xrm.Page.ui.getFormType();
                    }
                    if (formType == 2
                        || formType == 3
                        || formType == 4) {
                        throw new Error("initEntityLogicalNameAndGuidFromParameter()の戻り値が不正です。");
                    }
                    else if (formType == 1) {
                        CV.Helper.addInfoMessageln("新規レコード作成時には利用できません。");
                        ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
                    }
                    else {
                        throw new Error("このFormTypeでは利用できません。FormType = " + formType);
                    }
                }
            }
            catch (e) {
                CV.Helper.addErrorMessageln(e.message + " in init()");
                ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
            }
        };
        ConnectionViewer.prototype.initOpenNewWindowButton = function () {
            if (this.IS_IN_CRM_FORM)
                $("#MyOpenNewWindow").css("visibility", "visible");
        };
        ConnectionViewer.prototype.getIsDemoMode = function () {
            return (typeof (Xrm) === "undefined") ? true : false;
        };
        ConnectionViewer.prototype.initialCRMRecordRetrieved = function (_record) {
            var primaryNameAttributeName = this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].PrimaryNameAttribute;
            var primaryImageAttributeName = this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].PrimaryImageAttribute;
            var record = new CV.CRMRecord(this.paramGuid, this.paramEntityLogicalName, this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].SchemaName, _record.EntityRecord[primaryNameAttributeName], _record.EntityRecord[primaryImageAttributeName], this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].DisplayName.UserLocalizedLabel.Label, this.EntityMetadataCacheKeyIsEntityLogicalName[this.paramEntityLogicalName].ObjectTypeCode, _record.EntityRecord);
            this.CRMRecordArray.push(record);
            this.showInitialCRMRecord(record);
            this.initTitle(_record.EntityRecord[primaryNameAttributeName]);
        };
        ConnectionViewer.prototype.getAnnotationIdFromParams = function () {
            var dataParams = MyGeneralLibrary.getCRMDataParams();
            var annotationId = (dataParams) ? dataParams["annotationId"] : null;
            return annotationId;
        };
        ConnectionViewer.prototype.findCRMRecordById = function (id) {
            for (var i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                var record = CV.connectionViewer.CRMRecordArray[i];
                if (record.Id == id)
                    return record;
            }
            return null;
        };
        ConnectionViewer.prototype.initTitle = function (name) {
            $("title")[0].textContent = name + " - つながりビューワー";
        };
        ConnectionViewer.prototype.ShowCardsAndConnectors = function (record, connectionEntities, connectionTargetCRMEntities, oneToManyRelationshipEntitiesDic, manyToOneRelationshipEntitiesDic, manyToManyRelationshipEntitiesDic, manyToManyRelationshipTargetCRMEntitiesDic) {
            try {
                var listToBeAddedByConnectionEntities = CV.CRMLink.ConvertConnectionEntitiesToCRMLinkList(record, connectionEntities, connectionTargetCRMEntities, CV.connectionViewer.EntityMetadataCacheKeyIsObjectTypeCode, this);
                var listToBeAddedByOneToManyRelationshipEntities = CV.CRMLink.ConvertOneToManyRelationshipEntitiesToCRMLinkList(record, oneToManyRelationshipEntitiesDic, CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName, CV.connectionViewer.OneToManyRelationshipMetadataCache, CV.connectionViewer.AttributeMetadataCache);
                var listToBeAddedByManyToOneRelationshipEntities = CV.CRMLink.ConvertManyToOneRelationshipEntitiesToCRMLinkList(record, manyToOneRelationshipEntitiesDic, CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName, CV.connectionViewer.OneToManyRelationshipMetadataCache, CV.connectionViewer.AttributeMetadataCache);
                var listToBeAddedByManyToManyEntities = CV.CRMLink.ConvertManyToManyEntitiesToCRMLinkList(record, manyToManyRelationshipEntitiesDic, manyToManyRelationshipTargetCRMEntitiesDic, CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName);
                var toBeAddedList = [];
                toBeAddedList = listToBeAddedByConnectionEntities.concat(listToBeAddedByOneToManyRelationshipEntities);
                toBeAddedList = toBeAddedList.concat(listToBeAddedByManyToOneRelationshipEntities);
                toBeAddedList = toBeAddedList.concat(listToBeAddedByManyToManyEntities);
                record.CRMLinkArray = toBeAddedList;
                for (var i = 0; i < record.CRMLinkArray.length; i++) {
                    var crmLink = record.CRMLinkArray[i];
                    var alreadyExist = false;
                    var addedAnotherCRMLinkToExistingLink = false;
                    for (var j = 0; j < CV.connectionViewer.CRMLinkArray.length; j++) {
                        var existCrmLink = CV.connectionViewer.CRMLinkArray[j];
                        alreadyExist = existCrmLink.Connector.HaveSameContextInCrmLinkAray(crmLink);
                        if (!alreadyExist) {
                            if (CV.CRMLink.HaveSameCombinationOfCRMRecords(existCrmLink, crmLink)) {
                                existCrmLink.Connector.addCRMLink(crmLink);
                                crmLink.Connector = existCrmLink.Connector;
                                CV.forceGraph.setMultipleCRMConnetionFound(existCrmLink);
                                addedAnotherCRMLinkToExistingLink = true;
                            }
                        }
                    }
                    if (!alreadyExist && !addedAnotherCRMLinkToExistingLink) {
                        var target;
                        if (record.Id == crmLink.CRMRecord1.Id) {
                            target = crmLink.CRMRecord2;
                        }
                        else {
                            target = crmLink.CRMRecord1;
                        }
                        var foundRecord = null;
                        for (var k = 0; k < this.CRMRecordArray.length; k++) {
                            var existingRecord = this.CRMRecordArray[k];
                            if (existingRecord.Id == target.Id) {
                                foundRecord = existingRecord;
                                break;
                            }
                        }
                        if (!foundRecord) {
                            this.CRMRecordArray.push(target);
                            if (CV.connectionViewer.IS_CardsLaout_Replaying) {
                                var singleCardLayout = CV.connectionViewer.clm.findCardInReplaying(target.Id);
                                if (singleCardLayout) {
                                    var position = { x: singleCardLayout.X, y: singleCardLayout.Y };
                                    target.CreateCardControlWithDisplayName(position, singleCardLayout.Fixed);
                                }
                                else {
                                    target.CreateCardControlWithDisplayName(null, false);
                                }
                            }
                            else {
                                target.CreateCardControlWithDisplayName(null, false);
                            }
                            this.CheckAndUpdateLegend(target.EntityLogicalName);
                            crmLink.CreateConnector(record.Card, target.Card);
                        }
                        else {
                            var connectorWasSet = false;
                            for (var f in foundRecord.CRMLinkArray) {
                                var conToCheck = foundRecord.CRMLinkArray[f];
                                if (CV.CRMLink.HaveSameContext(crmLink, conToCheck) && conToCheck.Connector != null && crmLink.Connector == null) {
                                    crmLink.Connector = conToCheck.Connector;
                                    connectorWasSet = true;
                                    break;
                                }
                            }
                            if (!connectorWasSet) {
                                crmLink.CreateConnector(record.Card, foundRecord.Card);
                            }
                        }
                        this.CRMLinkArray.push(crmLink);
                    }
                }
                record.AreConnectionsRetrieved = true;
            }
            catch (e) {
                CV.Helper.addErrorMessageln(e.message + " in ShowCardsAndConnectors()");
            }
        };
        ConnectionViewer.prototype.translateCanvas = function (x, y) {
            CV.forceGraph.setCanvasPosition(x, y);
        };
        ConnectionViewer.prototype.showInitialCRMRecord = function (record) {
            if (CV.connectionViewer.IS_CardsLaout_Replaying) {
                var singleCardLayout = CV.connectionViewer.clm.findCardInReplaying(record.Id);
                if (singleCardLayout) {
                    var position = { x: singleCardLayout.X, y: singleCardLayout.Y };
                    record.CreateCardControlWithDisplayName(position, singleCardLayout.Fixed);
                }
                else {
                    record.CreateCardControlWithDisplayName({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, true);
                }
            }
            else {
                record.CreateCardControlWithDisplayName({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, true);
            }
            this.clm.PrimaryCRMRecord = record;
            record.Card.Focus();
            this.initLegend();
            this.CheckAndUpdateLegend(record.EntityLogicalName);
        };
        ConnectionViewer.prototype.initLegend = function () {
            this.legendAlreadyShownEntityLogicalNameArray = [];
        };
        ConnectionViewer.prototype.CheckAndUpdateLegend = function (entityLogicalName) {
            if (this.legendAlreadyShownEntityLogicalNameArray.indexOf(entityLogicalName) < 0
                && CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName != null
                && (entityLogicalName in CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName)
                && CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName] != null
                && entityLogicalName != "annotation") {
                var objectTypeCode = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].ObjectTypeCode;
                var entitySchemaName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].SchemaName;
                var url = CV.CardControl.GetIcon32UrlStatic(objectTypeCode, entitySchemaName);
                var entityDisplayName = CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].DisplayName.UserLocalizedLabel.Label;
                var MyLegendTable = document.getElementById("MyLegendTable");
                var elemTR = document.createElement("TR");
                var elemTD1 = document.createElement("TD");
                var elemSPAN = document.createElement("SPAN");
                elemSPAN.className = "entityLegend";
                elemSPAN.style.backgroundColor = CV.CardControl.getEntityColor(entityLogicalName);
                elemTD1.appendChild(elemSPAN);
                var elemIMG = document.createElement("IMG");
                elemIMG.className = "cardImage";
                elemIMG.setAttribute("src", url);
                elemIMG.setAttribute("title", entityDisplayName);
                elemSPAN.appendChild(elemIMG);
                var elemTD2 = document.createElement("TD");
                elemTD2.innerHTML = ": " + entityDisplayName;
                elemTR.appendChild(elemTD1);
                elemTR.appendChild(elemTD2);
                MyLegendTable.appendChild(elemTR);
                this.legendAlreadyShownEntityLogicalNameArray.push(entityLogicalName);
            }
        };
        ConnectionViewer.prototype.initOptionsPanel = function () {
            this.initConfigInOptionsPanel();
            if (!CV.connectionViewer.IS_DEMO_MODE)
                this.initCardsLayoutInOptionPanel();
        };
        ConnectionViewer.prototype.initConfigInOptionsPanel = function () {
            var currentDefaultConfig = CV.Config.getCurrentDefaultConfig(CV.connectionViewer.configSet);
            var id = "config" + (0).toString();
            var dataCvConfigId = "";
            var displayDataCvConfigId = "";
            var title = "";
            var aText = "特に指定しない";
            var configRemark = "";
            if ((!CV.Options.getUserOptions()) || (CV.Options.getUserOptions() && CV.Options.getUserOptions().ConfigID == dataCvConfigId)) {
                configRemark += "[ 現在の選択 ] ";
            }
            var configDescription = "常にシステムで最新の既定のコンフィグを利用します。";
            var $li = $('<li/>');
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
            $li.bind("tap", function (event) {
                var CvConfigId = $(event.target).attr("data-cv-config-id");
                if (!CvConfigId) {
                    CvConfigId = $(event.target).parents("a").attr("data-cv-config-id");
                }
                var currentUserOptionsConfigID = "";
                if (CV.Options.getUserOptions()) {
                    currentUserOptionsConfigID = CV.Options.getUserOptions().ConfigID;
                }
                if (CvConfigId != currentUserOptionsConfigID) {
                    var newOption = new CV.Options(CvConfigId);
                    CV.Options.setUserOptions(newOption);
                    setTimeout(function () { location.reload(); }, 200);
                }
                $('#MyOptionsPanel').panel('close');
            });
            $('#MyListview').append($li);
            for (var i = 0; i < this.configSet.ConfigArray.length; i++) {
                var config = this.configSet.ConfigArray[i];
                var id = "config" + (i + 1).toString();
                var dataCvConfigId = config.ID;
                var displayDataCvConfigId = config.ID;
                var title = displayDataCvConfigId;
                var aText = config.ID;
                var configRemark = "";
                if (CV.Options.getUserOptions() && CV.Options.getUserOptions().ConfigID == dataCvConfigId) {
                    configRemark += "[ 現在の選択 ] ";
                }
                if (config.ID == currentDefaultConfig.ID) {
                    configRemark += "[ 既定 ]";
                }
                var configDescription = config.Description;
                var $li = $('<li/>');
                if (i == this.configSet.ConfigArray.length - 1) {
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
                $li.bind("tap", function (event) {
                    var CvConfigId = $(event.target).attr("data-cv-config-id");
                    if (!CvConfigId) {
                        CvConfigId = $(event.target).parents("a").attr("data-cv-config-id");
                    }
                    var currentUserOptionsConfigID = "";
                    if (CV.Options.getUserOptions()) {
                        currentUserOptionsConfigID = CV.Options.getUserOptions().ConfigID;
                    }
                    if (CvConfigId != currentUserOptionsConfigID) {
                        var newOption = new CV.Options(CvConfigId);
                        CV.Options.setUserOptions(newOption);
                        setTimeout(function () { location.reload(); }, 200);
                    }
                    $('#MyOptionsPanel').panel('close');
                });
                $('#MyListview').append($li);
            }
        };
        ConnectionViewer.prototype.initCardsLayoutInOptionPanel = function () {
            if (CV.connectionViewer.config.CardsLayoutEnabled) {
                $("#MyCardsLayoutDescriptionInput").val(CV.connectionViewer.config.DefaultCardsLayoutDescription);
                $("#MyCardsLayoutSaveButton").bind("tap", function (event) {
                    CV.connectionViewer.clm.SaveCurrentCardsLayoutDeferredized($("#MyCardsLayoutDescriptionInput").val())
                        .then(function () {
                        CV.Helper.addMessageln("展開されたカードレイアウトのデータが保存されました。");
                    })
                        .fail(function (e) {
                        CV.Helper.addErrorMessageln(e.toString() + " in initCardsLayoutInOptionPanel()");
                    });
                });
                $("#MyCardsLayoutLoadButton").bind("tap", function (event) {
                    try {
                        CV.connectionViewer.clm.LoadCardsLayoutListDeferredized()
                            .then(function (list) {
                            $("#MyCardsLayoutListview").empty();
                            if (list.length == 0) {
                                var $li = $('<li/>');
                                $li.append("一件もありません。");
                                $("#MyCardsLayoutListview").append($li);
                                $("#MyCardsLayoutListview").listview("refresh");
                            }
                            else {
                                for (var i = 0; i < list.length; i++) {
                                    var annotation = list[i];
                                    var id = "cardslayout" + (i + 0).toString();
                                    var annotationId = annotation.Id;
                                    var createdon = annotation.CreatedonFormattedValue;
                                    var description = annotation.Notetext;
                                    var createdby = annotation.CreatedbyFormattedValue;
                                    var $li = $('<li/>');
                                    if (i == 0)
                                        $li.addClass("ui-first-child");
                                    else if (i == list.length - 1)
                                        $li.addClass("ui-last-child");
                                    var $a = $('<a/>');
                                    $a.addClass("ui-btn ui-btn-icon-right ui-icon-carat-r");
                                    $a.attr("id", id);
                                    $a.attr("data-cv-annotation-id", annotationId);
                                    $a.attr("href", "#");
                                    $a.attr("data-rel", "close");
                                    $a.attr("title", description + "\n作成日時: " + createdon + "\n作成者: " + createdby);
                                    if (description) {
                                        var $description = $('<div/>');
                                        $description.addClass("cardlayoutDescriptionItem");
                                        $description.append(description);
                                        $a.append($description);
                                    }
                                    if (createdon) {
                                        var $createdon = $('<div/>');
                                        $createdon.addClass("cardlayoutItem");
                                        $createdon.append("作成日時: " + createdon);
                                        $a.append($createdon);
                                    }
                                    if (createdby) {
                                        var $createdby = $('<div/>');
                                        $createdby.addClass("cardlayoutItem");
                                        $createdby.append("作成者: " + createdby);
                                        $a.append($createdby);
                                    }
                                    $li.append($a);
                                    $li.bind("tap", function (event) {
                                        var CvAnnotationId = $(event.target).attr("data-cv-annotation-id");
                                        if (!CvAnnotationId) {
                                            CvAnnotationId = $(event.target).parents("a").attr("data-cv-annotation-id");
                                        }
                                        setTimeout(function () {
                                            var params = MyGeneralLibrary.getParams();
                                            var annotationParam = "annotationId=" + CvAnnotationId;
                                            var toBeReloadedSearch;
                                            if (!params["data"]) {
                                                toBeReloadedSearch = location.search + "&data=" + encodeURIComponent(annotationParam);
                                            }
                                            else {
                                                var dataParams = MyGeneralLibrary.getCRMDataParams();
                                                dataParams["annotationId"] = CvAnnotationId;
                                                var dataParamsString = MyGeneralLibrary.getParamsString(dataParams);
                                                params["data"] = encodeURIComponent(dataParamsString);
                                                var paramsString = MyGeneralLibrary.getParamsString(params);
                                                toBeReloadedSearch = "?" + paramsString;
                                            }
                                            location.search = toBeReloadedSearch;
                                        }, 200);
                                        $('#MyOptionsPanel').panel('close');
                                    });
                                    $("#MyCardsLayoutListview").append($li);
                                    $("#MyCardsLayoutListview").listview("refresh");
                                }
                            }
                            $("#MyCardsLayoutCancelButton").css("visibility", "visible");
                        }).fail(function (e) {
                            CV.Helper.addErrorMessageln(e.toString() + " in initCardsLayoutInOptionPanel()");
                        });
                    }
                    catch (e) {
                        CV.Helper.addErrorMessageln(e.toString() + " in initCardsLayoutInOptionPanel()");
                    }
                });
            }
        };
        ConnectionViewer.showCurrentlyRetrievingStoryboard = function (show) {
            $("#MySpinnerDiv").css("visibility", show ? "visible" : "hidden");
        };
        ConnectionViewer.prototype.getEntityLogicalNameAndGuidFromParameter = function () {
            try {
                var id, entityName;
                var trim = function (idStr) {
                    var trimmedId;
                    if (idStr[0] == "{")
                        trimmedId = idStr.substr(1, id.length - 2);
                    else if (idStr.substr(0, 3).toLowerCase() == "%7b")
                        trimmedId = idStr.substr(3, id.length - 6);
                    else
                        trimmedId = null;
                    return trimmedId;
                };
                if (this.IS_DEMO_MODE) {
                    id = CV.Demo_Data.getEntityLogicalNameAndGuidFromParameter().guid;
                    entityName = CV.Demo_Data.getEntityLogicalNameAndGuidFromParameter().entityLogicalName;
                }
                else {
                    var params = MyGeneralLibrary.getParams();
                    id = params["id"];
                    if (id) {
                        this.IS_IN_CRM_FORM = true;
                        id = trim(id);
                        entityName = params["typename"];
                    }
                    else {
                        this.IS_IN_CRM_FORM = false;
                        params = MyGeneralLibrary.getCRMDataParams();
                        id = params["id"];
                        id = trim(id);
                        entityName = params["typename"];
                    }
                }
                return {
                    entityLogicalName: entityName,
                    guid: id
                };
            }
            catch (e) {
                return null;
            }
        };
        ConnectionViewer.preventSafariTouchScroll = function () {
            $("div#MyCardConnectionDiv").bind("touchstart", function () {
                event.preventDefault();
            });
        };
        ConnectionViewer.changeTouchActionStyle = function () {
            $("body").css("touch-action", "none");
        };
        ConnectionViewer.openNewWindow = function () {
            var id = CV.connectionViewer.paramGuid;
            var entityLogicalName = CV.connectionViewer.paramEntityLogicalName;
            window.open(Xrm.Page.context.getClientUrl() + "/WebResources/" + CV.ConnectionViewer.CRM_PUBLISHER_PREFIX + "_/" + CV.ConnectionViewer.CRM_SOLUTION_NAME + "/CV/main.html?data=id%3D%7B" + id + "%7D%26typename%3D" + entityLogicalName);
        };
        ConnectionViewer.run = function () {
            new CV.ConnectionViewer();
            CV.ConnectionViewer.preventSafariTouchScroll();
            CV.ConnectionViewer.changeTouchActionStyle();
        };
        return ConnectionViewer;
    }());
    ConnectionViewer.CRM_PUBLISHER_PREFIX = "mskksamp";
    ConnectionViewer.CRM_SOLUTION_NAME = "D365ConnectionViewer";
    ConnectionViewer.CARD_DISTANCE = 180;
    ConnectionViewer.isNowDragging = false;
    CV.ConnectionViewer = ConnectionViewer;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var ForceGraph_CircleUI = (function () {
        function ForceGraph_CircleUI(svgGForCardsID, svgGForLinesID, svgGForConnectionDescriptions, svgGForConnectionRoles) {
            this.currentFocusedCardID = null;
            this.currentEventD3obj = null;
            this.force = d3.layout.force();
            this.forceList = { nodes: this.force.nodes(), links: this.force.links() };
            this.svgGForCards = d3.select(svgGForCardsID);
            this.svgGForLines = d3.select(svgGForLinesID);
            this.svgGForConnectionDescriptions = d3.select(svgGForConnectionDescriptions);
            this.svgGForConnectionRoles = d3.select(svgGForConnectionRoles);
            this.svg = d3.select("svg")
                .attr("width", window.innerWidth).attr("height", window.innerHeight);
            CV.ForceGraph_CircleUI.radius_for_l = parseInt($("#MyDefCircleL").attr("r"));
            CV.ForceGraph_CircleUI.radius_for_m = parseInt($("#MyDefCircleM").attr("r"));
            CV.ForceGraph_CircleUI.radius_for_role_l = parseInt($("#MyDefCircleL").attr("r")) + parseInt($("#MyDefCircleL").attr("stroke-width"));
            CV.ForceGraph_CircleUI.radius_for_role_m = parseInt($("#MyDefCircleM").attr("r")) + parseInt($("#MyDefCircleM").attr("stroke-width"));
            d3.select("#MySVG").attr("pointer-events", "all");
        }
        ForceGraph_CircleUI.prototype.addNode = function (nodeObj) {
            if (nodeObj.x && nodeObj.y) {
                this.forceList.nodes.push({
                    name: nodeObj.name,
                    entityImage: nodeObj.entityImage,
                    id: CV.IDPrefix + nodeObj.id,
                    iconURL: nodeObj.iconURL,
                    x: nodeObj.x,
                    y: nodeObj.y,
                    fixed: nodeObj.fixed,
                    entityName: nodeObj.entityName,
                    sizeType: "L",
                    radius: CV.ForceGraph_CircleUI.radius_for_role_l
                });
            }
            else {
                this.forceList.nodes.push({
                    name: nodeObj.name,
                    entityImage: nodeObj.entityImage,
                    id: CV.IDPrefix + nodeObj.id,
                    iconURL: nodeObj.iconURL,
                    entityName: nodeObj.entityName,
                    sizeType: "L",
                    radius: CV.ForceGraph_CircleUI.radius_for_role_l
                });
            }
            this.refreshWhenAdd(nodeObj);
        };
        ForceGraph_CircleUI.prototype.addLink = function (linkObj) {
            var foundSource = this.findNode(CV.IDPrefix + linkObj.source);
            var foundTarget = this.findNode(CV.IDPrefix + linkObj.target);
            if (foundSource != null && foundTarget != null) {
                this.forceList.links.push({
                    source: foundSource,
                    target: foundTarget,
                    id: linkObj.linkId,
                    description: linkObj.description,
                    role1: linkObj.role1,
                    role2: linkObj.role2,
                    connector: linkObj.connector
                });
                this.refreshWhenAdd(null);
            }
        };
        ForceGraph_CircleUI.prototype.setMultipleCRMConnetionFound = function (crmLink) {
            var found = false;
            for (var i in this.forceList.links) {
                var link = this.forceList.links[i];
                if (link["id"] == crmLink.LinkId) {
                    link["description"] = crmLink.Connector.Description;
                    link["role1"] = crmLink.Connector.Role1;
                    link["role2"] = crmLink.Connector.Role2;
                    link["connector"] = crmLink.Connector;
                    found = true;
                }
            }
            if (found) {
                this.updateForceConnectionDescriptionG();
                this.updateForceConnectionRole1();
                this.updateForceConnectionRole2();
            }
        };
        ForceGraph_CircleUI.prototype.findNode = function (id) {
            for (var i in this.forceList.nodes) {
                if (this.forceList.nodes[i]["id"] == id)
                    return this.forceList.nodes[i];
            }
            return null;
        };
        ForceGraph_CircleUI.prototype.setForceSizeAndStart = function () {
            d3.selectAll("#MySVG,#MyDragDropRect")
                .attr("width", window.innerWidth)
                .attr("height", window.innerHeight);
            if (CV.connectionViewer.config.SmallerSizeEnabled) {
                this.force.size([window.innerWidth, window.innerHeight])
                    .linkDistance(function (d) {
                    if (d.source.sizeType == "M" && d.target.sizeType == "M")
                        return CV.ForceGraph_CircleUI.CARD_DISTANCE_MM;
                    else if (d.source.sizeType == "L" && d.target.sizeType == "L")
                        return CV.ConnectionViewer.CARD_DISTANCE;
                    else
                        return CV.ForceGraph_CircleUI.CARD_DISTANCE_LM;
                })
                    .charge(-5000)
                    .start();
            }
            else {
                this.force.size([window.innerWidth, window.innerHeight])
                    .linkDistance(CV.ConnectionViewer.CARD_DISTANCE)
                    .charge(-5000)
                    .start();
            }
        };
        ForceGraph_CircleUI.prototype.setForceOnTick = function (forceConnectionLine, forceConnectionDescriptionG, forceConnectionRole1, forceConnectionRole2, forceNodeCard) {
            this.force.on("tick", function () {
                forceConnectionLine
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });
                forceConnectionDescriptionG
                    .attr("transform", function (d, i) {
                    var x = (d.source.x + d.target.x) / 2;
                    var y = (d.source.y + d.target.y) / 2;
                    return "translate(" + x + " " + y + ")";
                });
                forceConnectionRole1
                    .each(function (d, index, outerIndex) {
                    var textElem = forceConnectionRole1[outerIndex][index];
                    var obj = CV.ForceGraph_CircleUI.UpdatePositionARole(d.source.radius, d.source.x, d.source.y, d.target.x, d.target.y, false, index);
                    d.x = obj.position.x;
                    d.y = obj.position.y;
                    textElem.setAttribute("text-anchor", obj["text-anchor"]);
                    textElem.setAttribute("dominant-baseline", obj["dominant-baseline"]);
                    textElem.setAttribute("x", d.x);
                    textElem.setAttribute("y", d.y);
                });
                forceConnectionRole2
                    .each(function (d, index, outerIndex) {
                    var textElem = forceConnectionRole2[outerIndex][index];
                    var obj = CV.ForceGraph_CircleUI.UpdatePositionARole(d.target.radius, d.source.x, d.source.y, d.target.x, d.target.y, true);
                    d.x = obj.position.x;
                    d.y = obj.position.y;
                    textElem.setAttribute("x", d.x);
                    textElem.setAttribute("y", d.y);
                    textElem.setAttribute("text-anchor", obj["text-anchor"]);
                    textElem.setAttribute("dominant-baseline", obj["dominant-baseline"]);
                });
                forceNodeCard
                    .attr("transform", function (d) { return "translate(" + d.x + " " + d.y + ")"; });
            });
        };
        ForceGraph_CircleUI.prototype.appendAndGetForceConnectionLine = function () {
            var forceConnectionLine = this.svgGForLines.selectAll("line.connectionLine")
                .data(this.forceList.links);
            forceConnectionLine.enter().append("line")
                .classed("connectionLine", true);
            forceConnectionLine.exit().remove();
            return forceConnectionLine;
        };
        ForceGraph_CircleUI.prototype.appendAndGetForceConnectionDescriptionG = function () {
            var hasDescriptionArray = this.forceList.links.filter(function (value, index, array) {
                return !(value.connector.Description == null || value.connector.Description == "");
            });
            var forceConnectionDescriptionG = this.svgGForConnectionDescriptions.selectAll("g.connectionDescriptionG")
                .data(hasDescriptionArray);
            var connectionDescriptionG = forceConnectionDescriptionG
                .enter()
                .append("g")
                .classed("connectionDescriptionG", true);
            var rect = connectionDescriptionG.append("rect")
                .classed("connectionMask", true)
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 100)
                .attr("height", 16);
            connectionDescriptionG.append("text")
                .classed("connectionDescription", true)
                .attr("x", 0)
                .attr("y", 4)
                .attr("pointer-events", "visibleFill")
                .attr("text-anchor", "middle")
                .text(function (d) { return d.connector.Description; })
                .on("touchstart", function (d, i) { CV.forceGraph.connectionMaskToClickTouchPointerMouseStart(d, i); })
                .on("pointerdown", function (d, i) { CV.forceGraph.connectionMaskToClickTouchPointerMouseStart(d, i); })
                .on("mousedown", function (d, i) { CV.forceGraph.connectionMaskToClickTouchPointerMouseStart(d, i); });
            rect.each(function (d, index, outerIndex) {
                var svgTextObj = d3.selectAll("text.connectionDescription")[outerIndex][index];
                var w = svgTextObj.getBBox().width;
                var h = svgTextObj.getBBox().height;
                var thisRectObj = d3.selectAll("rect.connectionMask")[outerIndex][index];
                thisRectObj.setAttribute("x", -w / 2);
                thisRectObj.setAttribute("y", -h / 2);
                thisRectObj.setAttribute("width", w);
                thisRectObj.setAttribute("height", h);
            });
            forceConnectionDescriptionG.exit().remove();
            return forceConnectionDescriptionG;
        };
        ForceGraph_CircleUI.prototype.updateForceConnectionDescriptionG = function () {
            var hasDescriptionArray = this.forceList.links.filter(function (value, index, array) {
                return !(value.connector.Description == null || value.connector.Description == "");
            });
            var forceConnectionDescriptionG = this.svgGForConnectionDescriptions.selectAll("text.connectionDescription")
                .data(hasDescriptionArray)
                .text(function (d) { return d.description; });
            var forceRect = this.svgGForConnectionDescriptions.selectAll("rect.connectionMask");
            forceRect.each(function (d, index, outerIndex) {
                var svgTextObj = d3.selectAll("text.connectionDescription")[outerIndex][index];
                var w = svgTextObj.getBBox().width;
                var h = svgTextObj.getBBox().height;
                var thisRectObj = d3.selectAll("rect.connectionMask")[outerIndex][index];
                thisRectObj.setAttribute("x", -w / 2);
                thisRectObj.setAttribute("y", -h / 2);
                thisRectObj.setAttribute("width", w);
                thisRectObj.setAttribute("height", h);
            });
        };
        ForceGraph_CircleUI.prototype.appendAndGetForceConnectionRole1 = function () {
            var linkRole1HasTextList = this.forceList.links.filter(function (value, index, array) {
                return value.role1;
            });
            var forceConnectionRole1 = this.svgGForConnectionRoles.selectAll("text.connectionRole1")
                .data(linkRole1HasTextList);
            forceConnectionRole1.enter().append("text")
                .classed("connectionRole1", true)
                .text(function (d, i) { return d.role1; });
            forceConnectionRole1.exit().remove();
            return forceConnectionRole1;
        };
        ForceGraph_CircleUI.prototype.updateForceConnectionRole1 = function () {
            var linkRole1HasTextList = this.forceList.links.filter(function (value, index, array) {
                return value.role1;
            });
            var forceConnectionRole1 = this.svgGForConnectionRoles.selectAll("text.connectionRole1")
                .data(linkRole1HasTextList);
            forceConnectionRole1
                .text(function (d, i) { return d.role1; });
            forceConnectionRole1.exit().remove();
            return forceConnectionRole1;
        };
        ForceGraph_CircleUI.prototype.appendAndGetForceConnectionRole2 = function () {
            var linkRole2HasTextList = this.forceList.links.filter(function (value, index, array) {
                return value.role2;
            });
            var forceConnectionRole2 = this.svgGForConnectionRoles.selectAll("text.connectionRole2")
                .data(linkRole2HasTextList);
            forceConnectionRole2.enter().append("text")
                .classed("connectionRole2", true)
                .text(function (d, i) { return d.role2; });
            forceConnectionRole2.exit().remove();
            return forceConnectionRole2;
        };
        ForceGraph_CircleUI.prototype.updateForceConnectionRole2 = function () {
            var linkRole2HasTextList = this.forceList.links.filter(function (value, index, array) {
                return value.role2;
            });
            var forceConnectionRole2 = this.svgGForConnectionRoles.selectAll("text.connectionRole2")
                .data(linkRole2HasTextList);
            forceConnectionRole2
                .text(function (d, i) { return d.role2; });
            forceConnectionRole2.exit().remove();
            return forceConnectionRole2;
        };
        ForceGraph_CircleUI.prototype.connectionMaskToClickTouchPointerMouseStart = function (d, i) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            var hasDescriptionArray = this.forceList.links.filter(function (value, index, array) {
                return !(value.connector.Description == null || value.connector.Description == "");
            });
            var data = hasDescriptionArray[i];
            $("#MyMultipleLlinksRecordDisplayNameLeft").html(data.connector.Card1.DisplayName);
            $("#MyMultipleLlinksRecordDisplayNameRightt").html(data.connector.Card2.DisplayName);
            $("#MyMultipleLlinksEntityDisplayNameLeft").html(CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[data.connector.Card1.EntityLogicalName].DisplayName.UserLocalizedLabel.Label);
            $("#MyMultipleLlinksEntityDisplayNameRight").html(CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[data.connector.Card2.EntityLogicalName].DisplayName.UserLocalizedLabel.Label);
            var html = '';
            for (var l in data.connector.CrmLinkArray) {
                var crmLink = data.connector.CrmLinkArray[l];
                var r1 = (crmLink.Record1DisplayRoleName) ? crmLink.Record1DisplayRoleName : "・";
                var r2 = (crmLink.Record2DisplayRoleName) ? crmLink.Record2DisplayRoleName : "・";
                var desc = (crmLink.LinkType == CV.CRMLinkTypeEnum.ManyToMany) ? "(N:N関係)" : crmLink.Description;
                if (desc) {
                    html += '<table class="multipleLlinksOneLink" style="width: 100%;">';
                    html += '    <tr>';
                    html += '        <td class="multipleLlinksTD" style="text-align: left; width: auto;">' + r1 + '</td>';
                    html += '        <td class="multipleLlinksTD" style="width: 50%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '        <td class="multipleLlinksTD" style="text-align: center;"><p class="multipleLlinksDescription">' + desc + '</p></td>';
                    html += '        <td class="multipleLlinksTD" style="width: 50%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '        <td class="multipleLlinksTD" style="text-align: right;">' + r2 + '</td>';
                    html += '    </tr>';
                    html += '</table>';
                }
                else {
                    html += '                    <table class="multipleLlinksOneLink" style="width: 100%;">';
                    html += '                        <tr>';
                    html += '                            <td class="multipleLlinksTD" style="text-align: left; width: auto;">' + r1 + '</td>';
                    html += '                            <td class="multipleLlinksTD" style="width: 100%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '                            <td class="multipleLlinksTD" style="text-align: right;">' + r2 + '</td>';
                    html += '                        </tr>';
                    html += '                    </table>';
                }
            }
            $("#MyMyMultipleCRMLinkPanelAllLinks").html(html);
            $("#MyShowMultipleCRMLinkPanel").click();
        };
        ForceGraph_CircleUI.prototype.touchPointerMouseStart = function (d) {
            if (!CV.forceGraph.currentEventD3obj) {
                CV.forceGraph.currentEventD3obj = d;
                CV.forceGraph.dragStartedPoint = new CV.Helper.Point(d.x, d.y);
                CV.forceGraph.focusACardControl(d);
            }
        };
        ForceGraph_CircleUI.prototype.touchPointerMouseEnd = function (d) {
            CV.forceGraph.currentEventD3obj = null;
        };
        ForceGraph_CircleUI.prototype.taphold = function (event) {
            var cardEl;
            if (event.target.className.baseVal == "circleCard") {
                cardEl = event.target;
            }
            else if (event.currentTarget.className.baseVal == "circleCard") {
                cardEl = event.currentTarget;
            }
            else {
                return;
            }
            var id = cardEl.id;
            var d3obj = this.findNode(id);
            var currentPoint = new CV.Helper.Point(d3obj.x, d3obj.y);
            var dx = currentPoint.x - CV.forceGraph.dragStartedPoint.x;
            var dy = currentPoint.y - CV.forceGraph.dragStartedPoint.y;
            if (dx * dx + dy * dy < 100) {
                CV.forceGraph.cardToggleFixed(d3obj);
            }
            else {
                CV.forceGraph.cardFixed(d3obj);
            }
        };
        ForceGraph_CircleUI.prototype.cardToggleFixed = function (d3obj) {
            var cardCircle = $("#" + d3obj.id + " .circleInCard");
            if (!(d3obj.fixed & 1)) {
                cardCircle.attr("filter", "url(#MyDefDropShadow)");
                d3obj.fixed |= 1;
            }
            else {
                cardCircle.attr("filter", "");
                d3obj.fixed &= ~1;
            }
        };
        ForceGraph_CircleUI.prototype.cardFixed = function (d3obj) {
            var cardCircle = $("#" + d3obj.id + " .circleInCard");
            cardCircle.attr("filter", "url(#MyDefDropShadow)");
            d3obj.fixed |= 1;
        };
        ForceGraph_CircleUI.prototype.refreshWhenAdd = function (nodeObj) {
            var forceConnectionLine = this.appendAndGetForceConnectionLine();
            var forceConnectionDescriptionG = this.appendAndGetForceConnectionDescriptionG();
            var forceConnectionRole1 = this.appendAndGetForceConnectionRole1();
            var forceConnectionRole2 = this.appendAndGetForceConnectionRole2();
            var forceNodeCard = this.svgGForCards.selectAll("g.circleCard")
                .data(this.forceList.nodes);
            var nodeEnter = forceNodeCard.enter()
                .append("g")
                .attr("id", function (d) { return d.id; })
                .classed("circleCard", true)
                .on("touchstart", this.touchPointerMouseStart)
                .on("touchend", this.touchPointerMouseEnd)
                .on("pointerdown", this.touchPointerMouseStart)
                .on("pointerup", this.touchPointerMouseEnd)
                .on("mousedown", this.touchPointerMouseStart)
                .on("mouseup", this.touchPointerMouseEnd);
            if (nodeObj) {
                $("#" + CV.IDPrefix + nodeObj.id).bind("taphold", function (event) { CV.forceGraph.taphold(event); });
            }
            nodeEnter = nodeEnter
                .call(this.force.drag);
            nodeEnter
                .append("title")
                .text(function (d) { return d.name; });
            nodeEnter
                .append("use")
                .classed("circleInCard", true)
                .attr("xlink:href", function (d) { return "#MyDefCircle" + d.sizeType; })
                .attr("fill", "rgb(166,166,166)")
                .attr("stroke", function (d) { return CV.CardControl.getEntityColor(d.entityName); })
                .attr("filter", function (d) {
                return (d.fixed) ? "url(#MyDefDropShadow)" : "";
            });
            nodeEnter
                .append("image")
                .attr("x", -16)
                .attr("y", -46)
                .attr("xlink:href", function (d) {
                if (d.entityImage)
                    return "data:image/png;base64," + d.entityImage;
                else
                    return d.iconURL;
            })
                .attr("cursor", "move")
                .attr("width", 32)
                .attr("height", 32)
                .attr("visibility", function (d) { return (d.sizeType == "L") ? "visible" : "collapse"; });
            var nodeEnterText = nodeEnter
                .append("text")
                .classed("nameInCard", true)
                .attr("font-family", "Meiryo UI")
                .attr("font-size", "9pt")
                .attr("fill", "white")
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .attr("cursor", function (d) { return (d.sizeType == "L") ? "pointer" : "move"; })
                .text(function (d) { return d.name; });
            nodeEnterText.each(function (d, index, outerIndex) {
                var thisSvgText = d3.selectAll("text.nameInCard")[outerIndex][index];
                var computedTextLength = thisSvgText.getComputedTextLength();
                d.computedTextLength = computedTextLength;
                d.numberOfLines = CV.ForceGraph_CircleUI.getNumberOfLines(computedTextLength, d.sizeType);
            });
            nodeEnterText.filter(function (d) { return (d.numberOfLines == 1); })
                .attr("x", 0)
                .attr("y", 4)
                .attr("font-family", "Meiryo UI")
                .attr("font-size", "9pt")
                .attr("fill", "white")
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .attr("text-anchor", "middle");
            nodeEnterText.filter(function (d) { return !(d.numberOfLines == 1); })
                .attr("font-family", "Meiryo UI")
                .attr("font-size", "9pt")
                .attr("fill", "white")
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .text("")
                .append("textPath")
                .attr("xlink:href", function (d) { return "#MyDefTextPath" + d.sizeType + d.numberOfLines; })
                .text(function (d) { return d.name; });
            nodeEnter
                .append("text")
                .classed("cardToBeRetrieved", true)
                .attr("x", 0)
                .attr("y", function (d) { return (d.sizeType == "L") ? 43 : 27; })
                .attr("font-family", "Meiryo UI")
                .attr("font-size", "9pt")
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .attr("cursor", "move")
                .text("…");
            forceNodeCard.exit().remove();
            this.setForceOnTick(forceConnectionLine, forceConnectionDescriptionG, forceConnectionRole1, forceConnectionRole2, forceNodeCard);
            this.setForceSizeAndStart();
        };
        ForceGraph_CircleUI.prototype.refreshWhenUpdate = function () {
            var focusedId = CV.IDPrefix + CV.forceGraph.currentFocusedCardID;
            var directlyConnectedId = [];
            for (var i in this.forceList.links) {
                var link = this.forceList.links[i];
                if (link.source.id == focusedId) {
                    directlyConnectedId.push(link.target.id);
                }
                else if (link.target.id == focusedId) {
                    directlyConnectedId.push(link.source.id);
                }
            }
            var forceNodeCard = this.svgGForCards.selectAll("g.circleCard")
                .data(this.forceList.nodes)
                .each(function (d, index, outerIndex) {
                var id = d.id;
                if (id == focusedId || 0 <= directlyConnectedId.indexOf(id)) {
                    var previousSizeType = d.sizeType;
                    d.sizeType = "L";
                    d.radius = CV.ForceGraph_CircleUI.radius_for_role_l;
                    if (previousSizeType != d.sizeType)
                        d.sizeChanged = true;
                    else
                        d.sizeChanged = false;
                }
                else {
                    var previousSizeType = d.sizeType;
                    d.sizeType = "M";
                    d.radius = CV.ForceGraph_CircleUI.radius_for_role_m;
                    if (previousSizeType != d.sizeType)
                        d.sizeChanged = true;
                    else
                        d.sizeChanged = false;
                }
            });
            this.svgGForCards.selectAll("g.circleCard > use.circleInCard")
                .data(this.forceList.nodes)
                .attr("xlink:href", function (d) {
                if (d.sizeChanged) {
                    return (d.sizeType == "L") ? "#MyDefCircleMtoL" : "#MyDefCircleLtoM";
                }
                else {
                    return (d.sizeType == "L") ? "#MyDefCircleL" : "#MyDefCircleM";
                }
            });
            d3.select("#MyDefCircleLtoM").attr("r", CV.ForceGraph_CircleUI.radius_for_l);
            d3.select("#MyDefCircleMtoL").attr("r", CV.ForceGraph_CircleUI.radius_for_m);
            d3.select("#MyDefCircleLtoM").transition().attr("r", CV.ForceGraph_CircleUI.radius_for_m).ease('exp').duration(500);
            d3.select("#MyDefCircleMtoL").transition().attr("r", CV.ForceGraph_CircleUI.radius_for_l).ease('exp').duration(500);
            this.svgGForCards.selectAll("g.circleCard > image")
                .data(this.forceList.nodes)
                .attr("visibility", function (d) { return (d.sizeType == "L") ? "visible" : "collapse"; });
            var nodeNameInCard = this.svgGForCards.selectAll("g.circleCard > text.nameInCard")
                .data(this.forceList.nodes)
                .each(function (d, index, outerIndex) {
                d.numberOfLines = CV.ForceGraph_CircleUI.getNumberOfLines(d.computedTextLength, d.sizeType);
            });
            nodeNameInCard.filter(function (d) { return (d.numberOfLines == 1) ? true : false; })
                .attr("x", 0)
                .attr("y", 4)
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .attr("cursor", function (d) { return (d.sizeType == "L") ? "pointer" : "move"; })
                .attr("text-anchor", "middle")
                .attr("onclick", function (d) { return (d.sizeType == "L") ? "CV.CardControl.OpenNewCRMFormWindow(this)" : null; })
                .text(function (d) { return d.name; })
                .select("textPath")
                .style("visibility", "collapse");
            nodeNameInCard.filter(function (d) { return !(d.numberOfLines == 1); })
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .attr("cursor", function (d) { return (d.sizeType == "L") ? "pointer" : "move"; })
                .attr("text-anchor", null)
                .attr("onclick", function (d) { return (d.sizeType == "L") ? "CV.CardControl.OpenNewCRMFormWindow(this)" : null; })
                .text("")
                .append("textPath")
                .attr("xlink:href", function (d) { return "#MyDefTextPath" + d.sizeType + d.numberOfLines; })
                .text(function (d) { return d.name; });
            this.svgGForCards.selectAll("g.circleCard > text.cardToBeRetrieved")
                .data(this.forceList.nodes)
                .attr("y", function (d) { return (d.sizeType == "L") ? 43 : 27; });
            this.force
                .linkDistance(function (d) {
                if (d.source.sizeType == "M" && d.target.sizeType == "M")
                    return CV.ForceGraph_CircleUI.CARD_DISTANCE_MM;
                else if (d.source.sizeType == "L" && d.target.sizeType == "L")
                    return CV.ConnectionViewer.CARD_DISTANCE;
                else
                    return CV.ForceGraph_CircleUI.CARD_DISTANCE_LM;
            })
                .start();
        };
        ForceGraph_CircleUI.getNumberOfLines = function (computedTextLength, size) {
            if (size == "L") {
                return (computedTextLength < CV.ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_L_LENGTH) ? 1 : 2;
            }
            else if (size == "M" && computedTextLength < CV.ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_M2_LENGTH) {
                return 1;
            }
            else if (size == "M" && computedTextLength < CV.ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_M3_LENGTH) {
                return 2;
            }
            else if (size == "M") {
                return 3;
            }
            else {
                throw new Error("size '" + size + "' はサポートしていません。");
            }
        };
        ForceGraph_CircleUI.focusACardControlByCRMRecordId = function (id) {
            if (CV.forceGraph.currentFocusedCardID != id) {
                if (CV.forceGraph.currentFocusedCardID != null) {
                    for (var i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                        if (CV.connectionViewer.CRMRecordArray[i].Id == CV.forceGraph.currentFocusedCardID) {
                            CV.connectionViewer.CRMRecordArray[i].Card.Unfocus();
                            break;
                        }
                    }
                }
                CV.forceGraph.currentFocusedCardID = id;
                if (d3.select("g#" + CV.IDPrefix + id + ".circleCard .circleInCard") != null) {
                    d3.select("g#" + CV.IDPrefix + id + ".circleCard .circleInCard").attr("fill", function (d) { return CV.CardControl.getEntityColor(d.entityName); });
                }
            }
        };
        ForceGraph_CircleUI.unfocusACardControlByCRMRecordId = function (id) {
            if (d3.select("g#" + CV.IDPrefix + id + ".circleCard .circleInCard") != null) {
                d3.select("g#" + CV.IDPrefix + id + ".circleCard .circleInCard").attr("fill", "rgb(166,166,166)");
            }
        };
        ForceGraph_CircleUI.prototype.focusACardControl = function (d) {
            if (d.id.indexOf(CV.IDPrefix) == 0) {
                var id = d.id.substr(CV.IDPrefix.length);
                if (CV.forceGraph.currentFocusedCardID == id)
                    return;
                for (var i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                    var crmRecord = CV.connectionViewer.CRMRecordArray[i];
                    if (crmRecord.Id == id) {
                        crmRecord.Card.Focus();
                        break;
                    }
                }
            }
        };
        ForceGraph_CircleUI.prototype.connectionRetrieved = function (id, retrieved) {
            if (d3.select("g#" + CV.IDPrefix + id + ".circleCard") != null) {
                if (retrieved) {
                    d3.select("g#" + CV.IDPrefix + id + ".circleCard").select("text.cardToBeRetrieved").style("opacity", "0.0");
                }
                else {
                    d3.select("g#" + CV.IDPrefix + id + ".circleCard").select("text.cardToBeRetrieved").style("opacity", "1.0");
                }
            }
        };
        ForceGraph_CircleUI.UpdatePositionARole = function (r, X1, Y1, X2, Y2, reverse, index) {
            var position = new CV.Helper.Point(0, 0);
            var textAnchor;
            var dominantBaseline;
            var dx = (!reverse) ? X2 - X1 : X1 - X2;
            var dy = (!reverse) ? Y2 - Y1 : Y1 - Y2;
            var angle = Math.atan2(dy, dx);
            position.x = r * Math.cos(angle);
            position.y = r * Math.sin(angle);
            position.x += (!reverse) ? X1 : X2;
            position.y += (!reverse) ? Y1 : Y2;
            if (angle < -Math.PI / 2) {
                textAnchor = "end";
                dominantBaseline = "text-after-edge";
            }
            else if (angle < 0) {
                textAnchor = "start";
                dominantBaseline = "text-after-edge";
            }
            else if (angle < Math.PI / 2) {
                textAnchor = "start";
                dominantBaseline = "text-before-edge";
            }
            else {
                textAnchor = "end";
                dominantBaseline = "text-before-edge";
            }
            return { "position": position, "text-anchor": textAnchor, "dominant-baseline": dominantBaseline };
        };
        ForceGraph_CircleUI.prototype.initCanvasToDrag = function () {
            if (!CV.forceGraph.currentEventD3obj) {
                var drag = d3.behavior.drag()
                    .on("dragstart", function () {
                    this.isNowDragging = true;
                    d3.event.sourceEvent.preventDefault();
                    d3.event.sourceEvent.stopPropagation();
                }).on("drag", function () {
                    if (this.isNowDragging) {
                        d3.event.sourceEvent.preventDefault();
                        d3.event.sourceEvent.stopPropagation();
                        CV.forceGraph.moveCanvasPosition(d3.event.dx, d3.event.dy);
                    }
                }).on("dragend", function () {
                    this.isNowDragging = false;
                    d3.event.sourceEvent.preventDefault();
                    d3.event.sourceEvent.stopPropagation();
                });
                CV.forceGraph.setCanvasPosition(0, 0);
                d3.select("#MyDragDropRect").call(drag);
            }
        };
        ForceGraph_CircleUI.prototype.setCanvasPosition = function (x, y) {
            d3.select("#MyDragDropRect")
                .attr("data-dragx", x)
                .attr("data-dragy", y);
            d3.select("#MyDragDropG")
                .attr("transform", "translate(" + x + " " + y + ")");
        };
        ForceGraph_CircleUI.prototype.getCanvasPosition = function () {
            var x = parseInt(d3.select("#MyDragDropRect").attr("data-dragx"));
            var y = parseInt(d3.select("#MyDragDropRect").attr("data-dragy"));
            return new CV.Helper.Point(x, y);
        };
        ForceGraph_CircleUI.prototype.moveCanvasPosition = function (dx, dy) {
            d3.select("#MyDragDropG")
                .attr("transform", function () {
                var x = parseInt($("#MyDragDropRect").attr("data-dragx")) + dx;
                var y = parseInt($("#MyDragDropRect").attr("data-dragy")) + dy;
                $("#MyDragDropRect").attr("data-dragx", x);
                $("#MyDragDropRect").attr("data-dragy", y);
                return "translate(" + x + " " + y + ")";
            });
        };
        ForceGraph_CircleUI.prototype.getIdFromTitle = function (elm) {
            return $(elm).parent()[0].id;
        };
        ForceGraph_CircleUI.prototype.changeUISizeForFarCards = function () {
            this.refreshWhenUpdate();
        };
        return ForceGraph_CircleUI;
    }());
    ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_L_LENGTH = 90;
    ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_M2_LENGTH = 58;
    ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_M3_LENGTH = 96;
    ForceGraph_CircleUI.CARD_DISTANCE_LM = 163;
    ForceGraph_CircleUI.CARD_DISTANCE_MM = 146;
    CV.ForceGraph_CircleUI = ForceGraph_CircleUI;
})(CV || (CV = {}));
var CV;
(function (CV) {
    var CardControl = (function () {
        function CardControl(crmRecord) {
            this.CrmRecord = crmRecord;
            this.connectorColtrolArray = [];
            this._areConnectionsRetrieved = false;
        }
        Object.defineProperty(CardControl.prototype, "AreConnectionsRetrieved", {
            get: function () {
                return this._areConnectionsRetrieved;
            },
            set: function (retrieved) {
                this._areConnectionsRetrieved = retrieved;
                CV.forceGraph.connectionRetrieved(this.CrmRecord.Id, retrieved);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CardControl.prototype, "IsFocused", {
            get: function () {
                return this._isFocused;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CardControl.prototype, "EntityLogicalName", {
            get: function () {
                return this.CrmRecord.EntityLogicalName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CardControl.prototype, "EntitySchemaName", {
            get: function () {
                return this.CrmRecord.EntitySchemaName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CardControl.prototype, "ObjectTypeCode", {
            get: function () {
                return this.CrmRecord.ObjectTypeCode;
            },
            enumerable: true,
            configurable: true
        });
        CardControl.prototype.AddConnectionConltrol = function (con) {
            this.connectorColtrolArray.push(con);
        };
        CardControl.prototype.Focus = function () {
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
                    CV.connectionViewer.clm.AddFocusedId(record.Id);
                    CV.connectionViewer.ShowCardsAndConnectors(record, CV.connectionViewer.crmAccess.asyncRetrievedConnRetrievedEC, CV.connectionViewer.crmAccess.asyncRetrievedConnTargetCRMRecordRetrievedEC, CV.connectionViewer.crmAccess.asyncRetrievedOTMRRetrievedECDic, CV.connectionViewer.crmAccess.asyncRetrievedMTORRetrievedECDic, CV.connectionViewer.crmAccess.asyncRetrievedMTMRRetrievedECDic, CV.connectionViewer.crmAccess.asyncRetrievedMTMRTargetCRMRecordRetrievedECDic);
                    if (CV.connectionViewer.IS_CardsLaout_Replaying)
                        setTimeout(CV.connectionViewer.clm.nextCardsLayoutReplay, 100);
                    if (CV.connectionViewer.config.SmallerSizeEnabled)
                        CV.forceGraph.changeUISizeForFarCards();
                });
            }
            else {
                setTimeout(function () {
                    if (CV.connectionViewer.config.SmallerSizeEnabled)
                        CV.forceGraph.changeUISizeForFarCards();
                }, 100);
            }
        };
        CardControl.prototype.Unfocus = function () {
            this._isFocused = false;
            CV.ForceGraph_CircleUI.unfocusACardControlByCRMRecordId(this.CrmRecord.Id);
        };
        CardControl.prototype.GetIcon32Url = function () {
            return CardControl.GetIcon32UrlStatic(this.CrmRecord.ObjectTypeCode, this.EntitySchemaName);
        };
        CardControl.GetIcon32UrlStatic = function (objectTypeCode, entitySchemaName) {
            if (objectTypeCode < 10000) {
                var name;
                if (entitySchemaName == "Incident")
                    name = "Cases";
                else if (entitySchemaName == "SalesOrder")
                    name = "Order";
                else if (entitySchemaName == "SystemUser")
                    name = "User";
                else
                    name = entitySchemaName;
                return "/_imgs/Navbar/ActionImgs/" + name + "_32.png";
            }
            else {
                return "/_imgs/Navbar/ActionImgs/CustomEntity_32.png";
            }
        };
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
    CardControl.CARD_WIDTH = 128;
    CardControl.CARD_HEIGHT = 40;
    CardControl.EMPTY_EXPLANATION_STRING = "<<空です>>";
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
