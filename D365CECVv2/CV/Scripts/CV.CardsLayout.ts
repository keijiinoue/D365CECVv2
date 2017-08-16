namespace CV {
    /**
    * カード群が展開されたレイアウトを表すクラス
    * Dynamics 365 (CRM) のメモ（annotation）エンティティのレコード内の documentbody 属性の値として保管される。
    * @class
    */
    export class CardsLayout {
        /**
        * フォーカスされて、まだ関連データを取得していなくって、関連データを取得してレコードがある場合のカードの CRMRecord の ID の配列。
        * 一番最初はメインの CRMRecord を表すレコードの ID である。
        * @property
        */
        FocusedIdList: string[];
        /**
        * カードの配列。
        * @property
        */
        CardList: SingleCardLayout[];
        /**
        * 最後にフォーカスされていたカードの ID
        * @property
        */
        LastFocusedId: string;
        /**
        * キャンバス全体の表示位置が移動された移動量を表すオブジェクト。
        * @property
        */
        CanvasTranslated: { x: number, y: number };
        /**
        *
        * @constructor
        */
        constructor() {
            this.FocusedIdList = [];
            this.CardList = [];
            this.CanvasTranslated = { x: 0, y: 0 };
        }
        /**
         * オブジェクトを受け取り、新規のCardsLayoutインスタンスを返す。
         * 問題がある場合には、null を返す。
         * @param obj {Object} CRMから取得したメモレコードのdocumentbodyをパースしたオブジェクト。JSON.parse(decodeURI(atob(annotationWebAPIRecord.EntityRecord["documentbody"]))) としていることを想定している。
         */
        static getCardsLayoutFromObject(obj: Object): CardsLayout {
            let focusedIdList = obj["FocusedIdList"];
            let lastFocusedId = obj["LastFocusedId"];
            let cardList = obj["CardList"];
            let canvasTranslated = obj["CanvasTranslated"];

            if (focusedIdList && cardList) {
                let cardsLayout = new CardsLayout();
                cardsLayout.FocusedIdList = focusedIdList;
                cardsLayout.LastFocusedId = lastFocusedId;
                cardsLayout.CardList = cardList;
                if (canvasTranslated.x && canvasTranslated.y) cardsLayout.CanvasTranslated = canvasTranslated;
                else cardsLayout.CanvasTranslated = { x: 0, y: 0 };

                return cardsLayout;
            }

            return null;
        }
        /*
        * 指定したレコードのIDから、CardListを検索して、合致するCRMRecordIdを持つSingleCardLayoutを返す。
        * なければ null を返す。
        * @function
        */
        getCardByRecordId(id: string): SingleCardLayout {
            for (let i = 0; i < this.CardList.length; i++) {
                if (id == this.CardList[i].CRMRecordId) return this.CardList[i];
            }
            return null;
        }
    }
    /**
    * １枚のカード群が持つレイアウトを表すクラス
    * @class
    */
    export class SingleCardLayout {
        CRMRecordId: string;
        X: number;
        Y: number;
        Fixed: boolean;

        constructor(cRMRecordId: string, x: number, y: number, fixed: boolean) {
            if (!(cRMRecordId && x && y)) throw new Error("SingleCardLayout のコンストラクタに渡された引数に値を含まないものがあります。");
            this.CRMRecordId = cRMRecordId;
            this.X = x;
            this.Y = y;
            this.Fixed = fixed ? true : false;
        }
    }
}