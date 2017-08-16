var CV;
(function (CV) {
    /**
    * カード群が展開されたレイアウトを表すクラス
    * Dynamics 365 (CRM) のメモ（annotation）エンティティのレコード内の documentbody 属性の値として保管される。
    * @class
    */
    var CardsLayout = (function () {
        /**
        *
        * @constructor
        */
        function CardsLayout() {
            this.FocusedIdList = [];
            this.CardList = [];
            this.CanvasTranslated = { x: 0, y: 0 };
        }
        /**
         * オブジェクトを受け取り、新規のCardsLayoutインスタンスを返す。
         * 問題がある場合には、null を返す。
         * @param obj {Object} CRMから取得したメモレコードのdocumentbodyをパースしたオブジェクト。JSON.parse(decodeURI(atob(annotationWebAPIRecord.EntityRecord["documentbody"]))) としていることを想定している。
         */
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
        /*
        * 指定したレコードのIDから、CardListを検索して、合致するCRMRecordIdを持つSingleCardLayoutを返す。
        * なければ null を返す。
        * @function
        */
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
    /**
    * １枚のカード群が持つレイアウトを表すクラス
    * @class
    */
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
//# sourceMappingURL=cv.cardslayout.js.map