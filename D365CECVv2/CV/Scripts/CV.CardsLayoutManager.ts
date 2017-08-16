/// <reference path="cv.cardslayout.ts" />

namespace CV {
    /**
    * カード群が展開されたレイアウトを記録したり読み出したりことを管理するクラス
    * 1つのレイアウトは CV.CardsLayout クラスで管理され、そのデータは Dynamics 365 (CRM) の
    * メモ（annotation）エンティティ レコードの documentbody 属性の値として保管される。
    * なお、メモエンティティ レコードは CV.CRMAnnocationRecord クラスで管理し、
    * メインとなる CRMRecord レコードに関連するメモレコードとして保管される。
    * @class
    */
    export class CardsLayoutManager {
        /**
        * 現在利用中の CardLayout
        * @property
        */
        CurrentCardsLayout: CardsLayout;
        /**
        * 現在対象となっているメインの一番最初に表示される CRMRecord
        * @property
        */
        PrimaryCRMRecord: CRMRecord;
        /**
        * 現在 リプレイ中のカードレイアウト
        * @property
        */
        replayingCardsLayout: CardsLayout;
        /**
        * 現在 リプレイ中のカードレイアウトの中の、一番最近 展開された FocusedIdList の Index
        * @property
        */
        replayingFocusedIdIndex = 0;
        /**
        * コンストラクタ
        * CurrentCardsLayout を内部で生成する。
        * @constructor
        */
        constructor() {
            this.CurrentCardsLayout = new CardsLayout();
        }
        /**
        * CurrentCardsLayout にフォーカスされて展開されたカードの CRMRecord の ID を追加する。
        * @function
        */
        AddFocusedId(id: string): void {
            this.CurrentCardsLayout.FocusedIdList.push(id);
        }
        /**
        * 現在の CV.forceGraph 上を検索して、すべての Card を表す SingleCardLayout[] を取得する。
        * @function
        */
        GetAllCardList(): SingleCardLayout[] {
            let sclList: SingleCardLayout[] = [];
            for (let i in CV.forceGraph.forceList.nodes) {
                let node = CV.forceGraph.forceList.nodes[i];
                let id = node.id.substr(CV.IDPrefix.length);
                sclList.push(new SingleCardLayout(id, node.x, node.y, node.fixed));
            }
            return sclList;
        }
        /**
        * 現在の CV.forceGraph 上を検索して、すべての FixedCard を表す SingleCardLayout[] を取得して、
        * CurrentCardsLayout.CardList にセットする。
        * @function
        */
        SetAllCardList(): void {
            this.CurrentCardsLayout.CardList = this.GetAllCardList();
        }
        /**
        * 最後にフォーカスされていたカードの ID を、
        * CurrentCardsLayout.LastFocusedId にセットする。
        * @property
        */
        SetLastFocusedId(id: string): void {
            this.CurrentCardsLayout.LastFocusedId = id;
        }
        /**
        * 現在、キャンバス全体がどの程度表示位置が移動されたかの量を受け取り、
        * CurrentCardsLayout.CanvasTranslated にセットする。
        * @function
        */
        SetCanvasTranslated(_x: number, _y: number): void {
            this.CurrentCardsLayout.CanvasTranslated = { x: _x, y: _y };
        }
        /**
        * 現在のカードレイアウトを新規の annotation レコードとして保存する。
        * @function
        * @param notetext {string} 保存するカードレイアウトの説明の文字列
        */
        SaveCurrentCardsLayoutDeferredized(notetext: string): JQueryPromise<void> {
            let deferred: JQueryDeferred<void> = $.Deferred<void>();

            this.SetAllCardList();
            let translatedPosition = CV.forceGraph.getCanvasPosition();
            this.SetCanvasTranslated(translatedPosition.x, translatedPosition.y);

            CV.CRMAccessWebAPI.createAnnotationRecordForCardsLayoutDeferredized(this.CurrentCardsLayout, notetext)
                .then(() => {
                    deferred.resolve();
                }).fail((e) => {
                    deferred.reject(e.toString());
                });

            return deferred.promise();
        }
        /**
        * メインのカードのレコードに保存されているカードレイアウトを取得し、CRMAnnocationRecordの配列として返す。
        * @function
        */
        LoadCardsLayoutListDeferredized(): JQueryPromise<CRMAnnocationRecord[]> {
            let deferred: JQueryDeferred<CRMAnnocationRecord[]> = $.Deferred<CRMAnnocationRecord[]>();

            CV.CRMAccessWebAPI.retrieveAnnotationRecordForCardsLayoutDeferredized(null)
                .then((records: WebAPIRecord[]) => {
                    let annotationRecords: CRMAnnocationRecord[] = [];

                    for (let i = 0; i < records.length; i++) {
                        let record = records[i];
                        let annotation = new CRMAnnocationRecord(
                            record.EntityRecord["annotationid"], // record.getId(CV.connectionViewer)は使えないはず、annotation エンティティのメタデータを取得していないから。
                            "annotation",
                            "Annotation",
                            "つながりビューワーのカードレイアウト",
                            "メモ",
                            5,
                            record.EntityRecord,
                            "つながりビューワーのカードレイアウト",
                            record.EntityRecord["documentbody"],
                            record.EntityRecord["notetext"],
                            record.EntityRecord["_createdby_value"],
                            record.EntityRecord["_createdby_value@OData.Community.Display.V1.FormattedValue"],
                            record.EntityRecord["createdon"],
                            record.EntityRecord["createdon@OData.Community.Display.V1.FormattedValue"],
                            record.EntityRecord["_modifiedby_value"],
                            record.EntityRecord["_modifiedby_value@OData.Community.Display.V1.FormattedValue"],
                            record.EntityRecord["modifiedon"],
                            record.EntityRecord["modifiedon@OData.Community.Display.V1.FormattedValue"]
                        );

                        annotationRecords.push(annotation);
                    }

                    deferred.resolve(annotationRecords);
                }).fail((e) => {
                    deferred.reject(e.toString());
                });

            return deferred.promise();
        }
        /**
        * URLのパラメーターにカードレイアウトの指定があるかどうかを判断し、指定があれば
        * カードレイアウトのデータをCRMから取得し、そのカードレイアウトのリプレイを開始する。
        * 引数のオブジェクトには何も手を加えない。
        * 戻り値はオブジェクトで、recordが引数のオブジェクトで何も手を加えていないもの。existCardLayoutが、再生するCardLayoutが存在した場合は true を保持する。
        * @function
        */
        initCardsLayoutReplayDeferredized(_record: WebAPIRecord): JQueryPromise<{ record: WebAPIRecord; existCardLayout: boolean }> {
            let deferred: JQueryDeferred<{ record: WebAPIRecord; existCardLayout: boolean }> = $.Deferred<{ record: WebAPIRecord; existCardLayout: boolean }>();
            ///console.log("in initCardsLayoutReplayDeferredized 開始");

            // 例：独立したウィンドウで表示している場合の decodedDataParams
            //      "id={0683f907-720f-e711-80e8-480fcff29761}&typename=contact&annotationId=1399ecc2-fa35-e711-80f2-480fcff207f1&annotationId=690ded10-0e36-e711-80f2-480fcff207f1"
            // 例：フォーム内で表示している場合の decodedDataParams
            //      "annotationId=1f930e8c-0e36-e711-80f2-480fcff207f1"
            let annotationId = CV.connectionViewer.getAnnotationIdFromParams();
            ///console.log("annotationId = " + annotationId);

            if (annotationId) {
                // カードレイアウトのデータをCRMから取得する
                CV.CRMAccessWebAPI.retrieveAnnotationRecordForCardsLayoutDeferredized(annotationId)
                    .then((annotationWebAPIRecords) => {
                        let annotationWebAPIRecord = annotationWebAPIRecords[0] // １件しかないはず
                        let obj = JSON.parse(decodeURI(atob(annotationWebAPIRecord.EntityRecord["documentbody"])));
                        let cardsLayout: CardsLayout = CV.CardsLayout.getCardsLayoutFromObject(obj);

                        CV.connectionViewer.clm.replayingCardsLayout = cardsLayout;
                        CV.connectionViewer.clm.replayingFocusedIdIndex = 0;
                        CV.connectionViewer.translateCanvas(cardsLayout.CanvasTranslated.x, cardsLayout.CanvasTranslated.y);
                        ConnectionViewer.showCurrentlyRetrievingStoryboard(true);

                        ///console.log("in initCardsLayoutReplayDeferredized 最終");
                        deferred.resolve({ record: _record, existCardLayout: true });
                    })
                    .fail((e) => {

                        ConnectionViewer.showCurrentlyRetrievingStoryboard(false);

                        ///console.log("in initCardsLayoutReplayDeferredized 最終");
                        deferred.reject(e.message);
                    });
            } else {
                deferred.resolve({ record: _record, existCardLayout: false });
            }
            return deferred.promise();
        }
        /**
        * カードレイアウトのリプレイを継続する。
        * @function
        */
        nextCardsLayoutReplay(): void {
            ///console.log("In nextCardsLayoutReplay. this.replayingFocusedIdIndex =", CV.connectionViewer.clm.replayingFocusedIdIndex);

            // FocusedIdList の処理
            if (CV.connectionViewer.clm.replayingFocusedIdIndex < CV.connectionViewer.clm.replayingCardsLayout.FocusedIdList.length - 1) {
                CV.connectionViewer.clm.replayingFocusedIdIndex++;

                // 次にフォーカスすべきカードの CRMRecord の Id
                let id = CV.connectionViewer.clm.replayingCardsLayout.FocusedIdList[CV.connectionViewer.clm.replayingFocusedIdIndex];
                let crmRecord = CV.connectionViewer.findCRMRecordById(id);
                // 権限などの理由でその id を持つものを取得していない場合がある。
                if (crmRecord) {
                    let cardControl = crmRecord.Card;
                    cardControl.Focus();
                } else {
                    ///console.log("No crmRecord in nextCardsLayoutReplay()");
                    setTimeout(CV.connectionViewer.clm.nextCardsLayoutReplay, 100); // ここでは、this.nextCardsLayoutReplay としてはいけない。
                }
            } else {
                // 最後にフォーカスされていたカードをフォーカスする
                let id = CV.connectionViewer.clm.replayingCardsLayout.LastFocusedId;
                let crmRecord = CV.connectionViewer.findCRMRecordById(id);
                // 権限などの理由でその id を持つものを取得していない場合がある。
                if (crmRecord) {
                    let cardControl = crmRecord.Card;
                    cardControl.Focus();
                }

                // カードレイアウトのリプレイを終了
                CV.connectionViewer.IS_CardsLaout_Replaying = false;
                ConnectionViewer.showCurrentlyRetrievingStoryboard(false);
            }
        }
        /**
         * リプレイ中のCardsLayoutの中で指定した ID のものがあれば、そのSingleCardLayoutインスタンスを返す。
         * なければnullを返す。
         * @param id
         */
        findCardInReplaying(id: string): SingleCardLayout {
            if (this.replayingCardsLayout) {
                for (let i = 0; i < this.replayingCardsLayout.CardList.length; i++) {
                    let cardLayout = this.replayingCardsLayout.CardList[i];
                    if (id == cardLayout.CRMRecordId) {
                        return cardLayout;
                    }
                }
            }
            return null;
        }
    }
}