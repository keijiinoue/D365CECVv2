/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.options.ts" />
/// <reference path="cv.helper.ts" />


namespace CV {
    /**
    * CRMレコードを表すクラス。ただし、つながりレコードについては対象としない。
    * @class
    */
    export class CRMRecord {
        /**
        * このレコードのID（GUID)。小文字。
        * @property
        */
        Id: string;
        /**
        * エンティティのロジカル名。小文字。"account"など。
        * @property
        */
        EntityLogicalName: string;
        /**
        * エンティティのスキーマ名。大文字で始まる。"Account"など。
        * @property
        */
        EntitySchemaName: string;
        /**
        * エンティティのObjectTypeCode。
        * カスタムエンティティの場合には必須の情報である。
        * @property
        */
        ObjectTypeCode: number;
        /**
        * レコードを表す表示名
        * @property
        */
        DisplayName: string;
        /**
        * レコードの画像データ
        * @property
        */
        EntityImage: string;
        /**
        * レコードのエンティティの表示名
        * @property
        */
        DisplayEntityName: string;
        /**
        * つながり情報が取得されたかどうか
        * @property
        */
        private _areConnectionsRetrieved: boolean;
        get AreConnectionsRetrieved(): boolean {
            return this._areConnectionsRetrieved;
        }
        set AreConnectionsRetrieved(value: boolean) {
            this._areConnectionsRetrieved = value;
            if (value && this.Card != null) {
                this.Card.AreConnectionsRetrieved = true;
            }
        }
        /**
        * CRMLinkの配列
        * @property
        */
        CRMLinkArray: CRMLink[];
        /**
        * 対応するCardControl
        * @property
        */
        public Card: CV.CardControl;
        /**
        * CRM上のレコードのデータ。Entity。
        * すべてのCRMRecordクラスのインスタンスで、このEntityRecordが存在する訳では無い。
        * 例えば、つながりレコードを取得した際に入手した情報では、カードの表示名やIDは取得できるが、
        * CRMレコードを取得した訳では無いため。
        * @property
        */
        EntityRecord: Object;
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
        constructor(id: string, entityLogicalName: string, entitySchemaName: string, displayName: string, entityImage: string, displayEntityName: string, objectTypeCode: number, entityRecord: Object) {
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
        /**
        * このCRMレコードに基づいて、カードコントロールを作成する。
        * DisplayNameの値が設定されている場合にこのメソッドを利用する。
        * DisplayNameの値がnullの場合には、「空ですよ」を意味する表示をする。
        * position が渡されなかった場合には、そのカードは固定されない。
        * @function
        */
        CreateCardControlWithDisplayName(position: { x: number; y: number }, _fixed: boolean): void {
            this.Card = new CardControl(this);
            this.Card.DisplayName = (this.DisplayName != null) ? this.DisplayName : ""; // この時点では、すでにDisplayNameの情報は設定されているはずなので、空であれば、明示的にその旨を表示するためにstring.Emptyを入力している。

            this.Card.NavigateUri = (CV.connectionViewer.IS_DEMO_MODE) ? "" : Xrm.Page.context.getClientUrl() + "/main.aspx?etn=" + this.EntityLogicalName + "&pagetype=entityrecord&id=%7B" + this.Id
                + "%7D&histKey=" + Math.floor(Math.random() * 1000).toString() + "&newWindow=true";

            this.Card.CrmRecord = this;

            if (position) {
                CV.forceGraph.addNode({ name: this.DisplayName, entityImage: this.EntityImage, id: this.Id, iconURL: CV.CardControl.GetIcon32UrlStatic(this.ObjectTypeCode, this.EntitySchemaName), x: position.x, y: position.y, fixed: _fixed, entityName: this.Card.EntityLogicalName });
            } else {
                CV.forceGraph.addNode({ name: this.DisplayName, entityImage: this.EntityImage, id: this.Id, iconURL: CV.CardControl.GetIcon32UrlStatic(this.ObjectTypeCode, this.EntitySchemaName), x: null, y: null, fixed: null, entityName: this.Card.EntityLogicalName });
            }
        }
    }
    /**
    * メモ（annotation）エンティティのレコードを表すクラス。CV.CardsLayout のデータを documentbody 属性の値として扱う。
    * CRMRecord クラスを継承している。
    * @class
    */
    export class CRMAnnocationRecord extends CRMRecord {
        /**
        * レコードの件名
        * @property
        */
        Subject: string;
        /**
        * レコードのドキュメント本体。ここに、CV.CardsLayout のデータが格納される。
        * @property
        */
        Documentbody: string;
        /**
        * レコードの説明
        * @property
        */
        Notetext: string;
        /**
        * レコードの作成者の GUID
        * @property
        */
        CreatedbyValue: string;
        /**
        * レコードの作成者の表示名
        * @property
        */
        CreatedbyFormattedValue: string;
        /**
        * レコードの作成日時（UTC）
        * 例： "2017-03-29T05:52:54Z"
        * @property
        */
        Createdon: string;
        /**
        * レコードの作成日時のユーザーローカライズされた文字列
        * 例： "2017/03/29 14:52"
        * @property
        */
        CreatedonFormattedValue: string;
        /**
        * レコードの更新者の GUID
        * @property
        */
        ModifiedbyValue: string;
        /**
        * レコードの更新者の表示名
        * @property
        */
        ModifiedbyFormattedValue: string;
        /**
        * レコードの更新日時（UTC）
        * 例： "2017-03-29T05:52:54Z"
        * @property
        */
        Modifiedon: string;
        /**
        * レコードの更新日時のユーザーローカライズされた文字列
        * 例： "2017/03/29 14:52"
        * @property
        */
        ModifiedonFormattedValue: string;
        /**
        * コンストラクタ
        */
        constructor(id: string,
            entityLogicalName: string,
            entitySchemaName: string,
            displayName: string,
            displayEntityName: string,
            objectTypeCode: number,
            entityRecord: Object,
            subject: string,
            documentbody: string,
            notetext: string,
            createdbyValue: string,
            createdbyFormattedValue: string,
            createdon: string,
            createdonFormattedValue: string,
            modifiedbyValue: string,
            modifiedbyFormattedValue: string,
            modifiedon: string,
            modifiedonFormattedValue: string
        ) {
            super(id, entityLogicalName, entitySchemaName, displayName, null, displayEntityName, objectTypeCode, entityRecord);
            this.Subject = subject;
            this.Documentbody = documentbody;
            this.Notetext = notetext;
            this.CreatedbyValue = createdbyValue;
            this.CreatedbyFormattedValue = createdbyFormattedValue;
            this.Createdon = createdon;
            this.CreatedonFormattedValue = createdonFormattedValue
            this.ModifiedbyValue = modifiedbyValue;
            this.ModifiedbyFormattedValue = modifiedbyFormattedValue;
            this.Modifiedon = modifiedon;
            this.ModifiedonFormattedValue = modifiedonFormattedValue;
        }
    }
}

