/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.options.ts" />
/// <reference path="cv.helper.ts" />
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
    /**
    * CRMレコードを表すクラス。ただし、つながりレコードについては対象としない。
    * @class
    */
    var CRMRecord = (function () {
        /**
        * コンストラクタ
        * @constructor
        * @param {string} id
        * @param {string} entityLogicalName
        * @param {string} displayName
        * @param {string} entityImage
        * @param {string} additionalInfo
        * @param {string} displayEntityName
        * @param {number} objectTypeCode
        * @param {Objecty} entityRecord
        */
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
        /**
        * このCRMレコードに基づいて、カードコントロールを作成する。
        * DisplayNameの値が設定されている場合にこのメソッドを利用する。
        * DisplayNameの値がnullの場合には、「空ですよ」を意味する表示をする。
        * position が渡されなかった場合には、そのカードは固定されない。
        * @function
        */
        CRMRecord.prototype.CreateCardControlWithDisplayName = function (position, _fixed) {
            this.Card = new CV.CardControl(this);
            this.Card.DisplayName = (this.DisplayName != null) ? this.DisplayName : ""; // この時点では、すでにDisplayNameの情報は設定されているはずなので、空であれば、明示的にその旨を表示するためにstring.Emptyを入力している。
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
    /**
    * メモ（annotation）エンティティのレコードを表すクラス。CV.CardsLayout のデータを documentbody 属性の値として扱う。
    * CRMRecord クラスを継承している。
    * @class
    */
    var CRMAnnocationRecord = (function (_super) {
        __extends(CRMAnnocationRecord, _super);
        /**
        * コンストラクタ
        */
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
//# sourceMappingURL=cv.crmrecord.js.map